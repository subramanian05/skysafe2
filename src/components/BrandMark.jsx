import { Box, Typography } from '@mui/material';

export const APP_NAME = 'SkySafe';

export default function BrandMark() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        component="svg"
        viewBox="0 0 32 32"
        sx={{ width: 32, height: 32 }}
        aria-hidden
      >
        <circle cx="16" cy="16" r="15" fill="#5b9bf0" />
        <path d="M10 10l12 12M22 10L10 22" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
        {[[9, 9], [23, 9], [9, 23], [23, 23]].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="2" fill="#fff" />
        ))}
      </Box>
      <Typography variant="h6" fontWeight={500} sx={{ letterSpacing: 0.2 }}>
        {APP_NAME}
      </Typography>
    </Box>
  );
}
