/**
 * Placeholder rendered instead of a chart when a period has no rows, so the
 * grid never collapses or shows a 0-height Recharts container.
 */
export default function ChartEmpty({ title = 'No data for this period', description }) {
    return (
        <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            {description ? <p className="max-w-xs text-xs text-slate-400">{description}</p> : null}
        </div>
    );
}
