import { useEffect, useMemo } from 'react';
import {
  MapContainer, TileLayer, Polyline, CircleMarker, Marker, Tooltip, ScaleControl,
  useMap, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '@mui/material/styles';
import { droneIcon, homeIcon } from './mapIcons.js';
import { AFFILIATION_COLORS, fmtDistance, haversine, lastPoint } from '../utils.js';

export const BASE_LAYERS = {
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  streets: {
    label: 'Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  dark: {
    label: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
};

function ViewController({ view }) {
  const map = useMap();
  useEffect(() => {
    if (!view) return;
    if (view.bounds) map.flyToBounds(L.latLngBounds(view.bounds), { padding: [80, 80], maxZoom: 18, duration: 0.8 });
    else if (view.center) map.flyTo(view.center, view.zoom ?? map.getZoom(), { duration: 0.8 });
  }, [view, map]);
  return null;
}

function ResizeWatcher({ deps }) {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(id);
  }, [map, deps]);
  return null;
}

function MapEvents({ rulerActive, onRulerPoint, onContextCoords }) {
  useMapEvents({
    click(e) {
      if (rulerActive) onRulerPoint([e.latlng.lat, e.latlng.lng]);
    },
    contextmenu(e) {
      onContextCoords([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function FlightMap({
  flights, selectedId, detailsId, onSelect, view, baseLayer, showTracks, showHomes,
  rulerActive, rulerPoints, onRulerPoint, onContextCoords, layoutKey,
}) {
  const theme = useTheme();
  const layer = BASE_LAYERS[baseLayer];

  const visible = useMemo(
    () => (detailsId ? flights.filter((f) => f.id === detailsId) : flights),
    [flights, detailsId]
  );

  const rulerTotal = rulerPoints.reduce((acc, p, i) => (i ? acc + haversine(rulerPoints[i - 1], p) : 0), 0);

  return (
    <MapContainer
      center={[32.802288, -117.2839852]}
      zoom={13}
      zoomControl={false}
      style={{ position: 'absolute', inset: 0, cursor: rulerActive ? 'crosshair' : undefined }}
    >
      <TileLayer key={baseLayer} url={layer.url} attribution={layer.attribution} maxZoom={19} />
      <ScaleControl position="bottomright" imperial={false} />
      <ViewController view={view} />
      <ResizeWatcher deps={layoutKey} />
      <MapEvents rulerActive={rulerActive} onRulerPoint={onRulerPoint} onContextCoords={onContextCoords} />

      {visible.map((f) => {
        const color = AFFILIATION_COLORS[f.affiliation] ?? theme.palette.warning.main;
        const selected = f.id === selectedId || f.id === detailsId;
        const latlngs = f.points.map((p) => [p.lat, p.lng]);
        const last = lastPoint(f);
        const handlers = { click: () => onSelect(f.id) };
        return (
          <FlightLayer
            key={f.id}
            flight={f}
            color={color}
            selected={selected}
            latlngs={latlngs}
            last={last}
            handlers={handlers}
            showTracks={showTracks}
            showHomes={showHomes}
            showPoints={!!detailsId || selected}
          />
        );
      })}

      {rulerPoints.length > 0 && (
        <>
          <Polyline positions={rulerPoints} pathOptions={{ color: '#ffffff', weight: 2, dashArray: '6 6' }} />
          {rulerPoints.map((p, i) => (
            <CircleMarker key={i} center={p} radius={4} pathOptions={{ color: '#111', fillColor: '#fff', fillOpacity: 1, weight: 1.5 }}>
              {i === rulerPoints.length - 1 && i > 0 && (
                <Tooltip permanent direction="top" offset={[0, -6]}>{fmtDistance(rulerTotal)}</Tooltip>
              )}
            </CircleMarker>
          ))}
        </>
      )}
    </MapContainer>
  );
}

function FlightLayer({ flight, color, selected, latlngs, last, handlers, showTracks, showHomes, showPoints }) {
  return (
    <>
      {showTracks && (
        <>
          {selected && <Polyline positions={latlngs} pathOptions={{ color: '#3b7cf6', weight: 6, opacity: 0.55 }} />}
          <Polyline positions={latlngs} pathOptions={{ color, weight: 2 }} eventHandlers={handlers} />
          {(showPoints ? flight.points : flight.points.filter((_, i) => i % 4 === 0)).map((p) => (
            <CircleMarker
              key={p.t}
              center={[p.lat, p.lng]}
              radius={3}
              pathOptions={{ color: '#2a2a2a', weight: 1, fillColor: color, fillOpacity: 1 }}
              eventHandlers={handlers}
            />
          ))}
        </>
      )}
      {showHomes && <Marker position={flight.home} icon={homeIcon(color)} eventHandlers={handlers} />}
      <Marker position={[last.lat, last.lng]} icon={droneIcon(color, selected)} eventHandlers={handlers} zIndexOffset={selected ? 1000 : 0}>
        <Tooltip direction="top" offset={[0, -12]}>{flight.model}</Tooltip>
      </Marker>
    </>
  );
}
