import { useMemo, useState } from 'react';
import {
  Box, Paper, Stack, Typography, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment,
  Button, TablePagination, ToggleButton, ToggleButtonGroup, Tooltip as MuiTooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTheme } from '@mui/material/styles';
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import dayjs from 'dayjs';
import Panel from '../dashboard/Panel.jsx';
import ChartTooltip from '../dashboard/ChartTooltip.jsx';
import BreakdownCard from '../dashboard/BreakdownCard.jsx';
import { PageHeading, StatusChip } from './AlertsCommon.jsx';
import {
  ACTIVITY_LOG, ACTIVITY_TOTAL, CHANNEL_COVERAGE, DATE_PRESETS, DELIVERY_STATUS,
  DELIVERY_STATUSES, NOTIFICATION_KPIS, SUBSCRIBERS, TIMEZONES, TOP_TRIGGERS_BY_SUBSCRIBERS,
  notificationSeries,
} from '../../data/alerts.js';

const KPI_ICONS = {
  emailsSent: MailOutlineIcon,
  deliveryRate: CheckCircleOutlineIcon,
  processing: HourglassEmptyIcon,
  failed: ErrorOutlineIcon,
};

function KpiCard({ id, label, value, delta, tone }) {
  const Icon = KPI_ICONS[id] ?? MailOutlineIcon;
  const flat = delta === 0 || delta == null;
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" alignItems="flex-start">
        <Typography fontWeight={700} sx={{ flex: 1 }}>{label}</Typography>
        <Icon sx={{ fontSize: 20, color: tone ? `${tone}.main` : 'text.secondary' }} />
      </Stack>
      <Typography sx={{ fontSize: 30, fontWeight: 700, lineHeight: 1.4 }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">
        <Box component="span" sx={{ fontWeight: 700, color: flat ? 'text.secondary' : delta > 0 ? 'success.main' : 'error.main' }}>
          {flat ? 'No change' : `${delta > 0 ? '+' : ''}${delta}%`}
        </Box>{' '}
        from the previous period
      </Typography>
    </Paper>
  );
}

function NotificationsOverTime({ data, variant }) {
  const theme = useTheme();
  const [email, sms, total] = theme.palette.series;
  const axis = theme.palette.text.secondary;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 24, left: -12 }}>
        <CartesianGrid stroke={theme.palette.divider} vertical={false} />
        <XAxis dataKey="t" tickFormatter={(t) => dayjs(t).format('M/D')} tick={{ fill: axis, fontSize: 11 }} stroke={theme.palette.divider} minTickGap={18} />
        <YAxis tick={{ fill: axis, fontSize: 11 }} stroke={theme.palette.divider} />
        <Tooltip content={<ChartTooltip labelFormatter={(t) => dayjs(t).format('MMM D, YYYY')} />} cursor={{ stroke: axis, strokeDasharray: '4 4' }} />
        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12, color: axis }} />
        {variant === 'bar' ? (
          <>
            <Bar dataKey="email" name="Email" fill={email} radius={[4, 4, 0, 0]} maxBarSize={14} />
            <Bar dataKey="sms" name="SMS" fill={sms} radius={[4, 4, 0, 0]} maxBarSize={14} />
          </>
        ) : (
          <>
            <Line type="monotone" dataKey="email" name="Email" stroke={email} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="emailPrev" name="Email (Previous)" stroke={email} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="sms" name="SMS" stroke={sms} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="smsPrev" name="SMS (Previous)" stroke={sms} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="total" name="Total" stroke={total} strokeWidth={2} dot={false} isAnimationActive={false} />
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function OverviewTab({ days }) {
  const [variant, setVariant] = useState('line');
  const [channel, setChannel] = useState('email');
  const series = useMemo(() => notificationSeries(days), [days]);
  const k = NOTIFICATION_KPIS;

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <KpiCard id="emailsSent" label="Emails Sent" value={k.emailsSent.toLocaleString()} delta={k.deltas.emailsSent} />
        <KpiCard id="deliveryRate" label="Delivery Rate" value={`${k.deliveryRate}%`} delta={k.deltas.deliveryRate} tone="success" />
        <KpiCard id="processing" label="Processing Deliveries" value={k.processing} delta={k.deltas.processing} tone="warning" />
        <KpiCard id="failed" label="Failed Deliveries" value={k.failed} delta={k.deltas.failed} tone="error" />
      </Box>

      <Typography variant="h6" fontWeight={700}>Delivery Trends</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Track notification volume and delivery outcomes across the selected period.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Panel
          title="Notifications Over Time"
          subtitle="SMS and email notifications sent during the selected period"
          height={300}
          action={
            <Select size="small" value={variant} onChange={(e) => setVariant(e.target.value)} sx={{ minWidth: 100 }}>
              <MenuItem value="line">Line</MenuItem>
              <MenuItem value="bar">Bar</MenuItem>
            </Select>
          }
        >
          <NotificationsOverTime data={series} variant={variant} />
        </Panel>

        <Box>
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
            <ToggleButtonGroup exclusive size="small" color="primary" value={channel} onChange={(_, v) => v && setChannel(v)}>
              <ToggleButton value="sms">SMS</ToggleButton>
              <ToggleButton value="email">Email</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <BreakdownCard
            title="Delivery Status"
            subtitle={`Breakdown of ${channel === 'sms' ? 'SMS' : 'email'} delivery outcomes`}
            data={DELIVERY_STATUS[channel]}
            height={250}
          />
        </Box>
      </Box>

      <Typography variant="h6" fontWeight={700} sx={{ mt: 4 }}>Subscriber Setup</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        See how subscribers are configured and which triggers reach the most people.
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, pb: 2 }}>
        <BreakdownCard
          title="Subscriber Channel Coverage"
          subtitle="How users are configured to receive notifications"
          data={CHANNEL_COVERAGE}
          height={280}
        />
        <BreakdownCard
          title="Top Triggers by Subscribers"
          subtitle="Triggers with the most notification subscribers"
          data={TOP_TRIGGERS_BY_SUBSCRIBERS}
          height={280}
        />
      </Box>
    </Box>
  );
}

