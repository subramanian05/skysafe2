// Mock data for the Alerts section. Everything here is generated locally —
// no real subscribers, phone numbers or flight records.

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

const rand = mulberry32(20261008);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));

const SERIAL_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
const serial = (len = 16) =>
  Array.from({ length: len }, () => SERIAL_CHARS[Math.floor(rand() * SERIAL_CHARS.length)]).join('');

export const MODELS = [
  'DJI Mini 4 Pro', 'DJI Mini 5 Pro', 'DJI Mini 3', 'DJI Mini 4K', 'DJI Air 2S', 'DJI Air 3S',
  'DJI Mavic Air 2', 'DJI Mavic 3 Thermal', 'DJI Mavic 3 Pro', 'DJI Matrice 4E', 'DJI Neo 2',
  'Skydio X10', 'Autel EVO Lite+',
];

export const SOURCES = ['DJI OcuSync', 'Remote ID', 'Radar'];

export const AFFILIATIONS = ['unknown', 'friend', 'neutral', 'suspect', 'hostile'];

export const AFFILIATION_COLOR = {
  unknown: '#f5e050',
  friend: '#42d4f4',
  neutral: '#4caf6a',
  suspect: '#ffb74d',
  hostile: '#ef5350',
};

// Alert-zone style triggers, plus per-drone ("watch") triggers.
const ZONE_NAMES = [
  'CHU', 'CHU-SUR', 'IMB', 'IMB-SUR', 'OTM-US', 'OTM-MX', 'SYS-US', 'SYS-MX',
  'RGV-MX BZ 1', 'RGV-MX BZ 9', 'RGV-RGC 001', 'RGV-RGC 002', 'RGV-RGC 004', 'RCV-RGC 003',
  'Nogales-TCA-BZ-019', 'Nogales-TCA-MX-BZ-021', 'Nogales Border Patrol Station',
];

const ZONE_CENTERS = {
  CHU: [32.57, -117.04], 'CHU-SUR': [32.56, -117.06], IMB: [32.55, -117.08],
  'IMB-SUR': [32.54, -117.1], 'OTM-US': [31.33, -111.0], 'OTM-MX': [31.3, -111.02],
  'SYS-US': [32.54, -117.03], 'SYS-MX': [32.53, -117.03],
};

const zoneCenter = (name) => ZONE_CENTERS[name] ?? [26.1 + rand() * 0.4, -98.6 + rand() * 0.8];

/** A square-ish polygon around a centre, for the trigger detail map. */
function zonePolygon([lat, lng], km = 1.4) {
  const dLat = km / 111;
  const dLng = km / (111 * Math.cos((lat * Math.PI) / 180));
  return [
    [lat + dLat, lng - dLng], [lat + dLat, lng + dLng],
    [lat - dLat, lng + dLng], [lat - dLat, lng - dLng], [lat + dLat, lng - dLng],
  ];
}

export const TRIGGERS = [
  ...ZONE_NAMES.map((name, i) => {
    const center = zoneCenter(name);
    return {
      id: `zone-${i + 1}`,
      kind: 'zone',
      name,
      color: '#ff0000',
      enabled: true,
      center,
      polygon: zonePolygon(center, 0.8 + rand() * 2),
      createdAt: `2025-0${int(1, 9)}-${String(int(10, 28)).padStart(2, '0')}`,
      subscribers: int(2, 26),
      alerts30d: int(0, 180),
    };
  }),
  ...Array.from({ length: 24 }, (_, i) => {
    const model = pick(MODELS);
    const center = [26.0 + rand() * 6, -117 + rand() * 19];
    return {
      id: `watch-${i + 1}`,
      kind: 'watch',
      name: `${model} - ${serial(4)}`,
      color: '#42d4f4',
      enabled: rand() > 0.1,
      center,
      polygon: null,
      createdAt: `2026-0${int(1, 9)}-${String(int(10, 28)).padStart(2, '0')}`,
      subscribers: int(1, 9),
      alerts30d: int(0, 40),
    };
  }),
].sort((a, b) => a.name.localeCompare(b.name));

const HOURS_BACK = 72;

/** Feed shown on Recent Activity, newest first. */
export const RECENT_ALERTS = Array.from({ length: 60 }, (_, i) => {
  const trigger = pick(TRIGGERS);
  const minutesAgo = Math.round((i * HOURS_BACK * 60) / 60 + rand() * 40);
  return {
    id: `alert-${i + 1}`,
    type: trigger.kind === 'zone' ? 'trigger' : 'watch',
    triggerId: trigger.id,
    label: trigger.kind === 'zone' ? trigger.name : serial(16),
    affiliation: rand() > 0.82 ? pick(['neutral', 'suspect', 'friend']) : 'unknown',
    at: Date.now() - minutesAgo * 60_000,
    source: pick(SOURCES),
    model: pick(MODELS),
    flightId: `flight-${i + 1}`,
  };
}).sort((a, b) => b.at - a.at);

/** Per-trigger history, as the trigger detail page shows it. */
export function historicalAlerts(triggerId, count = 22) {
  const r = mulberry32(triggerId.split('').reduce((a, c) => a + c.charCodeAt(0), 7));
  return Array.from({ length: count }, (_, i) => ({
    id: `${triggerId}-h${i}`,
    at: Date.now() - (i * 7 + r() * 9) * 3600_000,
    affiliation: r() > 0.85 ? 'neutral' : 'unknown',
    targetId: Array.from({ length: 16 }, () => SERIAL_CHARS[Math.floor(r() * SERIAL_CHARS.length)]).join(''),
    model: MODELS[Math.floor(r() * MODELS.length)],
  })).sort((a, b) => b.at - a.at);
}

