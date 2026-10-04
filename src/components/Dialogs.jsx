import { useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, TextField, InputAdornment, List, ListItemButton, ListItemText,
  Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, IconButton, Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { fmtTime, timeAgo, lastPoint } from '../utils.js';

const COORD_RE = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;

export function SearchDialog({ open, onClose, flights, onPickFlight, onPickCoords }) {
  const [q, setQ] = useState('');
  const coords = q.match(COORD_RE);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s || coords) return [];
    return flights.filter((f) =>
      [f.model, f.serial, f.nickname, f.manufacturer].some((v) => v?.toLowerCase().includes(s))
    );
  }, [q, flights, coords]);

  const close = () => { setQ(''); onClose(); };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>Search</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus fullWidth size="small" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Serial, model, nickname or lat, lng"
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            if (coords) { onPickCoords([+coords[1], +coords[2]]); close(); }
            else if (results[0]) { onPickFlight(results[0].id); close(); }
          }}
        />
        <List dense sx={{ mt: 1 }}>
          {coords && (
            <ListItemButton onClick={() => { onPickCoords([+coords[1], +coords[2]]); close(); }}>
              <ListItemText primary={`Go to ${coords[1]}, ${coords[2]}`} secondary="Coordinates" />
            </ListItemButton>
          )}
          {results.map((f) => (
            <ListItemButton key={f.id} onClick={() => { onPickFlight(f.id); close(); }}>
              <ListItemText primary={f.model} secondary={`${f.serial} · ${timeAgo(lastPoint(f).t)}`} />
            </ListItemButton>
          ))}
          {q && !coords && results.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No matching flights.</Typography>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
}

export function DataPointsDialog({ open, onClose, flight }) {
  if (!flight) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" alignItems="center">
          <span style={{ flex: 1 }}>Data Points · {flight.model}</span>
          <IconButton onClick={onClose} aria-label="Close"><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {['#', 'Time', 'Latitude', 'Longitude', 'MSL (m)', 'HAT (m)', 'Speed (m/s)', 'RSSI (dB)'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {flight.points.map((p, i) => (
                <TableRow key={p.t} hover>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{fmtTime(p.t)}</TableCell>
                  <TableCell>{p.lat.toFixed(5)}</TableCell>
                  <TableCell>{p.lng.toFixed(5)}</TableCell>
                  <TableCell>{p.msl}</TableCell>
                  <TableCell>{p.hat}</TableCell>
                  <TableCell>{p.speed}</TableCell>
                  <TableCell>{p.rssi}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}
