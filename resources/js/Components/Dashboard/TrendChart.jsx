import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import ChartEmpty from './ChartEmpty';
import { AXIS, GRID, ChartTooltip, toRows, tooltipCursor } from './chartTheme';

/**
 * Time-series chart. Pass a single series for an area chart, or several
 * `series` for a multi-line comparison.
 */
export default function TrendChart({ points, series, variant = 'area', emptyMessage }) {
    const rows = toRows(points, series.map((item) => item.key));
    const isEmpty = !rows.length || rows.every((row) => series.every((item) => !row[item.key]));

    if (isEmpty) return <ChartEmpty description={emptyMessage} />;

    return (
        <div style={{ width: '100%', height: '100%', minHeight: 200 }}>
            <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} width="100%" height="100%">
                <AreaChart data={rows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                        {series.map((item) => (
                            <linearGradient key={item.key} id={`fill-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={item.color} stopOpacity={0.28} />
                                <stop offset="100%" stopColor={item.color} stopOpacity={0.02} />
                            </linearGradient>
                        ))}
                    </defs>

                    <CartesianGrid {...GRID} />
                    <XAxis
                        dataKey="label"
                        {...AXIS}
                        interval="preserveStartEnd"
                        minTickGap={12}
                    />
                    <YAxis {...AXIS} allowDecimals={false} width={52} />
                    <Tooltip
                        content={<ChartTooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.full_label} />}
                        cursor={tooltipCursor}
                    />

                    {series.map((item) =>
                        variant === 'line' ? (
                            <Line
                                key={item.key}
                                type="monotone"
                                dataKey={item.key}
                                name={item.label}
                                stroke={item.color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        ) : (
                            <Area
                                key={item.key}
                                type="monotone"
                                dataKey={item.key}
                                name={item.label}
                                stroke={item.color}
                                strokeWidth={2}
                                fill={`url(#fill-${item.key})`}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        ),
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
