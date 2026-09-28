import { router } from '@inertiajs/react';

const OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
];

/**
 * Server-side time filter. Re-requests the current page with a `period` query
 * parameter so every chart re-renders from freshly aggregated data.
 */
export default function TimeFilter({ period, options = OPTIONS, className = '' }) {
    const select = (event) => {
        router.get(
            window.location.pathname,
            { period: event.target.value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <div
            className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm ${className}`}
        >
            {options.map((option) => {
                const active = option.value === period;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => router.get(
                            window.location.pathname,
                            { period: option.value },
                            { preserveState: true, preserveScroll: true, replace: true },
                        )}
                        aria-pressed={active}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition sm:px-3 sm:text-sm ${
                            active
                                ? 'bg-blue-700 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {option.label}
                    </button>
                );
            })}
            <select
                className="sr-only"
                value={period}
                onChange={select}
                aria-label="Reporting period"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
