import { useEffect, useRef } from 'react';
import { Box, Card, CardActionArea, Typography, Button, Stack, IconButton, Tooltip } from '@mui/material';
import SensorsIcon from '@mui/icons-material/Sensors';
import NorthIcon from '@mui/icons-material/North';
import SpeedIcon from '@mui/icons-material/Speed';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import DescriptionIcon from '@mui/icons-material/Description';
import SidePanel from './SidePanel.jsx';
import DroneThumb from './DroneThumb.jsx';
import { AFFILIATION_COLORS, lastPoint, timeAgo } from '../utils.js';

function Dot({ color }) {
  return <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, display: 'inline-block', flexShrink: 0 }} />;
}

function Serial({ flight }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Dot color={AFFILIATION_COLORS[flight.affiliation]} />
      <Typography variant="body2" color="text.secondary" sx={(t) => ({ fontFamily: t.typography.mono.fontFamily, letterSpacing: 0.3 })}>
        {flight.serial}
      </Typography>
    </Stack>
  );
}

function SelectedSummary({ flight, onDetails, onFocus, onCollapse }) {
  const p = lastPoint(flight);
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <DroneThumb size={64} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center">
            <Typography fontWeight={700} noWrap sx={{ flex: 1 }}>{flight.model}</Typography>
            <Typography variant="body2" color="text.secondary">{timeAgo(p.t)}</Typography>
            <Tooltip title="Collapse">
              <IconButton size="small" onClick={onCollapse} sx={{ ml: 0.5 }}><CloseFullscreenIcon sx={{ fontSize: 16 }} /></IconButton>
            </Tooltip>
          </Stack>
          <Serial flight={flight} />
          <Stack direction="row" spacing={1.5} sx={{ mt: 0.75, color: 'text.secondary' }} flexWrap="wrap">
            <Meta icon={<SensorsIcon />} text={flight.protocol} />
            <Meta icon={<NorthIcon />} text={`${Math.round(p.msl)} m MSL`} />
            <Meta icon={<SpeedIcon />} text={`${p.speed} m/s`} />
          </Stack>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button fullWidth variant="contained" startIcon={<ListAltIcon />} onClick={onDetails}>Details</Button>
        <Button fullWidth variant="outlined" color="inherit" startIcon={<CenterFocusStrongIcon />} onClick={onFocus} sx={{ borderColor: 'divider' }}>
          Focus
        </Button>
      </Stack>
    </Box>
  );
}

function Meta({ icon, text }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ '& svg': { fontSize: 15 } }}>
      {icon}
      <Typography variant="body2">{text}</Typography>
    </Stack>
  );
}

export default function DetectionsPanel({ flights, selectedId, onSelect, onDetails, onFocus, onClose, onExport }) {
  const selected = flights.find((f) => f.id === selectedId);
  const listRef = useRef(null);

  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    listRef.current.querySelector(`[data-id="${selectedId}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedId]);

  return (
    <SidePanel
      title="Detections"
      badge={flights.length}
      onClose={onClose}
      actions={
        <Tooltip title="Export CSV" placement="bottom">
          <Button variant="contained" size="small" onClick={onExport} sx={{ minWidth: 34, px: 0.75 }} aria-label="Export CSV">
            <DescriptionIcon fontSize="small" />
          </Button>
        </Tooltip>
      }
    >
      {selected && (
        <SelectedSummary
          flight={selected}
          onDetails={() => onDetails(selected.id)}
          onFocus={() => onFocus(selected.id)}
          onCollapse={() => onSelect(null)}
        />
      )}
      <Stack spacing={1.25} sx={{ p: 1.5 }} ref={listRef}>
        {flights.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
            No flights match the current filters.
          </Typography>
        )}
        {flights.map((f) => {
          const active = f.id === selectedId;
          return (
            <Card
              key={f.id}
              data-id={f.id}
              variant="outlined"
              sx={(t) => ({
                bgcolor: t.palette.surface.inset,
                borderColor: active ? 'primary.main' : 'divider',
                boxShadow: active ? `0 0 0 1px ${t.palette.primary.main}` : 'none',
              })}
            >
              <CardActionArea onClick={() => onSelect(active ? null : f.id)} sx={{ px: 1.5, py: 1.25 }}>
                <Stack direction="row" alignItems="baseline">
                  <Typography fontWeight={700} sx={{ flex: 1 }} noWrap>{f.model}</Typography>
                  <Typography variant="body2" color="text.secondary">{timeAgo(lastPoint(f).t)}</Typography>
                </Stack>
                <Serial flight={f} />
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>
    </SidePanel>
  );
}
