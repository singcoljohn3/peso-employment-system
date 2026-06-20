import React, { useState } from 'react';
import { Download, FileText, Table, FileSpreadsheet, Printer, Loader2 } from 'lucide-react';

export default function ExportButtons({ onExport, loading }) {
    const [showDropdown, setShowDropdown] = useState(false);

    const exportOptions = [
        {
            id: 'pdf',
            label: 'Export PDF',
            icon: FileText,
            description: 'Download as PDF document',
            color: 'text-red-600 hover:bg-red-50'
        },
        {
            id: 'excel',
            label: 'Export Excel',
            icon: FileSpreadsheet,
            description: 'Download as Excel spreadsheet',
            color: 'text-green-600 hover:bg-green-50'
        },
        {
            id: 'csv',
            label: 'Export CSV',
            icon: Table,
            description: 'Download as CSV file',
            color: 'text-blue-600 hover:bg-blue-50'
        },
        {
            id: 'print',
            label: 'Print Report',
            icon: Printer,
            description: 'Print current report view',
            color: 'text-purple-600 hover:bg-purple-50'
        }
    ];

    const handleExportClick = (format) => {
        if (format === 'print') {
            window.print();
        } else {
            onExport(format);
        }
        setShowDropdown(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Download className="h-4 w-4" />
                )}
                Export
                <svg
                    className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {showDropdown && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg z-20">
                        <div className="py-2">
                            {exportOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleExportClick(option.id)}
                                        disabled={loading}
                                        className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${option.color}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <div className="text-left">
                                            <p className="font-medium">{option.label}</p>
                                            <p className="text-xs opacity-75">{option.description}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
