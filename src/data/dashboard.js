// Sample dashboard data — generated locally, deterministic per filter combination.

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export const REGIONS = [
  { id: 'brownsville', name: 'Brownsville, TX', center: [25.9718, -97.2889], tz: 'CDT' },
  { id: 'nogales', name: 'Nogales, AZ', center: [31.3477, -110.9613], tz: 'MST' },
  { id: 'rgv', name: 'Rio Grande Valley, TX', center: [26.3368, -98.8079], tz: 'CDT' },
  { id: 'sandiego', name: 'San Diego, CA', center: [32.75, -117.14], tz: 'PDT' },
];

export const PERIODS = [
  { id: 'day', label: 'Last Full Day', days: 1 },
  { id: '7d', label: 'Last 7 Full Days', days: 7 },
  { id: '30d', label: 'Last 30 Full Days', days: 30 },
  { id: '6mo', label: 'Last 6 Months', days: 182 },
  { id: '12mo', label: 'Last 12 Months', days: 365 },
  { id: 'ytd', label: 'Year to Date', days: 'ytd' },
];

export const AFFILIATION_FILTERS = [
  { id: 'all', label: 'All Affiliations' },
  { id: 'suspect', label: 'Suspect' },
  { id: 'hostile', label: 'Hostile' },
];

const TAGS = [
  'US/MX Border Area (North, 2mi)',
  'High Altitude',
  'High Speed',
  'Night Flight',
  'US/MX Border Area (South, 2mi)',
  'US/MX Border Violation (100m)',
  'FAA Auth. Req. (KBRO)',
  'US/MX Border Area (North, 500m)',
  'US/MX Border Crossing',
];

const MODELS = [
  'DJI Mavic 4 Pro (512 GB)', 'DJI Mini 4 Pro', 'DJI Mini 5 Pro', 'DJI Matrice 4T',
  'DJI Mavic 3 Thermal', 'Skydio X10', 'DJI Matrice 30T', 'DJI Mini 3',
  'DJI Air 3S', 'DJI Matrice 4E', 'DJI Agras T100',
];

const SERIAL_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
function serial(rand, len = 16) {
  let s = '';
  for (let i = 0; i < len; i++) s += SERIAL_CHARS[Math.floor(rand() * SERIAL_CHARS.length)];
  return s;
}

export function periodDays(period, now = new Date()) {
  const p = PERIODS.find((x) => x.id === period) ?? PERIODS[2];
  if (p.days !== 'ytd') return p.days;
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.max(1, Math.round((now - start) / 86400000));
}

