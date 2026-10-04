import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Snackbar, useMediaQuery, IconButton, Paper, Tooltip } from '@mui/material';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import { buildTheme } from './theme/theme.js';
import { generateFlights } from './data/flights.js';
import TopNav from './components/TopNav.jsx';
import FlightMap from './components/FlightMap.jsx';
import MapControls, { floatingSx } from './components/MapControls.jsx';
import DetectionsPanel from './components/DetectionsPanel.jsx';
import FiltersPanel from './components/FiltersPanel.jsx';
import FlightDetailsPanel from './components/FlightDetailsPanel.jsx';
import LastUpdateCard from './components/LastUpdateCard.jsx';
import AltitudeProfile from './components/AltitudeProfile.jsx';
import { SearchDialog, DataPointsDialog } from './components/Dialogs.jsx';
import DashboardPage from './components/dashboard/DashboardPage.jsx';
import {
  DEFAULT_FILTERS, TIME_PRESETS, activeFilterCount, applyFilters, fmtDateTime, lastPoint,
} from './utils.js';

function downloadFile(name, text, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

const csvRow = (cells) => cells.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',');

export default function App() {
  // ---- theme ----
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [themePref, setThemePref] = useState(() => {
    try { return localStorage.getItem('themePref') || 'dark'; } catch { return 'dark'; }
  });
  useEffect(() => { try { localStorage.setItem('themePref', themePref); } catch { /* ignore */ } }, [themePref]);
  const mode = themePref === 'auto' ? (prefersDark ? 'dark' : 'light') : themePref;
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const compact = useMediaQuery(theme.breakpoints.down('md'));

  // ---- data ----
  const [flights, setFlights] = useState(() => generateFlights(18));
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const filtered = useMemo(() => applyFilters(flights, filters), [flights, filters]);

  // ---- ui state ----
  const [page, setPage] = useState('map'); // 'map' | 'dashboard'
  const [panel, setPanel] = useState(null); // 'detections' | 'filters' | null
  const [selectedId, setSelectedId] = useState(null);
  const [detailsId, setDetailsId] = useState(null);
  const [detailsOpenMobile, setDetailsOpenMobile] = useState(false);
  const [view, setView] = useState(null);
  const [baseLayer, setBaseLayer] = useState('satellite');
  const [showTracks, setShowTracks] = useState(true);
  const [showHomes, setShowHomes] = useState(true);
  const [rulerActive, setRulerActive] = useState(false);
  const [rulerPoints, setRulerPoints] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [altitudeOpen, setAltitudeOpen] = useState(true);
  const [lastUpdateOpen, setLastUpdateOpen] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [watched, setWatched] = useState(() => new Set());
  const [toast, setToast] = useState('');

  const detailsFlight = flights.find((f) => f.id === detailsId) ?? null;
  const cursorIndex = detailsFlight ? Math.min(cursor ?? detailsFlight.points.length - 1, detailsFlight.points.length - 1) : 0;

  const focusFlight = useCallback(
    (id) => {
      const f = flights.find((x) => x.id === id);
      if (!f) return;
      setView({ bounds: [f.home, ...f.points.map((p) => [p.lat, p.lng])], k: Date.now() });
    },
    [flights]
  );

  const openDetails = (id) => {
    setDetailsId(id);
    setSelectedId(id);
    setPanel(null);
    setCursor(null);
    setPlaying(false);
    setAltitudeOpen(true);
    setLastUpdateOpen(true);
    setDetailsOpenMobile(false);
    focusFlight(id);
  };

  const closeDetails = () => {
    setDetailsId(null);
    setPlaying(false);
    setCursor(null);
    setPanel('detections');
  };

  // playback
  useEffect(() => {
    if (!playing || !detailsFlight) return undefined;
    const id = setInterval(() => {
      setCursor((c) => {
        const next = (c ?? -1) + 1;
        if (next >= detailsFlight.points.length - 1) {
          setPlaying(false);
          return detailsFlight.points.length - 1;
        }
        return next;
      });
    }, 600);
    return () => clearInterval(id);
  }, [playing, detailsFlight]);

  const togglePlay = () => {
    if (!detailsFlight) return;
    if (!playing && cursorIndex >= detailsFlight.points.length - 1) setCursor(0);
    setPlaying((p) => !p);
  };

  // flight shown on the map during playback is truncated to the cursor
  const mapFlights = useMemo(() => {
    if (!detailsFlight) return filtered;
    return [{ ...detailsFlight, points: detailsFlight.points.slice(0, cursorIndex + 1) }];
  }, [filtered, detailsFlight, cursorIndex]);

  const updateFlight = (id, patch) => setFlights((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const exportList = () => {
    const rows = [csvRow(['Model', 'Manufacturer', 'Serial', 'Affiliation', 'Last seen', 'Lat', 'Lng', 'MSL (m)'])];
    filtered.forEach((f) => {
      const p = lastPoint(f);
      rows.push(csvRow([f.model, f.manufacturer, f.serial, f.affiliation, fmtDateTime(p.t), p.lat.toFixed(5), p.lng.toFixed(5), p.msl]));
    });
    downloadFile('detections.csv', rows.join('\n'));
  };

  const downloadFlight = () => {
    const f = detailsFlight;
    const rows = [csvRow(['time', 'lat', 'lng', 'msl_m', 'hat_m', 'speed_mps', 'rssi_db'])];
    f.points.forEach((p) => rows.push(csvRow([new Date(p.t).toISOString(), p.lat, p.lng, p.msl, p.hat, p.speed, p.rssi])));
    downloadFile(`${f.serial}_flight.csv`, rows.join('\n'));
  };

  const onMapSelect = (id) => {
    if (detailsId) return;
    setSelectedId(id);
    setPanel('detections');
  };

  const onContextCoords = async ([lat, lng]) => {
    try {
      await navigator.clipboard.writeText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      setToast('Coordinates copied to clipboard.');
    } catch {
      setToast(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  };

  const timeLabel = TIME_PRESETS.find((p) => p.label === filters.preset)?.name ?? 'Custom';
  const showDetailsPanel = detailsFlight && (!compact || detailsOpenMobile);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <TopNav
          themePref={themePref}
          onThemePref={setThemePref}
          page={page}
          onPage={setPage}
          onRegion={(r) => { setPage('map'); setView({ center: r.center, zoom: r.zoom, k: Date.now() }); }}
        />

        {page === 'dashboard' && (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DashboardPage />
          </Box>
        )}

        <Box sx={{ flex: 1, minHeight: 0, display: page === 'map' ? 'flex' : 'none', position: 'relative' }}>
          {showDetailsPanel && (
            <Box sx={compact ? { position: 'absolute', inset: 0, zIndex: 1200 } : { width: 420, flexShrink: 0 }}>
              <FlightDetailsPanel
                key={detailsFlight.id}
                flight={detailsFlight}
                onBack={closeDetails}
                onUpdate={(patch) => updateFlight(detailsFlight.id, patch)}
                altitudeOpen={altitudeOpen}
                onToggleAltitude={() => setAltitudeOpen((v) => !v)}
                playing={playing}
                onTogglePlay={togglePlay}
                onDownload={downloadFlight}
                onShowTable={() => setTableOpen(true)}
                watched={watched.has(detailsFlight.serial)}
                onToggleWatch={() => {
                  const serial = detailsFlight.serial;
                  const n = new Set(watched);
                  if (n.has(serial)) n.delete(serial);
                  else n.add(serial);
                  setWatched(n);
                  setToast(n.has(serial) ? 'Watching this drone.' : 'Stopped watching this drone.');
                }}
                onFocus={() => focusFlight(detailsFlight.id)}
              />
            </Box>
          )}

          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
              <FlightMap
                flights={mapFlights}
                selectedId={selectedId}
                detailsId={detailsId}
                onSelect={onMapSelect}
                view={view}
                baseLayer={baseLayer}
                showTracks={showTracks}
                showHomes={showHomes}
                rulerActive={rulerActive}
                rulerPoints={rulerPoints}
                onRulerPoint={(p) => setRulerPoints((pts) => [...pts, p])}
                onContextCoords={onContextCoords}
                layoutKey={`${!!detailsId}-${altitudeOpen}-${compact}`}
              />

              {detailsFlight ? (
                <>
                  <MapControls
                    detailsMode
                    extraTop={
                      compact && (
                        <Tooltip title="Flight details">
                          <Paper sx={floatingSx}>
                            <IconButton onClick={() => setDetailsOpenMobile(true)} sx={{ width: 44, height: 44, borderRadius: 1.5 }} aria-label="Open flight details">
                              <ViewSidebarOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Paper>
                        </Tooltip>
                      )
                    }
                    timeLabel={timeLabel}
                    filterCount={0}
                    flightCount={1}
                    panel="details"
                    onPanel={() => {}}
                    onSearch={() => setSearchOpen(true)}
                    rulerActive={rulerActive}
                    onRuler={() => { setRulerActive((v) => !v); setRulerPoints([]); }}
                    baseLayer={baseLayer}
                    onBaseLayer={setBaseLayer}
                    showTracks={showTracks}
                    onShowTracks={setShowTracks}
                    showHomes={showHomes}
                    onShowHomes={setShowHomes}
                  />
                  {lastUpdateOpen && (
                    <LastUpdateCard
                      flight={detailsFlight}
                      index={cursorIndex}
                      onClose={() => setLastUpdateOpen(false)}
                      sx={compact ? { top: 12, left: 68, right: 12, width: 'auto' } : { top: 12, left: 68 }}
                    />
                  )}
                </>
              ) : (
                <>
                  <MapControls
                    timeLabel={timeLabel}
                    filterCount={activeFilterCount(filters)}
                    flightCount={filtered.length}
                    panel={panel}
                    onPanel={setPanel}
                    onSearch={() => setSearchOpen(true)}
                    rulerActive={rulerActive}
                    onRuler={() => { setRulerActive((v) => !v); setRulerPoints([]); }}
                    baseLayer={baseLayer}
                    onBaseLayer={setBaseLayer}
                    showTracks={showTracks}
                    onShowTracks={setShowTracks}
                    showHomes={showHomes}
                    onShowHomes={setShowHomes}
                  />
                  {panel === 'detections' && (
                    <DetectionsPanel
                      flights={filtered}
                      selectedId={selectedId}
                      onSelect={(id) => { setSelectedId(id); if (id) focusFlight(id); }}
                      onDetails={openDetails}
                      onFocus={focusFlight}
                      onClose={() => setPanel(null)}
                      onExport={exportList}
                    />
                  )}
                  {panel === 'filters' && (
                    <FiltersPanel filters={filters} onChange={setFilters} onClose={() => setPanel(null)} />
                  )}
                </>
              )}
            </Box>

            {detailsFlight && altitudeOpen && (
              <AltitudeProfile
                flight={detailsFlight}
                index={cursorIndex}
                onIndex={(i) => { setPlaying(false); setCursor(i); }}
                onClose={() => setAltitudeOpen(false)}
              />
            )}
          </Box>
        </Box>
      </Box>

      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        flights={flights}
        onPickFlight={(id) => { setSelectedId(id); setPanel('detections'); focusFlight(id); }}
        onPickCoords={(c) => setView({ center: c, zoom: 17, k: Date.now() })}
      />
      <DataPointsDialog open={tableOpen} onClose={() => setTableOpen(false)} flight={detailsFlight} />
      <Snackbar
        open={!!toast}
        autoHideDuration={2500}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </ThemeProvider>
  );
}
