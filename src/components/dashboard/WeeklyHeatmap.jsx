import { Box, Typography, Tooltip, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Sequential single-hue ramp, light -> dark, stepped for the active mode. */
function ramp(mode) {
  return mode === 'dark'
    ? ['#16263a', '#1d3e63', '#23548c', '#2a6bb5', '#3987e5', '#6aa6ec']
    : ['#e7f0fc', '#c5dcf7', '#98c1f0', '#66a2e4', '#2a78d6', '#1b5aa6'];
}

export default function WeeklyHeatmap({ matrix }) {
  const theme = useTheme();
  const steps = ramp(theme.palette.mode);
  const max = Math.max(1, ...matrix.flat());

  const colorFor = (v) => steps[Math.min(steps.length - 1, Math.floor((v / max) * steps.length))];

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: '34px 1fr', gap: 0.5, minHeight: 200 }}>
        <Box sx={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: '2px' }}>
          {DAYS.map((d) => (
            <Typography key={d} variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              {d}
            </Typography>
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: '2px' }}>
          {matrix.map((row, d) => (
            <Box key={d} sx={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: '2px' }}>
              {row.map((v, h) => (
                <Tooltip
                  key={h}
                  placement="top"
                  title={`${DAYS[d]} ${String(h).padStart(2, '0')}:00 — ${v.toLocaleString()} flights`}
                >
                  <Box sx={{ bgcolor: colorFor(v), borderRadius: '2px', minHeight: 14, cursor: 'default' }} />
                </Tooltip>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 0.5 }}>
        <Box />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
          {Array.from({ length: 12 }, (_, i) => (
            <Typography key={i} variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
              {String(i * 2).padStart(2, '0')}:00
            </Typography>
          ))}
        </Box>
      </Box>

      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
        <Typography variant="caption" color="text.secondary">Low</Typography>
        <Box sx={{ width: 140, height: 8, borderRadius: 1, background: `linear-gradient(90deg, ${steps.join(', ')})` }} />
        <Typography variant="caption" color="text.secondary">High ({max.toLocaleString()})</Typography>
      </Stack>
    </Box>
  );
}
