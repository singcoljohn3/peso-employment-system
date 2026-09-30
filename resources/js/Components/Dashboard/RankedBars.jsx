import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import ChartEmpty from './ChartEmpty';
import { AXIS, GRID, ChartTooltip, formatNumber } from './chartTheme';

/**
 * Horizontal ranked bars, used for "applications per job vacancy".
 */
export default function RankedBars({ items, valueKey = 'applications', labelKey = 'label', emptyMessage }) {
    const data = (items || []).map((item) => ({ ...item, display: item[labelKey] }));

    if (!data.length) return <ChartEmpty description={emptyMessage} />;

    return (
        <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }} barCategoryGap="22%">
                <CartesianGrid {...GRID} vertical horizontal={false} />
                <XAxis type="number" {...AXIS} allowDecimals={false} />
                <YAxis type="category" dataKey="display" {...AXIS} width={140} />
                <Tooltip
                    content={<ChartTooltip valueFormatter={formatNumber} />}
                    cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey={valueKey} radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {data.map((item) => (
                        <Cell key={item.id ?? item.display} fill={item.color ?? '#1d4ed8'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