export const WATCHED_DRONES = Array.from({ length: 21 }, (_, i) => ({
  id: `wd-${i + 1}`,
  serial: serial(16),
  model: pick(MODELS),
  source: 'CBP Users',
  status: rand() > 0.12 ? 'Active' : 'Paused',
  email: rand() > 0.15,
  sms: rand() > 0.75,
  createdAt: Date.now() - int(1, 60) * 86400_000,
}));

// ---- Notifications Center ------------------------------------------------

const FIRST = ['Avery', 'Jordan', 'Riley', 'Casey', 'Morgan', 'Quinn', 'Rowan', 'Sawyer', 'Devon', 'Harper', 'Emerson', 'Reese'];
const LAST = ['Marsh', 'Okafor', 'Delgado', 'Nakamura', 'Petrov', 'Holloway', 'Castellanos', 'Brennan', 'Adeyemi', 'Lindqvist', 'Vargas', 'Whitfield'];

export const SUBSCRIBERS = Array.from({ length: 83 }, (_, i) => {
  const name = `${pick(FIRST)} ${pick(LAST)}`;
  const handle = name.toLowerCase().replace(/[^a-z]+/g, '.');
  const hasPhone = rand() > 0.45;
  const channels = hasPhone ? (rand() > 0.6 ? ['SMS', 'EMAIL'] : ['SMS']) : ['EMAIL'];
  return {
    id: `sub-${i + 1}`,
    name,
    email: `${handle}@example.gov`,
    phone: hasPhone ? `+1555${String(int(1000000, 9999999))}` : null,
    channels,
    triggers: int(1, 14),
  };
});

export const NOTIFICATION_KPIS = {
  subscribers: SUBSCRIBERS.length,
  triggers: TRIGGERS.length,
  emailsSent: 38625,
  smsSent: 4180,
  deliveryRate: 99.8,
  processing: 1,
  failed: 125,
  deltas: { emailsSent: 6.2, deliveryRate: 0.1, processing: 0, failed: -14.3 },
};

/** Daily email/SMS volume for the selected range, with the previous period. */
export function notificationSeries(days = 30) {
  const r = mulberry32(991);
  return Array.from({ length: days }, (_, i) => {
    const base = 900 + Math.round(400 * Math.sin((i / days) * Math.PI * 2.5));
    const email = Math.max(0, base + Math.round((r() - 0.5) * 420));
    const sms = Math.max(0, Math.round(email * (0.08 + r() * 0.07)));
    return {
      t: Date.now() - (days - 1 - i) * 86400_000,
      email,
      sms,
      total: email + sms,
      emailPrev: Math.max(0, Math.round(email * (0.8 + r() * 0.4))),
      smsPrev: Math.max(0, Math.round(sms * (0.8 + r() * 0.4))),
      totalPrev: Math.max(0, Math.round((email + sms) * (0.82 + r() * 0.35))),
    };
  });
}

export const DELIVERY_STATUS = {
  email: [
    { name: 'Delivered', value: 38200 },
    { name: 'Sent', value: 300 },
    { name: 'Undelivered', value: 125 },
  ],
  sms: [
    { name: 'Delivered', value: 4062 },
    { name: 'Sent', value: 84 },
    { name: 'Undelivered', value: 34 },
  ],
};

export const CHANNEL_COVERAGE = [
  { name: 'Email only', value: SUBSCRIBERS.filter((s) => s.channels.length === 1 && s.channels[0] === 'EMAIL').length },
  { name: 'SMS only', value: SUBSCRIBERS.filter((s) => s.channels.length === 1 && s.channels[0] === 'SMS').length },
  { name: 'Email + SMS', value: SUBSCRIBERS.filter((s) => s.channels.length > 1).length },
];

export const TOP_TRIGGERS_BY_SUBSCRIBERS = [...TRIGGERS]
  .sort((a, b) => b.subscribers - a.subscribers)
  .slice(0, 8)
  .map((t) => ({ name: t.name, value: t.subscribers }));

export const DELIVERY_STATUSES = ['Delivered', 'Sent', 'Processing', 'Dropped', 'Bounced'];

/** Rows for the Activity Log tab. */
export const ACTIVITY_LOG = Array.from({ length: 300 }, (_, i) => {
  const sub = pick(SUBSCRIBERS);
  const type = sub.channels.includes('SMS') && rand() > 0.6 ? 'SMS' : 'EMAIL';
  const roll = rand();
  const status = roll > 0.06 ? 'Delivered' : roll > 0.03 ? 'Dropped' : roll > 0.015 ? 'Bounced' : 'Processing';
  return {
    id: `log-${i + 1}`,
    at: Date.now() - i * 11 * 60_000 - Math.round(rand() * 400_000),
    type,
    recipient: sub.name,
    contact: type === 'SMS' ? sub.phone ?? '—' : sub.email,
    trigger: pick(TRIGGERS).name,
    status,
    detail: status === 'Dropped' ? 'Recipient address suppressed' : status === 'Bounced' ? 'Mailbox unavailable' : '',
  };
});

export const ACTIVITY_TOTAL = 60803;

export const DATE_PRESETS = [
  { id: '7d', label: 'Last 7 Days', days: 7 },
  { id: '30d', label: 'Last 30 Days', days: 30 },
  { id: '90d', label: 'Last 90 Days', days: 90 },
  { id: '365d', label: 'Last 365 Days', days: 365 },
];

export const TIMEZONES = [
  'America/Anchorage (Alaska)', 'America/Chicago (Central)', 'America/Denver (Mountain)',
  'America/Los_Angeles (Pacific)', 'America/New_York (Eastern)', 'America/Phoenix (Arizona)',
  'Pacific/Honolulu (Hawaii)', 'UTC',
];
