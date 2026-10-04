import { useState } from 'react';
import {
  Box, Paper, Stack, Typography, IconButton, Button, Tooltip, Accordion, AccordionSummary,
  AccordionDetails, TextField, MenuItem, Select, Link, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import HistoryIcon from '@mui/icons-material/History';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import DroneThumb from './DroneThumb.jsx';
import { AFFILIATIONS } from '../data/flights.js';
import {
  AFFILIATION_COLORS, firstPoint, flightStats, fmtDate, fmtDateTime, fmtDistance, fmtTime, lastPoint,
} from '../utils.js';

function InfoTable({ rows }) {
  return (
    <Box sx={(t) => ({ border: 1, borderColor: 'divider', borderRadius: 1.5, bgcolor: t.palette.surface.inset })}>
      {rows.map(([k, v], i) => (
        <Stack key={k} direction="row" sx={{ px: 1.25, py: 0.9, borderTop: i ? 1 : 0, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{k}</Typography>
          <Typography variant="body2" fontWeight={600} textAlign="right">{v}</Typography>
        </Stack>
      ))}
    </Box>
  );
}

const SubHead = ({ children, action }) => (
  <Stack direction="row" alignItems="center" sx={{ mt: 2, mb: 1 }}>
    <Typography fontWeight={600} sx={{ flex: 1 }}>{children}</Typography>
    {action}
  </Stack>
);

function Section({ title, children, defaultExpanded = true }) {
  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="overline">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 2 }}>{children}</AccordionDetails>
    </Accordion>
  );
}

