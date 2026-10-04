import { useMemo, useState } from 'react';
import {
  Box, Container, Typography, Stack, Select, MenuItem, Button, Link, FormControl, InputLabel,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import dayjs from 'dayjs';
import Panel, { SectionHeading, EmptyState } from './Panel.jsx';
import StatCard from './StatCard.jsx';
import FlightsPerDayChart from './FlightsPerDayChart.jsx';
import WeeklyHeatmap from './WeeklyHeatmap.jsx';
import HotspotsMap from './HotspotsMap.jsx';
import BreakdownCard from './BreakdownCard.jsx';
import MostActiveDrones from './MostActiveDrones.jsx';
import { AFFILIATION_FILTERS, PERIODS, REGIONS, buildDashboard } from '../../data/dashboard.js';

const ORG = 'CBP';

const grid = (cols) => ({ display: 'grid', gridTemplateColumns: { xs: '1fr', md: cols }, gap: 2 });

export default function DashboardPage() {
  const [region, setRegion] = useState('brownsville');
  const [period, setPeriod] = useState('30d');
  const [affiliation, setAffiliation] = useState('all');
  const [perDayVariant, setPerDayVariant] = useState('line');

  const generatedAt = useMemo(() => new Date(), []);
  const data = useMemo(
    () => buildDashboard({ region, period, affiliation }, generatedAt),
    [region, period, affiliation, generatedAt]
  );

  const control = (label, value, onChange, options) => (
    <FormControl size="small" sx={{ minWidth: 190 }}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <MenuItem key={o.id} value={o.id}>{o.name ?? o.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ lg: 'flex-end' }} sx={{ mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>{ORG} Dashboard</Typography>
            <Typography variant="body2">
              <Box component="span" fontWeight={700}>Generated: </Box>
              <Box component="span" color="text.secondary">{dayjs(generatedAt).format('M/D/YYYY, h:mm A')}</Box>
            </Typography>
            <Typography variant="body2">
              <Box component="span" fontWeight={700}>Time Range: </Box>
              <Box component="span" color="text.secondary">
                {dayjs(data.range.start).format('M/D/YYYY, h:mm A')} – {dayjs(data.range.end).format('M/D/YYYY, h:mm A')} {data.region.tz}
              </Box>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              All flight data is based on the local time zone of the flight&apos;s location.{' '}
              <Link href="#" underline="hover">Learn more <OpenInNewIcon sx={{ fontSize: 11 }} /></Link>
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {control('Flight Access Region', region, setRegion, REGIONS)}
            {control('Period', period, setPeriod, PERIODS)}
            {control('Affiliation', affiliation, setAffiliation, AFFILIATION_FILTERS)}
            <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={() => window.print()} sx={{ height: 40 }}>
              Export to PDF
            </Button>
          </Stack>
        </Stack>

        <Box sx={grid('repeat(4, 1fr)')}>
          {data.kpis.map((stat) => (
            <StatCard key={stat.key} stat={stat} />
          ))}
        </Box>

        <SectionHeading title="Flight Activity" subtitle="Analyze drone flight patterns and trends over time" />
        <Box sx={grid('repeat(2, 1fr)')}>
          <Panel
            title="Flights per Day"
            subtitle="Total number of drone flights over the current period"
            height={320}
            action={
              <Select size="small" value={perDayVariant} onChange={(e) => setPerDayVariant(e.target.value)} sx={{ minWidth: 100 }}>
                <MenuItem value="line">Line</MenuItem>
                <MenuItem value="bar">Bar</MenuItem>
              </Select>
            }
          >
            <FlightsPerDayChart data={data.flightsPerDay} variant={perDayVariant} />
          </Panel>

          <Panel title="Weekly Flight Activity" subtitle="Flight activity heatmap by weekday and hour" height={320}>
            <WeeklyHeatmap matrix={data.heatmap} />
          </Panel>

          <Panel title="Flight Activity Hotspots" subtitle="A visualization of the most active drone flight takeoff locations" height={320}>
            <HotspotsMap hotspots={data.hotspots} center={data.region.center} />
          </Panel>

          <BreakdownCard
            title="Top Flight Tags"
            subtitle="Most common flight tags detected in the current period"
            data={data.tags}
          />
        </Box>

        <SectionHeading title="Drone Analysis" subtitle="Breakdown of drone models, affiliations, and activity" />
        <Box sx={grid('repeat(2, 1fr)')}>
          <BreakdownCard
            title="Top Drone Models"
            subtitle="Most common drone models detected in the current period"
            data={data.models}
          />
          <BreakdownCard
            title="Top Target Affiliations"
            subtitle="Most common target affiliation detected in the current period"
            data={data.affiliations}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Panel title="Most Active Drones" subtitle="Top drones ranked by total flight count in the current period" height={360}>
            <MostActiveDrones drones={data.mostActive} />
          </Panel>
        </Box>

        <SectionHeading title="Alert Zone Analysis" subtitle="Monitor and analyze alert zone activity" />
        <Box sx={{ ...grid('repeat(2, 1fr)'), pb: 4 }}>
          <Panel title="Alerts by Day" subtitle="Total number of alerts triggered over the current period" height={280}>
            {data.alertsByDay.length ? (
              <FlightsPerDayChart
                data={data.alertsByDay.map((d) => ({ label: d.label, flights: d.alerts, previous: 0 }))}
                variant="bar"
              />
            ) : (
              <EmptyState />
            )}
          </Panel>
          {data.topAlertZones.length ? (
            <BreakdownCard
              title="Top Alert Zones"
              subtitle="Most frequent alert zone triggers in the current period"
              data={data.topAlertZones}
              height={280}
            />
          ) : (
            <Panel title="Top Alert Zones" subtitle="Most frequent alert zone triggers in the current period" height={280}>
              <EmptyState />
            </Panel>
          )}
        </Box>
      </Container>
    </Box>
  );
}
