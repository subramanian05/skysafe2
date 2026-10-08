import { useState } from 'react';
import {
  Box, Paper, Stack, Typography, Button, Link, Divider, Skeleton, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SensorsIcon from '@mui/icons-material/Sensors';
import FlightIcon from '@mui/icons-material/Flight';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';
import { AlertTypeChip, AffiliationDot, PageHeading } from './AlertsCommon.jsx';
import { RECENT_ALERTS } from '../../data/alerts.js';

function Meta({ icon, children }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary', '& svg': { fontSize: 14 } }}>
      {icon}
      <Typography variant="caption">{children}</Typography>
    </Stack>
  );
}

function AlertRow({ alert, onOpenFlight, onOpenTrigger }) {
  return (
    <Paper variant="outlined" sx={{ px: 2, py: 1.25, '&:hover': { borderColor: 'primary.main' } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AlertTypeChip type={alert.type} />
            <AffiliationDot affiliation={alert.affiliation} />
            <Link
              component="button"
              underline="hover"
              onClick={() => onOpenTrigger(alert.triggerId)}
              sx={{ fontWeight: 700, color: 'text.primary', fontSize: 14 }}
            >
              {alert.label}
            </Link>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
            <Meta icon={<AccessTimeIcon />}>{dayjs(alert.at).format('M/D/YYYY, h:mm A')}</Meta>
            <Meta icon={<SensorsIcon />}>{alert.source}</Meta>
            <Meta icon={<FlightIcon />}>{alert.model}</Meta>
          </Stack>
        </Box>
        <Button size="small" endIcon={<ChevronRightIcon />} onClick={() => onOpenFlight(alert.flightId)}>
          View flight
        </Button>
      </Stack>
    </Paper>
  );
}

export default function RecentActivityPage({ onOpenFlight = () => {}, onOpenTrigger = () => {} }) {
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState(RECENT_ALERTS);

  const refresh = () => {
    setLoading(true);
    // Mock refresh: re-stamp the newest alert so the list visibly changes.
    setTimeout(() => {
      setAlerts((prev) => [{ ...prev[0], id: `alert-${Date.now()}`, at: Date.now() }, ...prev].slice(0, 80));
      setLoading(false);
    }, 600);
  };

  const shown = alerts.filter((a) => filter === 'all' || a.type === filter);

  return (
    <Box>
      <PageHeading
        title="Recent Activity"
        description="Your most recent trigger and watch alerts."
        action={
          <Button variant="outlined" color="inherit" startIcon={<RefreshIcon />} onClick={refresh} disabled={loading} sx={{ borderColor: 'divider' }}>
            Refresh
          </Button>
        }
      />

      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <ToggleButtonGroup exclusive size="small" color="primary" value={filter} onChange={(_, v) => v && setFilter(v)}>
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="trigger">Triggers</ToggleButton>
          <ToggleButton value="watch">Watches</ToggleButton>
        </ToggleButtonGroup>
        <Divider orientation="vertical" flexItem />
        <Typography variant="body2" color="text.secondary">{shown.length} alerts</Typography>
      </Stack>

      <Stack spacing={1.25}>
        {loading && <Skeleton variant="rounded" height={66} />}
        {shown.map((a) => (
          <AlertRow key={a.id} alert={a} onOpenFlight={onOpenFlight} onOpenTrigger={onOpenTrigger} />
        ))}
        {shown.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
            No alerts in this view.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
