// Sample data only — invented serials and tracks around the San Diego coast.

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

export const MANUFACTURERS = ['DJI', 'Autel', 'Skydio', 'Parrot'];
export const AFFILIATIONS = ['Unknown', 'Friendly', 'Neutral', 'Suspect', 'Hostile'];

export const MODELS = [
  { model: 'DJI Neo 2', manufacturer: 'DJI', protocol: 'DJI OcuSync', weightG: 151 },
  { model: 'DJI Mini 4 Pro', manufacturer: 'DJI', protocol: 'DJI OcuSync', weightG: 249 },
  { model: 'DJI Mavic Air 2', manufacturer: 'DJI', protocol: 'DJI OcuSync', weightG: 570 },
  { model: 'DJI Mavic 4 Pro (512 GB)', manufacturer: 'DJI', protocol: 'DJI OcuSync', weightG: 1063 },
  { model: 'DJI Mini 2', manufacturer: 'DJI', protocol: 'DJI OcuSync', weightG: 249 },
  { model: 'DJI Mini 4K', manufacturer: 'DJI', protocol: 'DJI OcuSync', weightG: 249 },
  { model: 'Autel EVO Lite+', manufacturer: 'Autel', protocol: 'Remote ID', weightG: 835 },
  { model: 'Skydio X10', manufacturer: 'Skydio', protocol: 'Remote ID', weightG: 2140 },
  { model: 'Parrot Anafi USA', manufacturer: 'Parrot', protocol: 'Remote ID', weightG: 500 },
];

const SERIAL_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
function serial(rand, len = 16) {
  let s = '';
  for (let i = 0; i < len; i++) s += SERIAL_CHARS[Math.floor(rand() * SERIAL_CHARS.length)];
  return s;
}

const HOMES = [
  [32.8163, -117.2578], [32.8421, -117.2805], [32.8012, -117.2551], [32.7651, -117.2489],
  [32.7702, -117.2362], [32.7535, -117.2521], [32.8295, -117.3102], [32.7968, -117.3134],
  [32.7584, -117.3009], [32.7471, -117.2254], [32.8233, -117.2365], [32.7795, -117.2512],
  [32.7401, -117.2455], [32.8107, -117.2710],
];
const CONDITIONS = ['Clear', 'Clear', 'Partly Cloudy', 'Haze', 'Overcast'];
const DIRS = ['N', 'NNE', 'NE', 'E', 'SE', 'S', 'SW', 'WSW', 'W', 'NW'];

function buildFlight(i, now) {
  const rand = mulberry32(1000 + i * 7919);
  const spec = MODELS[i % MODELS.length];
  const [hLat, hLng] = HOMES[i % HOMES.length];
  const groundElev = 20 + Math.round(rand() * 90);
  const startMsAgo = Math.round((0.2 + i * 0.35 + rand() * 0.4) * 3600_000);
  const nPoints = 5 + Math.floor(rand() * 40);
  const stepMs = 8000 + Math.floor(rand() * 10000);
  const heading0 = rand() * Math.PI * 2;
  const speedBase = 3 + rand() * 9;

  let lat = hLat + (rand() - 0.5) * 0.0006;
  let lng = hLng + (rand() - 0.5) * 0.0006;
  let hat = 2 + rand() * 10;
  let heading = heading0;
  let rssi = -70 - rand() * 25;
  const points = [];
  for (let p = 0; p < nPoints; p++) {
    const speed = Math.max(0, speedBase + (rand() - 0.5) * 4);
    heading += (rand() - 0.5) * 0.9;
    const d = (speed * stepMs) / 1000; // metres
    lat += (d * Math.cos(heading)) / 111_320;
    lng += (d * Math.sin(heading)) / (111_320 * Math.cos((lat * Math.PI) / 180));
    hat = Math.max(0, Math.min(120, hat + (rand() - 0.35) * 8));
    rssi = Math.max(-110, Math.min(-45, rssi + (rand() - 0.5) * 6));
    points.push({
      t: now - startMsAgo + p * stepMs,
      lat,
      lng,
      hat: +hat.toFixed(1),
      msl: +(hat + groundElev).toFixed(1),
      speed: +speed.toFixed(1),
      rssi: +rssi.toFixed(2),
    });
  }

  return {
    id: `flt-${i + 1}`,
    ...spec,
    serial: serial(rand, spec.manufacturer === 'DJI' ? 16 : 14),
    affiliation: i === 3 ? 'Suspect' : i === 6 ? 'Friendly' : 'Unknown',
    nickname: '',
    home: [hLat, hLng],
    groundElev,
    points,
    history: { flights: 1 + Math.floor(rand() * 12), firstDaysAgo: Math.floor(rand() * 60) },
    weather: {
      conditions: CONDITIONS[Math.floor(rand() * CONDITIONS.length)],
      windMs: +(rand() * 7).toFixed(1),
      windDir: DIRS[Math.floor(rand() * DIRS.length)],
    },
    collections: [],
  };
}

export function generateFlights(count = 14, now = Date.now()) {
  return Array.from({ length: count }, (_, i) => buildFlight(i, now)).sort(
    (a, b) => b.points.at(-1).t - a.points.at(-1).t
  );
}
