import { createTheme, alpha } from '@mui/material/styles';

const brand = {
  blue: '#3b7cf6',
  yellow: '#f5e050',
  green: '#4caf6a',
  red: '#ef5350',
};

export function buildTheme(mode = 'dark') {
  const dark = mode === 'dark';
  const bg = dark ? '#121212' : '#f4f5f7';
  const paper = dark ? '#1b1b1d' : '#ffffff';
  const border = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';

  return createTheme({
    palette: {
      mode,
      primary: { main: brand.blue },
      warning: { main: brand.yellow },
      success: { main: brand.green },
      error: { main: brand.red },
      background: { default: bg, paper },
      divider: border,
      drone: { track: brand.yellow, home: brand.yellow },
      // Categorical series palette, validated for CVD separation in both modes.
      series: dark
        ? ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767']
        : ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
      seriesMuted: dark ? '#6b7280' : '#9aa0a6',
      surface: {
        header: dark ? '#0e0e0f' : '#ffffff',
        section: dark ? '#262628' : '#eceef2',
        inset: dark ? '#141415' : '#f7f8fa',
        overlay: dark ? alpha('#111112', 0.92) : alpha('#ffffff', 0.94),
      },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      button: { textTransform: 'none', fontWeight: 600 },
      overline: { fontWeight: 700, letterSpacing: 0.6, fontSize: 13 },
      mono: { fontFamily: '"JetBrains Mono", ui-monospace, monospace' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          'html, body, #root': { height: '100%' },
          body: { overflow: 'hidden' },
          '.leaflet-container': { background: dark ? '#0b1a2b' : '#dfe6ee', fontFamily: 'inherit' },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.surface.header,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 6 } },
      },
      MuiOutlinedInput: {
        styleOverrides: { root: ({ theme }) => ({ backgroundColor: theme.palette.surface.inset }) },
      },
      MuiAccordion: {
        defaultProps: { disableGutters: true, elevation: 0, square: true },
        styleOverrides: {
          root: ({ theme }) => ({
            background: 'transparent',
            borderBottom: `1px solid ${theme.palette.divider}`,
            '&:before': { display: 'none' },
          }),
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: ({ theme }) => ({
            minHeight: 52,
            borderLeft: '4px solid transparent',
            '&.Mui-expanded': {
              backgroundColor: theme.palette.surface.section,
              borderLeftColor: theme.palette.primary.main,
            },
          }),
          content: { margin: 0 },
        },
      },
      MuiTooltip: { defaultProps: { arrow: true, placement: 'right' } },
      MuiToggleButton: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 600, padding: '4px 12px' } },
      },
    },
  });
}
