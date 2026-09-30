import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartEmpty from './ChartEmpty';
import { AXIS, GRID, ChartTooltip, formatNumber } from './chartTheme';

/**
 * Vertical bars for a small set of totals (e.g. total / active / closed).
 */
export default function MetricBars({ bars, valueKey = 'value', labelKey = 'label', emptyMessage, layout = 'vertical' }) {
    const data = (bars || []).map((bar) => ({
        ...bar,
        display: bar[labelKey],
        raw: bar[valueKey],
    }));

    if (!data.length) return <ChartEmpty description={emptyMessage} />;

    const isHorizontal = layout === 'horizontal';
    const categoryAxis = { dataKey: 'display', type: 'category', ...AXIS };

    return (
        <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} width="100%" height="100%">
            <BarChart
                data={data}
                layout={isHorizontal ? 'vertical' : 'horizontal'}
                margin={{ top: 8, right: 12, left: isHorizontal ? 24 : -18, bottom: 0 }}
                barCategoryGap="28%"
            >
                <CartesianGrid {...GRID} vertical={isHorizontal} horizontal={!isHorizontal} />
                {isHorizontal ? (
                    <>
                        <XAxis type="number" {...AXIS} allowDecimals={false} />
                        <YAxis {...categoryAxis} width={130} />
                    </>
                ) : (
                    <>
                        <XAxis {...categoryAxis} interval={0} />
                        <YAxis {...AXIS} allowDecimals={false} width={52} />
                    </>
                )}
                <Tooltip
                    content={<ChartTooltip valueFormatter={formatNumber} />}
                    cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="raw" radius={isHorizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={72}>
                    {data.map((bar) => (
                        <Cell key={bar.key ?? bar.display} fill={bar.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