function ActivityLogTab() {
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(50);

  const rows = useMemo(
    () =>
      ACTIVITY_LOG.filter((r) => {
        if (type !== 'all' && r.type !== type) return false;
        if (status !== 'all' && r.status !== status) return false;
        const q = query.trim().toLowerCase();
        if (q && ![r.recipient, r.contact, r.trigger].some((v) => v?.toLowerCase().includes(q))) return false;
        return true;
      }),
    [type, status, query]
  );

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search recipient, contact or trigger…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
            <MenuItem value="all">All types</MenuItem>
            <MenuItem value="EMAIL">Email</MenuItem>
            <MenuItem value="SMS">SMS</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="all">All statuses</MenuItem>
            {DELIVERY_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {['Time', 'Type', 'Recipient', 'Contact', 'Trigger', 'Status', ''].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(0, limit).map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{dayjs(r.at).format('MMM D, YYYY, hh:mm A')}</TableCell>
                <TableCell><Chip size="small" label={r.type} variant="outlined" sx={{ height: 20, fontSize: 11 }} /></TableCell>
                <TableCell>{r.recipient}</TableCell>
                <TableCell sx={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.contact}</TableCell>
                <TableCell>{r.trigger}</TableCell>
                <TableCell><StatusChip status={r.status} /></TableCell>
                <TableCell>
                  {r.detail && (
                    <MuiTooltip title={r.detail}>
                      <ErrorOutlineIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </MuiTooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>No deliveries match these filters.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          sx={{ borderColor: 'divider' }}
          disabled={limit >= rows.length}
          onClick={() => setLimit((l) => l + 50)}
        >
          Load more ({Math.min(limit, rows.length).toLocaleString()} of {ACTIVITY_TOTAL.toLocaleString()})
        </Button>
      </Stack>
    </Box>
  );
}

function SubscribersTab() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? SUBSCRIBERS.filter((s) => [s.name, s.email, s.phone].some((v) => v?.toLowerCase().includes(q))) : SUBSCRIBERS;
  }, [query]);

  return (
    <Box>
      <Typography fontWeight={700}>Subscribers</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        See who&apos;s set up to receive alerts and how to reach them.
      </Typography>

      <TextField
        size="small"
        fullWidth
        placeholder="Search subscribers…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPage(0); }}
        sx={{ mb: 2 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
      />

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Name', 'Email', 'Phone', 'Channels', 'Triggers'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((s) => (
              <TableRow key={s.id} hover>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.phone ?? '—'}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    {s.channels.map((c) => (
                      <Chip key={c} size="small" label={c} variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>{s.triggers}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 30, 40, 50]}
          labelRowsPerPage="Rows per page"
          showFirstButton
          showLastButton
        />
      </TableContainer>
    </Box>
  );
}

export default function NotificationsCenterPage() {
  const [tab, setTab] = useState('overview');
  const [preset, setPreset] = useState('30d');
  const [timezone, setTimezone] = useState('America/Los_Angeles (Pacific)');
  const days = DATE_PRESETS.find((p) => p.id === preset)?.days ?? 30;
  const end = dayjs();
  const start = end.subtract(days, 'day');

  return (
    <Box>
      <PageHeading
        title="Notifications Center"
        description="Monitor SMS and email notification delivery, subscriber statistics, and activity."
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="overview" label="Overview" />
        <Tab value="activity" label="Activity Log" />
        <Tab value="subscribers" label="Subscribers" />
      </Tabs>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1}>
          <Chip label={`Subscribers ${NOTIFICATION_KPIS.subscribers}`} variant="outlined" />
          <Chip label={`Triggers ${NOTIFICATION_KPIS.triggers}`} variant="outlined" />
        </Stack>
        <Box sx={{ flex: 1 }} />
        <FormControl size="small" sx={{ minWidth: 190 }}>
          <InputLabel>Date Range</InputLabel>
          <Select label="Date Range" value={preset} onChange={(e) => setPreset(e.target.value)}>
            {DATE_PRESETS.map((p) => <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 230 }}>
          <InputLabel>Timezone</InputLabel>
          <Select label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            {TIMEZONES.map((tz) => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        {start.format('MMM D, YYYY, h:mm a')} – {end.format('MMM D, YYYY, h:mm a')}
      </Typography>

      {tab === 'overview' && <OverviewTab days={days} />}
      {tab === 'activity' && <ActivityLogTab />}
      {tab === 'subscribers' && <SubscribersTab />}
    </Box>
  );
}