/** Everything the dashboard renders, for one filter combination. */
export function buildDashboard({ region, period, affiliation }, now = new Date()) {
  const days = periodDays(period, now);
  const rand = mulberry32(hash(`${region}|${period}|${affiliation}`));
  const scale = affiliation === 'all' ? 1 : affiliation === 'suspect' ? 0.02 : 0.004;

  // ---- flights per day (current + previous period) ----
  const buckets = Math.min(days, 30);
  const bucketDays = days / buckets;
  const base = 35 + rand() * 25;
  const flightsPerDay = Array.from({ length: buckets }, (_, i) => {
    const seasonal = 1 + 0.25 * Math.sin((i / buckets) * Math.PI * 3);
    const flights = Math.max(0, Math.round(base * seasonal * (0.6 + rand() * 0.9) * bucketDays * scale * (affiliation === 'all' ? 1 : 1)));
    const previous = Math.max(0, Math.round(flights * (0.7 + rand() * 0.7)));
    return { label: buckets === days ? `Day ${i + 1}` : `P${i + 1}`, flights, previous };
  });

  const total = flightsPerDay.reduce((a, d) => a + d.flights, 0);
  const totalPrev = flightsPerDay.reduce((a, d) => a + d.previous, 0);
  const suspect = Math.round(total * 0.005 + rand() * 4);
  const suspectPrev = Math.max(1, Math.round(suspect * (0.5 + rand())));
  const hostile = rand() > 0.75 ? Math.round(rand() * 3) : 0;
  const hostilePrev = rand() > 0.5 ? Math.round(rand() * 3) : 0;
  const alerts = rand() > 0.6 ? Math.round(rand() * 12) : 0;
  const alertsPrev = alerts ? Math.round(alerts * (0.6 + rand())) : 0;

  const pct = (cur, prev) => (prev === 0 ? (cur === 0 ? 0 : 100) : ((cur - prev) / prev) * 100);

  const kpis = [
    { key: 'total', label: 'Total Drone Flights', value: total, delta: pct(total, totalPrev), tone: 'neutral' },
    { key: 'suspect', label: 'Suspect Drone Flights', value: suspect, delta: pct(suspect, suspectPrev), tone: 'warning' },
    { key: 'hostile', label: 'Hostile Drone Flights', value: hostile, delta: pct(hostile, hostilePrev), tone: 'critical' },
    { key: 'alerts', label: 'Alert Zone Triggers', value: alerts, delta: pct(alerts, alertsPrev), tone: 'info' },
  ];

  // ---- weekday x hour heatmap ----
  const heatmap = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => {
      const daylight = h >= 6 && h <= 20 ? 1 : 0.12;
      const weekend = d === 0 || d === 6 ? 1.15 : 1;
      const v = total / (buckets * 24) * daylight * weekend * (0.4 + rand() * 1.6);
      return Math.round(v * 24);
    })
  );

  // ---- takeoff hotspots ----
  const regionDef = REGIONS.find((r) => r.id === region) ?? REGIONS[0];
  const hotspots = Array.from({ length: 5 }, () => ({
    lat: regionDef.center[0] + (rand() - 0.5) * 0.18,
    lng: regionDef.center[1] + (rand() - 0.5) * 0.3,
    count: Math.round(total * (0.04 + rand() * 0.12)),
  })).sort((a, b) => b.count - a.count);

  const slice = (names, weightBias) => {
    const raw = names.map((name, i) => {
      const value = Math.max(1, Math.round(total * weightBias(i) * (0.6 + rand() * 0.8)));
      return { name, value, prev: Math.max(0, Math.round(value * (0.6 + rand() * 0.8))) };
    });
    return raw.sort((a, b) => b.value - a.value);
  };

  const tags = slice(TAGS, (i) => 0.22 / (i + 1.3));
  const models = slice(MODELS, (i) => 0.18 / (i + 1.4));
  const affiliations = [
    { name: 'Unknown', value: Math.round(total * 0.88), prev: Math.round(totalPrev * 0.86) },
    { name: 'Friend', value: Math.round(total * 0.09), prev: Math.round(totalPrev * 0.1) },
    { name: 'Suspect', value: Math.max(1, suspect), prev: suspectPrev },
  ].filter((d) => d.value > 0);

  const mostActive = Array.from({ length: 10 }, (_, i) => ({
    model: MODELS[Math.floor(rand() * MODELS.length)],
    serial: serial(rand),
    flights: Math.max(1, Math.round((total * 0.055) / (1 + i * 0.45) * (0.8 + rand() * 0.4))),
  })).sort((a, b) => b.flights - a.flights);

  // Alert-zone panels are empty unless this region triggered anything.
  const alertsByDay = alerts
    ? flightsPerDay.map((d, i) => ({ label: d.label, alerts: i % 4 === 0 ? Math.round(rand() * 3) : 0 }))
    : [];
  const topAlertZones = alerts
    ? [
        { name: 'River Bend Zone', value: Math.round(alerts * 0.5) },
        { name: 'Port of Entry', value: Math.round(alerts * 0.3) },
        { name: 'Levee North', value: Math.max(1, Math.round(alerts * 0.2)) },
      ]
    : [];

  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end.getTime() - days * 86400000);

  return {
    region: regionDef,
    days,
    range: { start, end },
    kpis,
    flightsPerDay,
    heatmap,
    hotspots,
    tags,
    models,
    affiliations,
    mostActive,
    alertsByDay,
    topAlertZones,
  };
}
