import { useState } from 'react';
import {
  Box, Alert, AlertTitle, Link, Paper, Switch, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, IconButton, Menu, MenuItem, Snackbar, Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import dayjs from 'dayjs';
import { PageHeading, StatusChip } from './AlertsCommon.jsx';
import { WATCHED_DRONES } from '../../data/alerts.js';

export default function WatchedDronesPage() {
  const [rows, setRows] = useState(WATCHED_DRONES);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menu, setMenu] = useState({ el: null, id: null });
  const [toast, setToast] = useState('');

  // SMS is disabled until a verified phone number exists, as in the real app.
  const smsAvailable = false;

  const setField = (id, patch) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const shown = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <PageHeading
        title="Watched Drones"
        description="Your personal alert preferences for watched drones. Changes here only affect you, not other group members."
      />

      {!smsAvailable && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Some notification channels are unavailable</AlertTitle>
          SMS — add a verified phone number to enable SMS for watched drones.{' '}
          <Link href="#" underline="hover" onClick={(e) => e.preventDefault()}>Add a phone number →</Link>
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Serial', 'Drone', 'Sources', 'Status', 'Email', 'SMS', 'Created', ''].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={(t) => ({ fontFamily: t.typography.mono.fontFamily })}>{r.serial}</TableCell>
                <TableCell>{r.model}</TableCell>
                <TableCell>{r.source}</TableCell>
                <TableCell><StatusChip status={r.status} /></TableCell>
                <TableCell>
                  <Switch
                    size="small"
                    checked={r.email}
                    onChange={(e) => { setField(r.id, { email: e.target.checked }); setToast(`Email ${e.target.checked ? 'on' : 'off'} for ${r.serial}`); }}
                    inputProps={{ 'aria-label': `Email alerts for ${r.serial}` }}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    size="small"
                    checked={r.sms && smsAvailable}
                    disabled={!smsAvailable}
                    onChange={(e) => setField(r.id, { sms: e.target.checked })}
                    inputProps={{ 'aria-label': `SMS alerts for ${r.serial}` }}
                  />
                </TableCell>
                <TableCell>{dayjs(r.createdAt).format('MMM D, YYYY')}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" aria-label={`Actions for ${r.serial}`} onClick={(e) => setMenu({ el: e.currentTarget, id: r.id })}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {shown.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No watched drones yet.</Typography>
                </TableCell>
              </TableRow>
            )}
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

      <Menu anchorEl={menu.el} open={!!menu.el} onClose={() => setMenu({ el: null, id: null })}>
        <MenuItem onClick={() => { setField(menu.id, { status: 'Paused' }); setMenu({ el: null, id: null }); setToast('Watch paused'); }}>
          Pause watch
        </MenuItem>
        <MenuItem onClick={() => { setField(menu.id, { status: 'Active' }); setMenu({ el: null, id: null }); setToast('Watch resumed'); }}>
          Resume watch
        </MenuItem>
        <MenuItem
          onClick={() => {
            setRows((prev) => prev.filter((r) => r.id !== menu.id));
            setMenu({ el: null, id: null });
            setToast('Watch removed');
          }}
        >
          Stop watching
        </MenuItem>
      </Menu>

      <Snackbar open={!!toast} autoHideDuration={2200} onClose={() => setToast('')} message={toast} />
    </Box>
  );
}
