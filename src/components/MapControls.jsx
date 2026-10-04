import { useState } from 'react';
import {
  Box, Paper, ButtonBase, Divider, Typography, Tooltip, IconButton, Menu, MenuItem, ListSubheader,
  FormControlLabel, Switch, Radio, Badge,
} from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import SearchIcon from '@mui/icons-material/Search';
import StraightenIcon from '@mui/icons-material/Straighten';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { BASE_LAYERS } from './FlightMap.jsx';

export const floatingSx = (theme) => ({
  bgcolor: theme.palette.surface.overlay,
  border: `1px solid ${theme.palette.divider}`,
  backdropFilter: 'blur(6px)',
  borderRadius: 1.5,
  boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
});

export function PillButton({ icon, label, onClick, active, ariaLabel, reverse, badge = 0 }) {
  return (
    <Paper sx={(t) => ({ ...floatingSx(t), ...(active && { borderColor: t.palette.primary.main }) })}>
      <ButtonBase
        onClick={onClick}
        aria-label={ariaLabel}
        sx={{ display: 'flex', flexDirection: reverse ? 'row-reverse' : 'row', alignItems: 'center', height: 44, px: 1.5, borderRadius: 1.5 }}
      >
        <Badge color="primary" variant="dot" invisible={!badge}>{icon}</Badge>
        <Divider orientation="vertical" flexItem sx={{ mx: 1.25, my: 1.25 }} />
        <Typography variant="body2" fontWeight={700}>{label}</Typography>
      </ButtonBase>
    </Paper>
  );
}

function ToolButton({ title, onClick, active, children }) {
  return (
    <Tooltip title={title}>
      <Paper sx={(t) => ({ ...floatingSx(t), ...(active && { bgcolor: t.palette.primary.main, color: '#fff' }) })}>
        <IconButton aria-label={title} onClick={onClick} sx={{ width: 44, height: 44, borderRadius: 1.5, color: 'inherit' }}>
          {children}
        </IconButton>
      </Paper>
    </Tooltip>
  );
}

export default function MapControls({
  timeLabel, filterCount, flightCount, panel, onPanel, onSearch, rulerActive, onRuler,
  baseLayer, onBaseLayer, showTracks, onShowTracks, showHomes, onShowHomes, detailsMode = false, extraTop = null,
}) {
  const [settingsEl, setSettingsEl] = useState(null);

  return (
    <>
      {(
        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 1.25, alignItems: 'flex-start' }}>
          {extraTop}
          {!detailsMode && <PillButton
            icon={<FilterAltOutlinedIcon fontSize="small" />}
            label={timeLabel}
            ariaLabel={`Filters, ${timeLabel}`}
            active={panel === 'filters'}
            badge={filterCount}
            onClick={() => onPanel(panel === 'filters' ? null : 'filters')}
          />}
          <ToolButton title="Search" onClick={onSearch}><SearchIcon fontSize="small" /></ToolButton>
          <ToolButton title="Ruler" onClick={onRuler} active={rulerActive}><StraightenIcon fontSize="small" /></ToolButton>
          <ToolButton title="Settings" onClick={(e) => setSettingsEl(e.currentTarget.closest('.MuiPaper-root'))}>
            <SettingsOutlinedIcon fontSize="small" />
          </ToolButton>
        </Box>
      )}

      {!panel && !detailsMode && (
        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
          <PillButton
            reverse
            icon={<FormatListBulletedIcon fontSize="small" />}
            label={`${flightCount} Flights`}
            ariaLabel={`Flights, ${flightCount} Flights`}
            onClick={() => onPanel('detections')}
          />
        </Box>
      )}

      <Menu
        anchorEl={settingsEl}
        open={!!settingsEl}
        onClose={() => setSettingsEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { ml: 1, minWidth: 220 } } }}
      >
        <ListSubheader>Base map</ListSubheader>
        {Object.entries(BASE_LAYERS).map(([key, l]) => (
          <MenuItem key={key} dense onClick={() => onBaseLayer(key)}>
            <Radio size="small" checked={baseLayer === key} sx={{ p: 0.5, mr: 1 }} />
            {l.label}
          </MenuItem>
        ))}
        <ListSubheader>Layers</ListSubheader>
        <MenuItem dense>
          <FormControlLabel control={<Switch size="small" checked={showTracks} onChange={(e) => onShowTracks(e.target.checked)} />} label="Flight tracks" />
        </MenuItem>
        <MenuItem dense>
          <FormControlLabel control={<Switch size="small" checked={showHomes} onChange={(e) => onShowHomes(e.target.checked)} />} label="Home points" />
        </MenuItem>
      </Menu>
    </>
  );
}
