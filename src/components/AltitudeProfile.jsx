import { useState } from 'react';
import { Paper, Stack, Typography, ToggleButton, ToggleButtonGroup, IconButton, Box, Slider, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import { fmtTime } from '../utils.js';

export default function AltitudeProfile({ flight, index, onIndex, onClose }) {
  const theme = useTheme();
  const [ref, setRef] = useState('hat');
  const data = flight.points.map((p, i) => ({ i, t: p.t, alt: ref === 'hat' ? p.hat : p.msl }));
  const grid = theme.palette.mode === 'dark' ? '#3f7a3f' : '#b5d6b5';
  const line = theme.palette.mode === 'dark' ? '#ffffff' : '#1f2937';

  return (
    <Paper square elevation={0} sx={{ height: 260, display: 'flex', flexDirection: 'column', borderTop: 1, borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1 }}>
        <Typography fontWeight={700} sx={{ flex: 1 }}>Altitude Profile</Typography>
        <ToggleButtonGroup exclusive size="small" value={ref} onChange={(_, v) => v && setRef(v)}>
          <ToggleButton value="hat">HAT</ToggleButton>
          <ToggleButton value="msl">MSL</ToggleButton>
        </ToggleButtonGroup>
        <IconButton size="small" aria-label="Close altitude profile" onClick={onClose} sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Divider />
      <Box sx={{ flex: 1, minHeight: 0, px: 1, pt: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -12 }} onClick={(e) => e?.activeTooltipIndex != null && onIndex(e.activeTooltipIndex)}>
            <defs>
              <linearGradient id="altFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b1e1e" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#5a1212" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={grid} />
            <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} tickFormatter={fmtTime} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} stroke={grid} />
            <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} stroke={grid} unit=" m" width={56} />
            <Tooltip
              labelFormatter={fmtTime}
              formatter={(v) => [`${v} m ${ref.toUpperCase()}`, 'Altitude']}
              contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 6 }}
            />
            <Area type="linear" dataKey="alt" stroke={line} strokeWidth={2} fill="url(#altFill)" dot={{ r: 3.5, fill: line, stroke: line }} isAnimationActive={false} />
            <ReferenceLine x={data[index]?.t} stroke={theme.palette.primary.main} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ px: 3, pb: 0.5 }}>
        <Slider size="small" min={0} max={flight.points.length - 1} value={index} onChange={(_, v) => onIndex(v)} aria-label="Playback position" />
      </Box>
    </Paper>
  );
}
