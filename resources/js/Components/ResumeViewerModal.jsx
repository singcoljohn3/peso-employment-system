import Modal from '@/Components/Modal';

export default function ResumeViewerModal({ show, onClose, resumeUrl, seekerName }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                        {seekerName ? `${seekerName}'s Resume` : 'Resume Preview'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {resumeUrl ? (
                    <iframe
                        src={resumeUrl}
                        className="h-[600px] w-full rounded-lg border border-slate-200"
                        title="Resume Preview"
                    />
                ) : (
                    <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-slate-300">
                        <p className="text-sm text-slate-500">No resume available for preview.</p>
                    </div>
                )}
                <div className="mt-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Close
                    </button>
                    {resumeUrl && (
                        <a
                            href={resumeUrl}
                            download
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Download
                        </a>
                    )}
                </div>
            </div>
        </Modal>
    );
}