export default function FlightDetailsPanel({
  flight, onBack, onUpdate, altitudeOpen, onToggleAltitude, playing, onTogglePlay, onDownload,
  onShowTable, watched, onToggleWatch, onFocus,
}) {
  const [editAff, setEditAff] = useState(false);
  const [nickDraft, setNickDraft] = useState(null);
  const stats = flightStats(flight);
  const start = firstPoint(flight);
  const end = lastPoint(flight);

  const tools = [
    { title: 'Flight summary', icon: <AssignmentOutlinedIcon />, onClick: onFocus },
    { title: 'Download flight data', icon: <FileDownloadOutlinedIcon />, onClick: onDownload },
    { title: 'Drone history', icon: <HistoryIcon /> },
    { title: watched ? 'Stop watching' : 'Watch this drone', icon: watched ? <VisibilityIcon /> : <VisibilityOutlinedIcon />, onClick: onToggleWatch, active: watched },
    { title: playing ? 'Pause playback' : 'Play flight', icon: playing ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />, onClick: onTogglePlay, active: playing },
    { title: 'Altitude profile', icon: <ShowChartIcon />, onClick: onToggleAltitude, active: altitudeOpen },
    { title: 'Data points', icon: <TableChartOutlinedIcon />, onClick: onShowTable },
  ];

  return (
    <Paper square elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 1.5, py: 1, minHeight: 56, borderBottom: 1, borderColor: 'divider' }}>
        <IconButton aria-label="Back to detections" onClick={onBack} sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography fontWeight={700} sx={{ flex: 1 }}>Flight Details</Typography>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight={700}>{flight.model}</Typography>
          <Typography variant="caption" color="text.secondary">{fmtDateTime(start.t)}</Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ p: 1.25, borderBottom: 1, borderColor: 'divider' }}>
        {tools.map((t) => (
          <Tooltip key={t.title} title={t.title} placement="bottom">
            <Button
              aria-label={t.title}
              onClick={t.onClick}
              variant={t.active ? 'contained' : 'outlined'}
              color={t.active ? 'primary' : 'inherit'}
              sx={{ flex: 1, minWidth: 0, py: 0.75, borderColor: 'divider', '& svg': { fontSize: 20 } }}
            >
              {t.icon}
            </Button>
          </Tooltip>
        ))}
      </Stack>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Section title="Identification">
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 1 }}>
            <DroneThumb size={72} />
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={700}>{flight.model}</Typography>
              <Typography variant="body2" color="text.secondary">{flight.manufacturer}</Typography>
            </Box>
            <IconButton aria-label="Open model page" sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Stack>

          <SubHead action={<Button size="small" variant="outlined" color="inherit" sx={{ borderColor: 'divider' }}>→ View history</Button>}>
            History
          </SubHead>
          <Box sx={(t) => ({ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: 1, borderColor: 'divider', borderRadius: 1.5, p: 1.25, bgcolor: t.palette.surface.inset })}>
            {[
              ['Flights', flight.history.flights],
              ['First', flight.history.firstDaysAgo ? `${flight.history.firstDaysAgo} days ago` : 'today'],
              ['Last', 'today'],
            ].map(([k, v]) => (
              <Box key={k}>
                <Typography variant="body2" color="text.secondary">{k}</Typography>
                <Typography variant="body2" fontWeight={700}>{v}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={(t) => ({ mt: 1.5, border: 1, borderColor: 'divider', borderRadius: 1.5, p: 1.25, bgcolor: t.palette.surface.inset })}>
            <Typography variant="caption" color="text.secondary">{flight.protocol} Serial Number</Typography>
            <Typography sx={(t) => ({ fontFamily: t.typography.mono.fontFamily, letterSpacing: 0.5 })}>{flight.serial}</Typography>
          </Box>
        </Section>

        <Section title="Classification" defaultExpanded={false}>
          <SubHead
            action={
              <Button size="small" variant="outlined" color="inherit" startIcon={<EditOutlinedIcon />} onClick={() => setEditAff((v) => !v)} sx={{ borderColor: 'divider' }}>
                {editAff ? 'Done' : 'Edit'}
              </Button>
            }
          >
            Affiliation
          </SubHead>
          {editAff ? (
            <Select fullWidth size="small" value={flight.affiliation} onChange={(e) => onUpdate({ affiliation: e.target.value })}>
              {AFFILIATIONS.map((a) => (
                <MenuItem key={a} value={a}>
                  <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: AFFILIATION_COLORS[a], mr: 1, display: 'inline-block' }} />
                  {a}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <Stack direction="row" alignItems="center" spacing={1} sx={(t) => ({ border: 1, borderColor: 'divider', borderRadius: 1.5, px: 1.25, py: 0.9, bgcolor: t.palette.surface.inset })}>
              <Typography variant="body2" fontWeight={700}>{flight.affiliation}</Typography>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: AFFILIATION_COLORS[flight.affiliation] }} />
            </Stack>
          )}

          <SubHead>Nickname</SubHead>
          {nickDraft !== null ? (
            <Stack direction="row" spacing={1}>
              <TextField size="small" fullWidth autoFocus value={nickDraft} onChange={(e) => setNickDraft(e.target.value)} placeholder="Nickname" />
              <Button variant="contained" onClick={() => { onUpdate({ nickname: nickDraft.trim() }); setNickDraft(null); }}>Save</Button>
            </Stack>
          ) : flight.nickname ? (
            <Stack direction="row" alignItems="center">
              <Typography sx={{ flex: 1 }} fontWeight={600}>{flight.nickname}</Typography>
              <Link component="button" onClick={() => setNickDraft(flight.nickname)}>Edit</Link>
            </Stack>
          ) : (
            <Button fullWidth variant="outlined" color="inherit" startIcon={<AddIcon />} onClick={() => setNickDraft('')} sx={{ borderColor: 'divider' }}>
              Add a nickname
            </Button>
          )}
        </Section>

        <Section title="Flight Information">
          <Box sx={{ mt: 1 }}>
            <InfoTable
              rows={[
                ['Date', fmtDate(start.t)],
                ['Time', `${fmtTime(start.t)} - ${fmtTime(end.t)}`],
                ['Points', flight.points.length],
              ]}
            />
          </Box>
          <SubHead>Extents</SubHead>
          <InfoTable rows={[['Range', `${fmtDistance(stats.range)} from home`], ['Max Alt', `${Math.round(stats.maxHat)} m ATO`]]} />
          <SubHead>Weather</SubHead>
          <InfoTable rows={[['Conditions', flight.weather.conditions], ['Wind', `${flight.weather.windMs} m/s ${flight.weather.windDir}`]]} />
        </Section>

        <Section title="Data & Tracking" defaultExpanded={false}>
          <SubHead>Data Sources</SubHead>
          <InfoTable rows={[[flight.protocol, `${flight.points.length} pts`]]} />
          <SubHead>Collections</SubHead>
          <Button fullWidth variant="outlined" color="inherit" startIcon={<AddIcon />} sx={{ borderColor: 'divider' }}>
            Add to a collection
          </Button>
        </Section>
        <Divider />
      </Box>
    </Paper>
  );
}
