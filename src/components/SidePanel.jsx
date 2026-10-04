import { Paper, Box, Typography, IconButton, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

/** Floating right-hand panel on desktop, bottom sheet on small screens. */
export default function SidePanel({ title, badge, actions, onClose, children }) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        ...(compact
          ? { left: 0, right: 0, bottom: 0, height: '78%', borderRadius: '14px 14px 0 0' }
          : { top: 12, right: 12, bottom: 12, width: 400, borderRadius: 2 }),
      }}
    >
      {compact && <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'divider', mx: 'auto', mt: 1 }} />}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.25, minHeight: 56 }}>
        <Typography variant="overline" sx={{ lineHeight: 1 }}>{title}</Typography>
        {badge != null && (
          <Box sx={{ bgcolor: 'primary.main', color: '#fff', borderRadius: 1, px: 0.9, fontSize: 12, fontWeight: 700, lineHeight: '20px' }}>
            {badge}
          </Box>
        )}
        <Box sx={{ flex: 1 }} />
        {actions}
        {actions && <Divider orientation="vertical" flexItem sx={{ my: 1 }} />}
        <IconButton size="small" aria-label="Close panel" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflowY: 'auto' }}>{children}</Box>
    </Paper>
  );
}
