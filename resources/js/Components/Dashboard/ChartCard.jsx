import { ChartLegend } from './chartTheme';

/**
 * White card used to frame every dashboard chart and table.
 */
export default function ChartCard({
    title,
    subtitle,
    legend,
    action,
    footer,
    children,
    className = '',
    bodyClassName = 'h-64',
}) {
    return (
        <section
            className={`flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
        >
            <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold tracking-tight text-slate-800 sm:text-base">{title}</h3>
                    {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
                </div>
                {action ?? <ChartLegend items={legend} />}
            </header>

            <div className={`min-w-0 flex-1 ${bodyClassName}`}>{children}</div>

            {footer ? <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">{footer}</div> : null}
        </section>
    );
}
