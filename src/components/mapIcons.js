import L from 'leaflet';

const droneSvg = (color, stroke) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="26" height="26">
  <g stroke="${stroke}" stroke-width="1.4" fill="${color}">
    <path d="M9 9 L19 19 M19 9 L9 19" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
    <path d="M9 9 L19 19 M19 9 L9 19" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="7" cy="7" r="4.2"/><circle cx="21" cy="7" r="4.2"/>
    <circle cx="7" cy="21" r="4.2"/><circle cx="21" cy="21" r="4.2"/>
    <rect x="11" y="11" width="6" height="6" rx="1.5"/>
  </g>
</svg>`;

const homeSvg = (color, stroke) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="16" height="16">
  <path d="M10 2 L18 9 H15.5 V17 H11.5 V12.5 H8.5 V17 H4.5 V9 H2 Z" fill="${color}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>
</svg>`;

const cache = new Map();

export function droneIcon(color = '#f5e050', selected = false) {
  const key = `d${color}${selected}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      L.divIcon({
        className: '',
        html: `<div style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.6));${selected ? 'transform:scale(1.25)' : ''}">${droneSvg(color, selected ? '#3b7cf6' : '#1a1a1a')}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      })
    );
  }
  return cache.get(key);
}

export function homeIcon(color = '#f5e050') {
  const key = `h${color}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      L.divIcon({
        className: '',
        html: `<div style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))">${homeSvg(color, '#1a1a1a')}</div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })
    );
  }
  return cache.get(key);
}
