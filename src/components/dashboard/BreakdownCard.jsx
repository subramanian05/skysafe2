import { useMemo, useState } from 'react';
import { Box, Select, MenuItem, Stack, Typography, Table, TableBody, TableCell, TableRow, TableHead } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList,
} from 'recharts';
import Panel from './Panel.jsx';
import ChartTooltip from './ChartTooltip.jsx';

const MAX_SLICES = 7;

/** Top-N breakdown shown as a pie, a ranked bar chart, or current-vs-previous bars. */
export default function BreakdownCard({ title, subtitle, data, height = 320 }) {
  const theme = useTheme();
  const [variant, setVariant] = useState('pie');
  const colors = theme.palette.series;
  const axis = theme.palette.text.secondary;

  const rows = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    if (sorted.length <= MAX_SLICES) return sorted;
    const head = sorted.slice(0, MAX_SLICES);
    const rest = sorted.slice(MAX_SLICES);
    return [
      ...head,
      {
        name: 'Other',
        value: rest.reduce((a, d) => a + d.value, 0),
        prev: rest.reduce((a, d) => a + (d.prev ?? 0), 0),
        other: true,
      },
    ];
  }, [data]);

  const total = rows.reduce((a, d) => a + d.value, 0);
  const colorAt = (i, row) => (row.other ? theme.palette.seriesMuted : colors[i % colors.length]);

  const selector = (
    <Select size="small" value={variant} onChange={(e) => setVariant(e.target.value)} sx={{ minWidth: 118 }}>
      <MenuItem value="pie">Pie</MenuItem>
      <MenuItem value="bar">Bar</MenuItem>
      <MenuItem value="compare">Compare</MenuItem>
    </Select>
  );

  return (
    <Panel title={title} subtitle={subtitle} action={selector} height={height}>
      <Box sx={{ flex: 1, minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          {variant === 'pie' ? (
            <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Pie
                data={rows}
                dataKey="value"
                nameKey="name"
                innerRadius="45%"
                outerRadius="74%"
                paddingAngle={1}
                stroke={theme.palette.background.paper}
                strokeWidth={2}
                isAnimationActive={false}
                label={({ percent, name }) => (percent >= 0.06 ? `${name} · ${(percent * 100).toFixed(0)}%` : '')}
                labelLine={{ stroke: axis }}
              >
                {rows.map((row, i) => (
                  <Cell key={row.name} fill={colorAt(i, row)} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12, color: axis }} />
            </PieChart>
          ) : (
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 8, right: 36, bottom: 8, left: 8 }}
              barCategoryGap={8}
            >
              <CartesianGrid stroke={theme.palette.divider} horizontal={false} />
              <XAxis type="number" tick={{ fill: axis, fontSize: 11 }} stroke={theme.palette.divider} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fill: axis, fontSize: 11 }} stroke={theme.palette.divider} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: theme.palette.action.hover }} />
              {variant === 'compare' ? (
                <>
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12, color: axis }} />
                  <Bar dataKey="value" name="Current" fill={colors[0]} radius={[0, 4, 4, 0]} maxBarSize={14} />
                  <Bar dataKey="prev" name="Previous" fill={colors[1]} radius={[0, 4, 4, 0]} maxBarSize={14} />
                </>
              ) : (
                <Bar dataKey="value" name="Flights" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {rows.map((row, i) => (
                    <Cell key={row.name} fill={colorAt(i, row)} />
                  ))}
                  <LabelList dataKey="value" position="right" style={{ fill: axis, fontSize: 11 }} />
                </Bar>
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </Box>

      {variant === 'pie' && (
        <Box sx={{ maxHeight: 148, overflowY: 'auto', mt: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 0.5 }}>Category</TableCell>
                <TableCell align="right" sx={{ py: 0.5 }}>Flights</TableCell>
                <TableCell align="right" sx={{ py: 0.5 }}>Share</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={row.name}>
                  <TableCell sx={{ py: 0.4 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colorAt(i, row), flexShrink: 0 }} />
                      <Typography variant="body2" noWrap>{row.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 0.4 }}>{row.value.toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ py: 0.4 }}>{((row.value / total) * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Panel>
  );
}
