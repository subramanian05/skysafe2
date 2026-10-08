import { Box, Chip, Stack, Typography, Link } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { AFFILIATION_COLOR } from '../../data/alerts.js';

/** "Trigger" / "Watch" pill used on the alert feed. */
export function AlertTypeChip({ type }) {
  const watch = type === 'watch';
  return (
    <Chip
      size="small"
      label={watch ? 'Watch' : 'Trigger'}
      color={watch ? 'primary' : 'default'}
      variant={watch ? 'filled' : 'outlined'}
      sx={{ height: 20, fontSize: 11, fontWeight: 700, textTransform: 'none' }}
    />
  );
}

export function AffiliationDot({ affiliation, size = 9 }) {
  return (
    <Box
      component="span"
      title={affiliation}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'inline-block',
        bgcolor: AFFILIATION_COLOR[affiliation] ?? AFFILIATION_COLOR.unknown,
      }}
    />
  );
}

const STATUS_COLOR = {
  Delivered: 'success',
  Sent: 'info',
  Processing: 'warning',
  Dropped: 'error',
  Bounced: 'error',
  Active: 'success',
  Paused: 'default',
};

export function StatusChip({ status }) {
  return (
    <Chip
      size="small"
      label={status}
      color={STATUS_COLOR[status] ?? 'default'}
      variant={status === 'Delivered' || status === 'Active' ? 'filled' : 'outlined'}
      sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
    />
  );
}

/** Page title + one-line description + "Learn more" link, as every Alerts page has. */
export function PageHeading({ title, description, action }) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2.5 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h5" fontWeight={700}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}{' '}
          <Link href="#" underline="hover" onClick={(e) => e.preventDefault()}>
            Learn more <OpenInNewIcon sx={{ fontSize: 11 }} />
          </Link>
        </Typography>
      </Box>
      {action}
    </Stack>
  );
}

export function EmptyRow({ colSpan, message = 'No results' }) {
  return (
    <Box component="tr">
      <Box component="td" colSpan={colSpan} sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
        {message}
      </Box>
    </Box>
  );
}
