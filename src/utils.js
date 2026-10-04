import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const lastPoint = (f) => f.points[f.points.length - 1];
export const firstPoint = (f) => f.points[0];

export function timeAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const fmtDate = (ts) => dayjs(ts).format('YYYY-MM-DD');
export const fmtTime = (ts) => dayjs(ts).format('HH:mm:ss');
export const fmtDateTime = (ts) => dayjs(ts).format('YYYY-MM-DD HH:mm:ss');

export function haversine(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function fmtDistance(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m.toFixed(1)} m`;
}

export function flightStats(f) {
  const range = Math.max(...f.points.map((p) => haversine(f.home, [p.lat, p.lng])));
  const maxHat = Math.max(...f.points.map((p) => p.hat));
  return { range, maxHat };
}

export function isLive(f) {
  return Date.now() - lastPoint(f).t < 5 * 60_000;
}

export const TIME_PRESETS = [
  { label: '5m', hours: 5 / 60, name: 'Last 5 Minutes' },
  { label: '30m', hours: 0.5, name: 'Last 30 Minutes' },
  { label: '6hr', hours: 6, name: 'Last 6 Hours' },
  { label: '24hr', hours: 24, name: 'Last 24 Hours' },
  { label: '7d', hours: 24 * 7, name: 'Last 7 Days' },
  { label: '30d', hours: 24 * 30, name: 'Last 30 Days' },
  { label: '1y', hours: 24 * 365, name: 'Last Year' },
];

export const DEFAULT_FILTERS = {
  preset: '6hr',
  affiliation: [],
  manufacturer: [],
  model: [],
  modelMode: 'include',
  heightRef: 'msl',
  minHeight: '',
  weightOp: 'lt',
  weight: '',
};

export function applyFilters(flights, filters) {
  const preset = TIME_PRESETS.find((p) => p.label === filters.preset) ?? TIME_PRESETS[2];
  const since = Date.now() - preset.hours * 3600_000;
  return flights.filter((f) => {
    if (lastPoint(f).t < since) return false;
    if (filters.affiliation.length && !filters.affiliation.includes(f.affiliation)) return false;
    if (filters.manufacturer.length && !filters.manufacturer.includes(f.manufacturer)) return false;
    if (filters.model.length) {
      const hit = filters.model.includes(f.model);
      if (filters.modelMode === 'include' ? !hit : hit) return false;
    }
    if (filters.minHeight !== '') {
      const key = filters.heightRef === 'msl' ? 'msl' : 'hat';
      if (Math.max(...f.points.map((p) => p[key])) < Number(filters.minHeight)) return false;
    }
    if (filters.weight !== '' && f.weightG != null) {
      const w = Number(filters.weight);
      if (filters.weightOp === 'lt' ? !(f.weightG < w) : !(f.weightG >= w)) return false;
    }
    return true;
  });
}

export function activeFilterCount(filters) {
  let n = 0;
  if (filters.affiliation.length) n++;
  if (filters.manufacturer.length) n++;
  if (filters.model.length) n++;
  if (filters.minHeight !== '') n++;
  if (filters.weight !== '') n++;
  return n;
}

export const AFFILIATION_COLORS = {
  Unknown: '#f5e050',
  Friendly: '#4fc3f7',
  Neutral: '#81c784',
  Suspect: '#ffb74d',
  Hostile: '#ef5350',
};
