import { useTheme } from '@mui/material/styles';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
} from 'recharts';
import { Paper, Stack, Typography, Box } from '@mui/material';

function DroneTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Paper variant="outlined" sx={{ px: 1.5, py: 1, boxShadow: 3 }}>
      <Typography variant="body2" fontWeight={700}>{d.model}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'monospace' }}>
        {d.serial}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
        <Typography variant="body2" color="text.secondary">Flights</Typography>
        <Typography variant="body2" fontWeight={700}>{d.flights.toLocaleString()}</Typography>
      </Stack>
    </Paper>
  );
}

const AxisLabel = ({ x, y, payload, drones, color }) => {
  const d = drones[payload.index];
  if (!d) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-8} y={-4} textAnchor="end" fontSize={11} fontWeight={700} fill={color}>{d.model}</text>
      <text x={-8} y={8} textAnchor="end" fontSize={10} fill={color} opacity={0.75} fontFamily="monospace">{d.serial}</text>
    </g>
  );
};

export default function MostActiveDrones({ drones }) {
  const theme = useTheme();
  const axis = theme.palette.text.secondary;

  return (
    <Box sx={{ flex: 1, minHeight: 360 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={drones} layout="vertical" margin={{ top: 8, right: 44, bottom: 24, left: 160 }} barCategoryGap={6}>
          <CartesianGrid stroke={theme.palette.divider} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: axis, fontSize: 11 }}
            stroke={theme.palette.divider}
            allowDecimals={false}
            label={{ value: 'Flight Count', position: 'insideBottom', offset: -12, fill: axis, fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="serial"
            width={160}
            stroke={theme.palette.divider}
            tick={<AxisLabel drones={drones} color={theme.palette.text.primary} />}
          />
          <Tooltip content={<DroneTooltip />} cursor={{ fill: theme.palette.action.hover }} />
          <Bar dataKey="flights" fill={theme.palette.series[0]} radius={[0, 4, 4, 0]} maxBarSize={16}>
            <LabelList dataKey="flights" position="right" style={{ fill: axis, fontSize: 11 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
