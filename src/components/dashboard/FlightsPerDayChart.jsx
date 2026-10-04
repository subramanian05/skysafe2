import { useTheme } from '@mui/material/styles';
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import ChartTooltip from './ChartTooltip.jsx';

export default function FlightsPerDayChart({ data, variant }) {
  const theme = useTheme();
  const [current, previous] = theme.palette.series;
  const axis = theme.palette.text.secondary;
  const grid = theme.palette.divider;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 28, left: -16 }}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: axis, fontSize: 11 }} angle={-45} textAnchor="end" interval="preserveStartEnd" stroke={grid} />
        <YAxis tick={{ fill: axis, fontSize: 11 }} stroke={grid} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: axis, strokeDasharray: '4 4' }} />
        <Legend verticalAlign="bottom" height={28} iconType="circle" wrapperStyle={{ fontSize: 12, color: axis }} />
        {variant === 'bar' ? (
          <>
            <Bar dataKey="flights" name="Flights" fill={current} radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Bar dataKey="previous" name="Flights (Previous)" fill={previous} radius={[4, 4, 0, 0]} maxBarSize={18} />
          </>
        ) : (
          <>
            <Line type="linear" dataKey="flights" name="Flights" stroke={current} strokeWidth={2} dot={{ r: 3, fill: current, strokeWidth: 0 }} activeDot={{ r: 5 }} isAnimationActive={false} />
            <Line type="linear" dataKey="previous" name="Flights (Previous)" stroke={previous} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: previous, strokeWidth: 0 }} isAnimationActive={false} />
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
