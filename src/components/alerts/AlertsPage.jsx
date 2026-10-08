import { useState } from 'react';
import {
  Box, Container, List, ListItemButton, ListItemText, Typography, Divider, Drawer, IconButton,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import RecentActivityPage from './RecentActivityPage.jsx';
import TriggersPage from './TriggersPage.jsx';
import TriggerDetailPage from './TriggerDetailPage.jsx';
import WatchedDronesPage from './WatchedDronesPage.jsx';
import NotificationsCenterPage from './NotificationsCenterPage.jsx';

const SECTIONS = [
  { id: 'recent', label: 'Recent Activity' },
  { id: 'triggers', label: 'Triggers' },
  { id: 'watched', label: 'Watched Drones' },
];

const ADMIN_SECTIONS = [{ id: 'notifications', label: 'Notifications Center' }];

function SideNav({ section, onSection }) {
  const item = (s) => (
    <ListItemButton
      key={s.id}
      selected={section === s.id}
      onClick={() => onSection(s.id)}
      sx={{ borderRadius: 1, mb: 0.25, '&.Mui-selected': { bgcolor: 'action.selected' } }}
    >
      <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: section === s.id ? 700 : 500 }} primary={s.label} />
    </ListItemButton>
  );

  return (
    <Box sx={{ width: 220, flexShrink: 0, p: 1.5 }}>
      <Typography variant="overline" sx={{ px: 1 }}>Alerts</Typography>
      <Divider sx={{ my: 1 }} />
      <List dense disablePadding>{SECTIONS.map(item)}</List>
      <Typography variant="overline" color="text.secondary" sx={{ px: 1, mt: 2, display: 'block' }}>Admin</Typography>
      <Divider sx={{ my: 1 }} />
      <List dense disablePadding>{ADMIN_SECTIONS.map(item)}</List>
    </Box>
  );
}

/**
 * The Alerts tab: Recent Activity, Triggers (with detail), Watched Drones and the
 * admin Notifications Center. All sections run on mock data from src/data/alerts.js.
 */
export default function AlertsPage({ onOpenFlight = () => {} }) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const [section, setSection] = useState('recent');
  const [triggerId, setTriggerId] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  const go = (id) => {
    setSection(id);
    setTriggerId(null);
    setNavOpen(false);
  };

  const openTrigger = (id) => {
    setSection('triggers');
    setTriggerId(id);
  };

  let content;
  if (section === 'triggers' && triggerId) {
    content = <TriggerDetailPage triggerId={triggerId} onBack={() => setTriggerId(null)} onOpenFlight={onOpenFlight} />;
  } else if (section === 'triggers') {
    content = <TriggersPage onOpenTrigger={setTriggerId} />;
  } else if (section === 'watched') {
    content = <WatchedDronesPage />;
  } else if (section === 'notifications') {
    content = <NotificationsCenterPage />;
  } else {
    content = <RecentActivityPage onOpenFlight={onOpenFlight} onOpenTrigger={openTrigger} />;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {compact ? (
        <Drawer open={navOpen} onClose={() => setNavOpen(false)}>
          <SideNav section={section} onSection={go} />
        </Drawer>
      ) : (
        <Box sx={{ borderRight: 1, borderColor: 'divider', overflowY: 'auto' }}>
          <SideNav section={section} onSection={go} />
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {compact && (
            <IconButton onClick={() => setNavOpen(true)} aria-label="Alerts sections" sx={{ mb: 1, border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
              <MenuOpenIcon fontSize="small" />
            </IconButton>
          )}
          {content}
        </Container>
      </Box>
    </Box>
  );
}
