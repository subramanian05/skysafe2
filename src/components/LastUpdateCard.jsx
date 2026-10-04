import { useState } from 'react';
import { Paper, Stack, Typography, IconButton, Divider, Box, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import NorthIcon from '@mui/icons-material/North';
import SpeedIcon from '@mui/icons-material/Speed';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import FlightIcon from '@mui/icons-material/Flight';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { floatingSx } from './MapControls.jsx';
import { fmtDateTime, isLive } from '../utils.js';

function Delta({ value, unit, digits = 0 }) {
  if (value == null || Number.isNaN(value)) return null;
  const up = value >= 0;
  return (
    <Typography variant="body2" sx={{ color: up ? 'success.main' : 'error.main', ml: 1.5 }}>
      {up ? '↑' : '↓'} {up ? '+' : '−'}{Math.abs(value).toFixed(digits)} {unit}
    </Typography>
  );
}

function Row({ icon, children }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ '& > svg': { fontSize: 18, color: 'text.secondary' } }}>
      {icon}
      {children}
    </Stack>
  );
}

export default function LastUpdateCard({ flight, index, onClose, sx }) {
  const [large, setLarge] = useState(false);
  const p = flight.points[index];
  const prev = index > 0 ? flight.points[index - 1] : null;
  const live = index === flight.points.length - 1 && isLive(flight);

  return (
    <Paper sx={(t) => ({ ...floatingSx(t), position: 'absolute', zIndex: 1000, width: large ? 400 : 340, ...sx })}>
      <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1 }}>
        <Typography variant="overline" sx={{ flex: 1 }}>{index === flight.points.length - 1 ? 'Last Update' : `Point ${index + 1} of ${flight.points.length}`}</Typography>
        <Tooltip title="Toggle text size" placement="bottom">
          <IconButton size="small" onClick={() => setLarge((v) => !v)} sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <TextFieldsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <IconButton size="small" aria-label="Close" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Stack>
      <Divider />
      <Stack spacing={1.25} sx={{ p: 2, '& .MuiTypography-body2': { fontSize: large ? 16 : 14 } }}>
        <Row icon={<AccessTimeIcon />}><Typography variant="body2" fontWeight={600}>{fmtDateTime(p.t)}</Typography></Row>
        <Row icon={<PlaceOutlinedIcon />}><Typography variant="body2" fontWeight={600}>{p.lat.toFixed(5)}, {p.lng.toFixed(5)}</Typography></Row>
        <Row icon={<NorthIcon />}>
          <Typography variant="body2" fontWeight={600}>{Math.round(p.msl)} m MSL</Typography>
          <Delta value={prev && p.msl - prev.msl} unit="m" />
        </Row>
        <Row icon={<SpeedIcon />}>
          <Typography variant="body2" fontWeight={600}>{p.speed} m/s</Typography>
          <Delta value={prev && p.speed - prev.speed} unit="m/s" digits={1} />
        </Row>
        <Row icon={<SignalCellularAltIcon />}>
          <Typography variant="body2" fontWeight={600}>{p.rssi.toFixed(2)} dB</Typography>
          <Delta value={prev && p.rssi - prev.rssi} unit="dB" />
        </Row>
        <Row icon={<FlightIcon />}>
          <Typography variant="body2" fontWeight={600}>{live ? 'In Flight' : p.hat < 1 ? 'Landed' : 'Last Seen'}</Typography>
          {live && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', ml: 1, animation: 'pulse 1.6s infinite', '@keyframes pulse': { '50%': { opacity: 0.3 } } }} />}
        </Row>
      </Stack>
    </Paper>
  );
}
