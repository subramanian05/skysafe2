import { Paper, Stack, Typography, Box } from '@mui/material';

/** Shared tooltip: label on top, one coloured row per series. */
export default function ChartTooltip({ active, payload, label, valueSuffix = '', labelFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <Paper variant="outlined" sx={{ px: 1.5, py: 1, boxShadow: 3 }}>
      {label != null && (
        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
          {labelFormatter ? labelFormatter(label) : label}
        </Typography>
      )}
      <Stack spacing={0.5}>
        {payload.map((p) => (
          <Stack key={p.dataKey ?? p.name} direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: p.color ?? p.payload?.fill, flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{p.name}</Typography>
            <Typography variant="body2" fontWeight={700}>
              {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{valueSuffix}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
