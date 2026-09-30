import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ChartEmpty from './ChartEmpty';
import { ChartTooltip, formatNumber } from './chartTheme';

/**
 * Status distribution donut with the period total in the middle.
 */
export default function StatusDonut({ slices, total, centerLabel = 'Total', emptyMessage }) {
    const data = (slices || []).filter((slice) => Number(slice.value) > 0);

    if (!data.length) return <ChartEmpty description={emptyMessage} />;

    const sum = total ?? data.reduce((acc, slice) => acc + Number(slice.value || 0), 0);

    return (
        <div className="relative h-full w-full" style={{ minHeight: 180 }}>
            <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} width="100%" height="100%">
                <PieChart>
                    <Tooltip
                        content={({ active, payload }) =>
                            active && payload?.length ? (
                                <ChartTooltip
                                    active={active}
                                    payload={payload}
                                    label={payload[0].name}
                                    valueFormatter={formatNumber}
                                    footer={`${payload[0].payload.percent ?? 0}% of applications`}
                                />
                            ) : null
                        }
                    />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="label"
                        innerRadius="62%"
                        outerRadius="88%"
                        paddingAngle={data.length > 1 ? 2 : 0}
                        stroke="none"
                    >
                        {data.map((slice) => (
                            <Cell key={slice.key} fill={slice.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {formatNumber(sum)}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    {centerLabel}
                </span>
            </div>
        </div>
    );
}
