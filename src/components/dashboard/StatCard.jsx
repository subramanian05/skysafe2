import { Paper, Stack, Typography, Box } from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

const ICONS = {
  total: FlightIcon,
  suspect: WarningAmberIcon,
  hostile: ShieldOutlinedIcon,
  alerts: NotificationsNoneIcon,
};

const ICON_COLOR = {
  total: 'text.secondary',
  suspect: 'error.main',
  hostile: 'error.main',
  alerts: 'text.secondary',
};

function Delta({ value }) {
  const flat = Math.abs(value) < 0.05;
  const up = value > 0;
  const color = flat ? 'text.secondary' : up ? 'success.main' : 'error.main';
  return (
    <Typography variant="body2" color="text.secondary">
      <Box component="span" sx={{ color, fontWeight: 700 }}>
        {flat ? 'No change' : `${up ? '+' : ''}${value.toFixed(1)}%`}
      </Box>{' '}
      from the previous period
    </Typography>
  );
}

export default function StatCard({ stat }) {
  const Icon = ICONS[stat.key] ?? FlightIcon;
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" alignItems="flex-start">
        <Typography fontWeight={700} sx={{ flex: 1 }}>{stat.label}</Typography>
        <Icon sx={{ color: ICON_COLOR[stat.key], fontSize: 20 }} />
      </Stack>
      <Typography sx={{ fontSize: 34, fontWeight: 700, lineHeight: 1.3, mt: 0.5 }}>
        {stat.value.toLocaleString()}
      </Typography>
      <Delta value={stat.delta} />
    </Paper>
  );
}
