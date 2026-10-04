import { Paper, Stack, Box, Typography, Divider } from '@mui/material';

/** Card shell shared by every dashboard widget. */
export default function Panel({ title, subtitle, action, height, children, sx }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', ...sx }}>
      <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700}>{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
          )}
        </Box>
        {action}
      </Stack>
      <Box sx={{ flex: 1, minHeight: height ?? 280, display: 'flex', flexDirection: 'column' }}>{children}</Box>
    </Paper>
  );
}

export function SectionHeading({ title, subtitle }) {
  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      <Typography variant="h6" fontWeight={700}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      <Divider sx={{ mt: 1.5 }} />
    </Box>
  );
}

export function EmptyState({ height = 280 }) {
  return (
    <Box sx={{ flex: 1, minHeight: height, display: 'grid', placeItems: 'center' }}>
      <Typography fontWeight={600} color="text.secondary">No data available</Typography>
    </Box>
  );
}
