import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

const TONES = {
    blue: 'bg-blue-50 text-blue-700',
    teal: 'bg-teal-50 text-teal-700',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-50 text-slate-700',
};

const numberFormat = new Intl.NumberFormat('en-PH');

/**
 * Headline counter. `delta` is the period-over-period percentage change that
 * the analytics service computes server-side.
 */
export default function MetricCard({ label, value, delta, hint, icon: Icon, tone = 'blue' }) {
    const numeric = Number(value) || 0;
    const change = delta === null || delta === undefined ? null : Number(delta);
    const flat = change === 0;
    const rising = !flat && change > 0;

    const DeltaIcon = flat ? Minus : rising ? TrendingUp : TrendingDown;
    const deltaTone = flat
        ? 'bg-slate-50 text-slate-500'
        : rising
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-red-50 text-red-700';

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">{label}</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {numberFormat.format(numeric)}
                    </p>
                </div>
                {Icon ? (
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONES[tone] || TONES.blue}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                ) : null}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
                {change !== null ? (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${deltaTone}`}>
                        <DeltaIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {flat ? '0%' : `${rising ? '+' : ''}${change}%`}
                    </span>
                ) : null}
                {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
            </div>
        </div>
    );
}
