import {
  Box, Button, Typography, TextField, InputAdornment, IconButton, ToggleButtonGroup, ToggleButton,
  Accordion, AccordionSummary, AccordionDetails, Autocomplete, Chip, Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import SidePanel from './SidePanel.jsx';
import { AFFILIATIONS, MANUFACTURERS, MODELS } from '../data/flights.js';
import { DEFAULT_FILTERS, TIME_PRESETS } from '../utils.js';

function Label({ children, right }) {
  return (
    <Stack direction="row" alignItems="center" sx={{ mb: 0.75, mt: 1.75 }}>
      <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>{children}</Typography>
      {right}
    </Stack>
  );
}

function MultiSelect({ options, value, onChange, placeholder }) {
  return (
    <Autocomplete
      multiple
      size="small"
      options={options}
      value={value}
      onChange={(_, v) => onChange(v)}
      renderTags={(v, getTagProps) =>
        v.map((opt, i) => {
          const { key, ...rest } = getTagProps({ index: i });
          return <Chip key={key} size="small" label={opt} {...rest} />;
        })
      }
      renderInput={(params) => <TextField {...params} placeholder={value.length ? '' : placeholder} />}
    />
  );
}

export default function FiltersPanel({ filters, onChange, onClose }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const preset = TIME_PRESETS.find((p) => p.label === filters.preset);
  const readOnlyAdornment = {
    endAdornment: (
      <InputAdornment position="end">
        <IconButton size="small" edge="end" aria-label="Edit time"><EditCalendarOutlinedIcon fontSize="small" /></IconButton>
      </InputAdornment>
    ),
    readOnly: true,
  };

  const modelOptions = MODELS.filter(
    (m) => !filters.manufacturer.length || filters.manufacturer.includes(m.manufacturer)
  ).map((m) => m.model);

  return (
    <SidePanel
      title="Filters"
      onClose={onClose}
      actions={
        <Button size="small" variant="outlined" color="inherit" startIcon={<RestartAltIcon />} onClick={() => onChange(DEFAULT_FILTERS)} sx={{ borderColor: 'divider' }}>
          Reset
        </Button>
      }
    >
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="overline">Time</Typography></AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Label>Start time</Label>
          <TextField fullWidth size="small" value={preset ? `${preset.name.replace('Last ', '')} Ago` : ''} InputProps={readOnlyAdornment} />
          <Label>End time</Label>
          <TextField fullWidth size="small" value="Now" InputProps={readOnlyAdornment} />
          <Label>Presets</Label>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={filters.preset}
            onChange={(_, v) => v && set({ preset: v })}
            sx={{ gap: 0.75, '& .MuiToggleButtonGroup-grouped': { border: 0, borderRadius: '6px !important', bgcolor: 'action.selected' } }}
          >
            {TIME_PRESETS.map((p) => (
              <ToggleButton
                key={p.label}
                value={p.label}
                sx={{ '&.Mui-selected, &.Mui-selected:hover': { bgcolor: 'primary.main', color: '#fff' } }}
              >
                {p.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="overline">Drone</Typography></AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 3 }}>
          <Label>Affiliation</Label>
          <MultiSelect options={AFFILIATIONS} value={filters.affiliation} onChange={(v) => set({ affiliation: v })} placeholder="Select affiliation" />

          <Label>Manufacturer</Label>
          <MultiSelect options={MANUFACTURERS} value={filters.manufacturer} onChange={(v) => set({ manufacturer: v })} placeholder="Select drone manufacturer" />

          <Label
            right={
              <ToggleButtonGroup exclusive size="small" color="primary" value={filters.modelMode} onChange={(_, v) => v && set({ modelMode: v })}>
                <ToggleButton value="include" sx={{ py: 0.25 }}>Include</ToggleButton>
                <ToggleButton value="exclude" sx={{ py: 0.25 }}>Exclude</ToggleButton>
              </ToggleButtonGroup>
            }
          >
            Model
          </Label>
          <MultiSelect options={modelOptions} value={filters.model} onChange={(v) => set({ model: v })} placeholder="Select drone model to show" />

          <Label
            right={
              <ToggleButtonGroup exclusive size="small" color="primary" value={filters.heightRef} onChange={(_, v) => v && set({ heightRef: v })}>
                <ToggleButton value="msl" sx={{ py: 0.25 }}>MSL</ToggleButton>
                <ToggleButton value="hat" sx={{ py: 0.25 }}>HAT</ToggleButton>
              </ToggleButtonGroup>
            }
          >
            Height is above
          </Label>
          <TextField
            fullWidth size="small" type="number" value={filters.minHeight}
            onChange={(e) => set({ minHeight: e.target.value })}
            InputProps={{ endAdornment: <InputAdornment position="end">m</InputAdornment> }}
          />

          <Label
            right={
              <ToggleButtonGroup exclusive size="small" color="primary" value={filters.weightOp} onChange={(_, v) => v && set({ weightOp: v })}>
                <ToggleButton value="lt" sx={{ py: 0.25 }}>&lt;</ToggleButton>
                <ToggleButton value="gte" sx={{ py: 0.25 }}>≥</ToggleButton>
              </ToggleButtonGroup>
            }
          >
            Weight is {filters.weightOp === 'lt' ? 'under' : 'at least'}
          </Label>
          <TextField
            fullWidth size="small" type="number" value={filters.weight}
            onChange={(e) => set({ weight: e.target.value })}
            InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }}
          />
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">Drones with no published weight are always shown.</Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    </SidePanel>
  );
}
