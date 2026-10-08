import { useMemo, useState } from 'react';
import {
  Box, Paper, Stack, Typography, TextField, InputAdornment, Button, TablePagination, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PageHeading } from './AlertsCommon.jsx';
import { TRIGGERS } from '../../data/alerts.js';

export default function TriggersPage({ onOpenTrigger = () => {} }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? TRIGGERS.filter((t) => t.name.toLowerCase().includes(q)) : TRIGGERS;
  }, [query]);

  const shown = matches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <PageHeading
        title="Triggers"
        description="Rules that generate alerts when matching drone activity is detected."
      />

      <TextField
        fullWidth
        size="small"
        placeholder="Search triggers…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPage(0); }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 2 }}
      />

      <Stack spacing={1}>
        {shown.map((t) => (
          <Paper
            key={t.id}
            variant="outlined"
            sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5, '&:hover': { borderColor: 'primary.main' } }}
          >
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: t.color, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontWeight={600} noWrap>{t.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t.kind === 'zone' ? 'Alert zone' : 'Watched drone'} · {t.subscribers} subscribers · {t.alerts30d} alerts in 30 days
              </Typography>
            </Box>
            {!t.enabled && <Chip size="small" label="Disabled" variant="outlined" />}
            <Button size="small" endIcon={<ChevronRightIcon />} onClick={() => onOpenTrigger(t.id)}>
              View details
            </Button>
          </Paper>
        ))}
        {shown.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>No triggers match that search.</Typography>
        )}
      </Stack>

      <TablePagination
        component="div"
        count={matches.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Rows per page"
        showFirstButton
        showLastButton
      />
    </Box>
  );
}
