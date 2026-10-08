import { useState } from 'react';
import {
  AppBar, Toolbar, Box, Typography, Button, Badge, IconButton, Menu, MenuItem, Divider,
  ToggleButtonGroup, ToggleButton, ListItemText, useMediaQuery, Drawer, List, ListItemButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CampaignIcon from '@mui/icons-material/Campaign';
import MenuIcon from '@mui/icons-material/Menu';
import BrandMark from './BrandMark.jsx';

export const REGIONS = [
  { name: 'San Diego, CA', center: [32.75, -117.14], zoom: 10 },
  { name: 'Brownsville, TX', center: [25.9718, -97.2889], zoom: 11 },
  { name: 'Nogales, AZ', center: [31.3477, -110.9613], zoom: 10 },
  { name: 'Rio Grande Valley, TX', center: [26.3368, -98.8079], zoom: 10 },
];

const LINKS = ['Dashboard', 'Flight Map', 'Regions', 'Alerts', 'Data Hub', 'System Status'];

export default function TopNav({ themePref, onThemePref, onRegion, page = 'map', onPage = () => {}, alertCount = 1 }) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const [regionEl, setRegionEl] = useState(null);
  const [userEl, setUserEl] = useState(null);
  const [drawer, setDrawer] = useState(false);

  const themeToggle = (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={themePref}
      onChange={(_, v) => v && onThemePref(v)}
      sx={{ px: 2, py: 1 }}
    >
      <ToggleButton value="auto">Auto</ToggleButton>
      <ToggleButton value="dark">Dark</ToggleButton>
      <ToggleButton value="light">Light</ToggleButton>
    </ToggleButtonGroup>
  );

  const PAGE_OF = { Dashboard: 'dashboard', 'Flight Map': 'map', Alerts: 'alerts' };

  const navButton = (label) => {
    const active = PAGE_OF[label] === page;
    if (label === 'Regions')
      return (
        <Button key={label} color="inherit" endIcon={<ArrowDropDownIcon />} onClick={(e) => setRegionEl(e.currentTarget)} sx={navSx(false)}>
          Regions
        </Button>
      );
    if (label === 'Alerts')
      return (
        <Button key={label} color="inherit" sx={navSx(active)} onClick={() => onPage('alerts')}>
          Alerts
          <Badge badgeContent={alertCount} color="error" sx={{ ml: 1.75, '& .MuiBadge-badge': { position: 'static', transform: 'none' } }} />
        </Button>
      );
    if (label === 'System Status')
      return (
        <Button key={label} color="inherit" sx={navSx(false)} endIcon={<Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'success.main' }} />}>
          System Status
        </Button>
      );
    return (
      <Button
        key={label}
        color="inherit"
        sx={navSx(active)}
        aria-current={active ? 'page' : undefined}
        onClick={() => PAGE_OF[label] && onPage(PAGE_OF[label])}
      >
        {label}
      </Button>
    );
  };

  return (
    <AppBar position="static">
      <Toolbar variant="dense" sx={{ minHeight: 56, gap: 1 }}>
        <Box sx={{ cursor: 'pointer' }} onClick={() => onPage('map')}><BrandMark /></Box>
        {!compact && <Box sx={{ display: 'flex', ml: 2 }}>{LINKS.map(navButton)}</Box>}
        <Box sx={{ flex: 1 }} />
        <IconButton color="inherit" aria-label="Product news" size="small">
          <CampaignIcon fontSize="small" />
        </IconButton>
        {compact ? (
          <IconButton aria-label="Open menu" onClick={() => setDrawer(true)} sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
            <MenuIcon />
          </IconButton>
        ) : (
          <Button color="inherit" onClick={(e) => setUserEl(e.currentTarget)} endIcon={<ArrowDropDownIcon />} sx={{ textAlign: 'left', lineHeight: 1.2 }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>Raj Subramanian</Typography>
              <Typography variant="caption" color="text.secondary">Operator</Typography>
            </Box>
          </Button>
        )}
      </Toolbar>

      <Menu anchorEl={regionEl} open={!!regionEl} onClose={() => setRegionEl(null)}>
        {REGIONS.map((r) => (
          <MenuItem key={r.name} onClick={() => { onRegion(r); setRegionEl(null); }}>{r.name}</MenuItem>
        ))}
      </Menu>

      <Menu anchorEl={userEl} open={!!userEl} onClose={() => setUserEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {['Settings', 'Alert Zones', 'Collections', 'Documentation', 'Help'].map((l) => (
          <MenuItem key={l} onClick={() => setUserEl(null)}>{l}</MenuItem>
        ))}
        <Divider />
        {themeToggle}
        <Divider />
        <MenuItem onClick={() => setUserEl(null)}>Logout</MenuItem>
      </Menu>

      <Drawer anchor="right" open={drawer} onClose={() => setDrawer(false)}>
        <Box sx={{ width: 280 }}>
          <List>
            {LINKS.filter((l) => l !== 'Regions').map((l) => (
              <ListItemButton
                key={l}
                selected={PAGE_OF[l] === page}
                onClick={() => { if (PAGE_OF[l]) onPage(PAGE_OF[l]); setDrawer(false); }}
              >
                <ListItemText primary={l} />
              </ListItemButton>
            ))}
            <Divider />
            {REGIONS.map((r) => (
              <ListItemButton key={r.name} onClick={() => { onRegion(r); setDrawer(false); }}>
                <ListItemText primary={r.name} secondary="Region" />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          {themeToggle}
        </Box>
      </Drawer>
    </AppBar>
  );
}

const navSx = (active) => ({
  color: active ? 'text.primary' : 'text.secondary',
  fontWeight: active ? 600 : 500,
  px: 1.25,
  '&:hover': { color: 'text.primary' },
});
