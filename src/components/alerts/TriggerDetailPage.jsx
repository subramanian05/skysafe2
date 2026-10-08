import { useMemo, useState } from 'react';
import {
  Box, Paper, Stack, Typography, Button, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { MapContainer, TileLayer, Polygon, Marker, ScaleControl } from 'react-leaflet';
import dayjs from 'dayjs';
import { AffiliationDot } from './AlertsCommon.jsx';
import { droneIcon } from '../mapIcons.js';
import { TRIGGERS, historicalAlerts } from '../../data/alerts.js';

export default function TriggerDetailPage({ triggerId, onBack, onOpenFlight = () => {} }) {
  const trigger = TRIGGERS.find((t) => t.id === triggerId);
  const rows = useMemo(() => (trigger ? historicalAlerts(trigger.id) : []), [trigger]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!trigger) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>Back to triggers</Button>
        <Typography sx={{ mt: 4 }} color="text.secondary">That trigger no longer exists.</Typography>
      </Box>
    );
  }

  const shown = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <IconButton onClick={onBack} aria-label="Back to triggers" sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>{trigger.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {trigger.kind === 'zone' ? 'Trigger region' : 'Watched drone'} created on {trigger.createdAt}
          </Typography>
        </Box>
        <Chip size="small" label={`${trigger.subscribers} subscribers`} variant="outlined" />
      </Stack>

      <Paper variant="outlined" sx={{ height: 320, mb: 2, overflow: 'hidden', position: 'relative' }}>
        <MapContainer center={trigger.center} zoom={trigger.polygon ? 13 : 10} scrollWheelZoom={false} style={{ position: 'absolute', inset: 0 }}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
            maxZoom={19}
          />
          <ScaleControl position="bottomright" imperial={false} />
          {trigger.polygon ? (
            <Polygon positions={trigger.polygon} pathOptions={{ color: trigger.color, weight: 2, fillOpacity: 0.2 }} />
          ) : (
            <Marker position={trigger.center} icon={droneIcon(trigger.color)} />
          )}
        </MapContainer>
      </Paper>

      <Typography fontWeight={700} sx={{ mb: 1 }}>Historical Alerts</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {['', 'Date', 'Time', 'Affiliation', 'Target ID', 'Drone Model'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>
                  <Button size="small" endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />} onClick={() => onOpenFlight(r.id)}>
                    View
                  </Button>
                </TableCell>
                <TableCell>{dayjs(r.at).format('YYYY-MM-DD')}</TableCell>
                <TableCell>{dayjs(r.at).format('HH:mm:ss')}</TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <AffiliationDot affiliation={r.affiliation} />
                    <span style={{ textTransform: 'capitalize' }}>{r.affiliation}</span>
                  </Stack>
                </TableCell>
                <TableCell sx={(t) => ({ fontFamily: t.typography.mono.fontFamily })}>{r.targetId}</TableCell>
                <TableCell>{r.model}</TableCell>
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
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="Rows per page"
        />
      </TableContainer>
    </Box>
  );
}
