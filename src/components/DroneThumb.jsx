import { Box } from '@mui/material';

/** Generic quadcopter illustration used in place of product photos. */
export default function DroneThumb({ size = 64 }) {
  return (
    <Box component="svg" viewBox="0 0 80 50" sx={{ width: size, height: size * 0.625, flexShrink: 0 }} aria-hidden>
      <g fill="none" stroke="#9aa0a6" strokeWidth="2">
        <ellipse cx="16" cy="14" rx="13" ry="5" />
        <ellipse cx="64" cy="14" rx="13" ry="5" />
        <ellipse cx="16" cy="36" rx="13" ry="5" />
        <ellipse cx="64" cy="36" rx="13" ry="5" />
      </g>
      <path d="M16 14 L34 22 M64 14 L46 22 M16 36 L34 28 M64 36 L46 28" stroke="#c7cbd1" strokeWidth="3" />
      <rect x="30" y="17" width="20" height="16" rx="5" fill="#e3e6ea" stroke="#8d939a" />
      <circle cx="40" cy="31" r="3.2" fill="#2b2f33" />
    </Box>
  );
}
