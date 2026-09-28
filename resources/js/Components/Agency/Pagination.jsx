import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
    links = [],
    prevLink,
    nextLink,
    lastPage,
    from = 0,
    to = 0,
    total = 0,
    label = 'records',
    onPageChange,
}) {
    if (!lastPage || lastPage <= 1) return null;

    const pageLinks = Array.isArray(links) && links.length > 0 ? links.slice(1, -1) : [];

    const go = (link) => {
        if (!link?.url || link.active) return;
        onPageChange?.(link);
    };

    return (
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                    Showing <span className="font-semibold text-slate-700">{from}</span> to <span className="font-semibold text-slate-700">{to}</span> of <span className="font-semibold text-slate-700">{total}</span> {label}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <button
                        type="button"
                        disabled={!prevLink?.url}
                        onClick={() => go(prevLink)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" /> Previous
                    </button>

                    <div className="flex items-center gap-1.5">
                        {pageLinks.map((link, index) =>
                            link.url ? (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => go(link)}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        link.active
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className="px-2 py-2 text-sm text-slate-400 cursor-default"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ),
                        )}
                    </div>

                    <button
                        type="button"
                        disabled={!nextLink?.url}
                        onClick={() => go(nextLink)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Next <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}