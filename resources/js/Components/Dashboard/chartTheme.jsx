/**
 * Shared Recharts theme for the three portal dashboards.
 *
 * Keeps the PESO blue / white / slate palette consistent and gives every chart
 * identical axis, grid and tooltip styling.
 */
export const PALETTE = {
    primary: '#1d4ed8',
    teal: '#0d9488',
    amber: '#d97706',
    violet: '#7c3aed',
    red: '#dc2626',
    slate: '#94a3b8',
    light: '#cbd5e1',
};

export const SERIES_COLORS = [
    PALETTE.primary,
    PALETTE.teal,
    PALETTE.amber,
    PALETTE.violet,
    PALETTE.red,
    PALETTE.slate,
];

export const AXIS = {
    stroke: '#94a3b8',
    fontSize: 11,
    tickLine: false,
    axisLine: false,
};

export const GRID = {
    stroke: '#e2e8f0',
    strokeDasharray: '3 3',
    vertical: false,
};

const numberFormat = new Intl.NumberFormat('en-PH');

export const formatNumber = (value) => numberFormat.format(Number(value) || 0);

export const tooltipCursor = { stroke: '#cbd5e1', strokeWidth: 1 };

/** Recharts `content` renderer shared by every chart on the dashboards. */
export function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter = formatNumber, footer }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
            <p className="mb-1 font-semibold text-slate-800">
                {labelFormatter ? labelFormatter(label, payload) : label}
            </p>
            <ul className="space-y-0.5">
                {payload.map((entry, index) => (
                    <li key={`${entry.dataKey}-${index}`} className="flex items-center gap-2">
                        <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: entry.color || entry.fill }}
                        />
                        <span className="text-slate-500">{entry.name}</span>
                        <span className="ml-auto font-semibold text-slate-900">
                            {valueFormatter(entry.value)}
                        </span>
                    </li>
                ))}
            </ul>
            {footer ? <p className="mt-1 border-t border-slate-100 pt-1 text-slate-500">{footer}</p> : null}
        </div>
    );
}

/** Legend row rendered in the card header so charts can omit Recharts' own. */
export function ChartLegend({ items }) {
    if (!items?.length) return null;

    return (
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {items.map((item) => (
                <li key={item.key} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.label}
                </li>
            ))}
        </ul>
    );
}

/** Turn the server's `points` array into Recharts rows. */
export function toRows(points, keys) {
    return (points || []).map((point) => {
        const row = { key: point.key, label: point.label, full_label: point.full_label };

        keys.forEach((key) => {
            row[key] = Number(point[key]) || 0;
        });

        return row;
    });
}
