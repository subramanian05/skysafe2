import { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Tooltip as LeafletTooltip, ScaleControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function FitHotspots({ hotspots }) {
  const map = useMap();
  useEffect(() => {
    if (!hotspots.length) return;
    map.fitBounds(L.latLngBounds(hotspots.map((h) => [h.lat, h.lng])), { padding: [48, 48], maxZoom: 12 });
    setTimeout(() => map.invalidateSize(), 200);
  }, [hotspots, map]);
  return null;
}

export default function HotspotsMap({ hotspots, center }) {
  const theme = useTheme();
  const color = theme.palette.series[0];
  const max = Math.max(1, ...hotspots.map((h) => h.count));

  return (
    <Box sx={{ flex: 1, minHeight: 280, position: 'relative', borderRadius: 1.5, overflow: 'hidden' }}>
      <MapContainer center={center} zoom={10} scrollWheelZoom={false} style={{ position: 'absolute', inset: 0 }}>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
          maxZoom={19}
        />
        <ScaleControl position="bottomleft" imperial={false} />
        <FitHotspots hotspots={hotspots} />
        {hotspots.map((h) => (
          <Circle
            key={`${h.lat},${h.lng}`}
            center={[h.lat, h.lng]}
            radius={1200 + (h.count / max) * 4000}
            pathOptions={{ color, weight: 2, fillColor: color, fillOpacity: 0.35 }}
          >
            <LeafletTooltip direction="top">{h.count.toLocaleString()} takeoffs</LeafletTooltip>
          </Circle>
        ))}
      </MapContainer>
    </Box>
  );
}
