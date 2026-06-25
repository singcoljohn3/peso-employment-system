import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    FileText, Download, RefreshCw, CheckCircle,
    Palette, Eye, Loader2, AlertCircle, User,
    Mail, Phone, MapPin, Calendar, Heart, BookOpen,
    Briefcase, Award, GraduationCap, XCircle,
    Clock, FileDown, ShieldCheck, ExternalLink,
    Info
} from 'lucide-react';

export default function JobSeekerResume({ resume, seekerData, templates, templateKeys }) {
    const user = usePage().props.auth?.user;
    const [selectedTemplate, setSelectedTemplate] = useState(seekerData?.preferred_template ?? 'modern-professional');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewHtml, setPreviewHtml] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [missingFields, setMissingFields] = useState([]);
    const [generating, setGenerating] = useState(false);

    const hasResume = resume && ['generated', 'ready_for_download', 'downloaded', 'updated'].includes(resume?.status);
    const isDownloaded = resume?.status === 'downloaded' || resume?.status === 'updated';
    const statusLabel = resume?.status_label ?? 'Not Generated';
    const downloadCount = resume?.download_count ?? 0;

    const handleTemplateChange = async (templateKey) => {
        setSelectedTemplate(templateKey);
        setSaving(true);
        try {
            const response = await fetch('/api/resume/template', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ template: templateKey }),
            });
            const data = await response.json();
            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (err) {
            console.error('Failed to update template:', err);
        } finally {
            setSaving(false);
        }
    };

    const loadPreview = async (template) => {
        setShowPreview(true);
        setPreviewLoading(true);
        setPreviewHtml(null);
        try {
            const response = await fetch(`/api/resume/preview?template=${template}`, {
                headers: { 'Accept': 'application/json' },
            });
            const data = await response.json();
            if (data.html) {
                setPreviewHtml(data.html);
            } else if (data.data) {
                setPreviewHtml(null);
            }
            if (data.missing_fields && Object.keys(data.missing_fields).length > 0) {
                setMissingFields(Object.values(data.missing_fields));
            } else {
                setMissingFields([]);
            }
        } catch (err) {
            console.error('Failed to load preview:', err);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const response = await fetch('/api/resume/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ template: selectedTemplate }),
            });
            const data = await response.json();
            if (response.ok) {
                router.reload();
            } else {
                if (data.missing_fields) {
                    setMissingFields(Array.isArray(data.missing_fields) ? data.missing_fields : Object.values(data.missing_fields));
                }
                alert(data.message || 'Failed to generate resume');
            }
        } catch (err) {
            alert('Failed to generate resume');
        } finally {
            setGenerating(false);
        }
    };

    const getStatusBadge = () => {
        if (!resume) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                    <Clock className="h-3 w-3" /> Not Generated
                </span>
            );
        }
        const s = resume.status;
        if (s === 'generated' || s === 'ready_for_download') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">
                    <CheckCircle className="h-3 w-3" /> Generated
                </span>
            );
        }
        if (s === 'downloaded') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-medium text-teal-700">
                    <FileDown className="h-3 w-3" /> Downloaded
                </span>
            );
        }
        if (s === 'updated') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-medium text-indigo-700">
                    <RefreshCw className="h-3 w-3" /> Updated
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">
                <Clock className="h-3 w-3" /> {statusLabel}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Head title="My Resume" />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Resume</h1>
                        <p className="mt-1 text-sm text-slate-500">Choose a template, generate, and download your professional resume.</p>
                    </div>
                    <div className="hidden sm:block">
                        {getStatusBadge()}
                    </div>
                </div>

                {/* Status Banner */}
                {!resume && (
                    <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">No resume generated yet</p>
                            <p className="mt-0.5">Select a template below and click "Generate Resume" to create your professional resume.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Template Selection */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Palette className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900">Resume Template</h2>
                            </div>
                            <div className="space-y-2">
                                {templates?.map((tmpl) => (
                                    <button
                                        key={tmpl.key}
                                        onClick={() => handleTemplateChange(tmpl.key)}
                                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                                            selectedTemplate === tmpl.key
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-800">{tmpl.label}</span>
                                            {selectedTemplate === tmpl.key && (
                                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">{tmpl.key}</p>
                                    </button>
                                ))}
                            </div>
                            {saving && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                                </div>
                            )}
                            {saved && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                                    <CheckCircle className="h-3 w-3" /> Template saved!
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-slate-900 mb-3">Actions</h2>
                            <div className="space-y-2">
                                <button
                                    onClick={() => loadPreview(selectedTemplate)}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                                >
                                    <Eye className="h-4 w-4" /> Preview Resume
                                </button>
                                {hasResume && resume?.download_url && (
                                    <a
                                        href={resume.download_url}
                                        className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        <Download className="h-4 w-4" /> Download Resume (PDF)
                                    </a>
                                )}
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {generating ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                                    ) : (
                                        <><RefreshCw className="h-4 w-4" /> {hasResume ? 'Regenerate Resume' : 'Generate Resume'}</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Resume Status */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-slate-900 mb-3">Resume Status</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Status</span>
                                    {getStatusBadge()}
                                </div>
                                {resume && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500">Template</span>
                                            <span className="font-medium text-slate-700">
                                                {templates?.find(t => t.key === resume.template)?.label ?? resume.template}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500">Downloads</span>
                                            <span className="font-medium text-slate-700">{downloadCount}</span>
                                        </div>
                                        {resume.generated_at && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">Generated</span>
                                                <span className="text-xs text-slate-600">{new Date(resume.generated_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {resume.downloaded_at && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">Last Downloaded</span>
                                                <span className="text-xs text-slate-600">{new Date(resume.downloaded_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Profile Summary */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-slate-900 mb-3">Profile Info</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <User className="h-4 w-4 shrink-0" /> {seekerData?.first_name} {seekerData?.last_name}
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Mail className="h-4 w-4 shrink-0" /> {seekerData?.email}
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Phone className="h-4 w-4 shrink-0" /> {seekerData?.contact_number ?? 'N/A'}
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <MapPin className="h-4 w-4 shrink-0" /> {seekerData?.address ?? 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Live Preview */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">Preview</span>
                                    <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                                        {templates?.find(t => t.key === selectedTemplate)?.label ?? selectedTemplate}
                                    </span>
                                </div>
                                <button
                                    onClick={() => loadPreview(selectedTemplate)}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Refresh Preview
                                </button>
                            </div>
                            <div className="p-6 max-h-[800px] overflow-y-auto">
                                {seekerData && (
                                    <div className="space-y-3 text-sm text-slate-600">
                                        <div className="border-b border-slate-200 pb-3">
                                            <h3 className="text-xl font-bold text-slate-900">
                                                {seekerData.first_name} {seekerData.last_name}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {seekerData.email} | {seekerData.contact_number ?? 'N/A'}
                                            </p>
                                        </div>

                                        {/* Career Objective */}
                                        {seekerData.preferred_job && (
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">
                                                    <Heart className="h-3 w-3 inline mr-1" /> Career Objective
                                                </h4>
                                                <p className="text-xs text-slate-500 italic">
                                                    Seeking a position as {seekerData.preferred_job} where I can utilize my skills and experience to contribute to organizational growth.
                                                </p>
                                            </div>
                                        )}

                                        {/* Personal Info */}
                                        <div className="grid grid-cols-2 gap-2">
                                            {seekerData.birthdate && (
                                                <div>
                                                    <span className="text-xs text-slate-400">Birthdate</span>
                                                    <p className="text-sm">{new Date(seekerData.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                </div>
                                            )}
                                            {seekerData.age && (
                                                <div>
                                                    <span className="text-xs text-slate-400">Age</span>
                                                    <p className="text-sm">{seekerData.age}</p>
                                                </div>
                                            )}
                                            {seekerData.civil_status && (
                                                <div>
                                                    <span className="text-xs text-slate-400">Civil Status</span>
                                                    <p className="text-sm">{seekerData.civil_status}</p>
                                                </div>
                                            )}
                                            {seekerData.sex && (
                                                <div>
                                                    <span className="text-xs text-slate-400">Sex</span>
                                                    <p className="text-sm">{seekerData.sex}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Education */}
                                        <div>
                                            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">
                                                <GraduationCap className="h-3 w-3 inline mr-1" /> Educational Background
                                            </h4>
                                            <p className="text-sm">{seekerData.educational_attainment ?? 'N/A'}</p>
                                        </div>

                                        {/* Work Experience */}
                                        {(seekerData.occupation || seekerData.employer_company) && (
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">
                                                    <Briefcase className="h-3 w-3 inline mr-1" /> Work Experience
                                                </h4>
                                                <p className="text-sm">
                                                    {seekerData.occupation ?? 'N/A'}
                                                    {seekerData.employer_company ? ` at ${seekerData.employer_company}` : ''}
                                                    {seekerData.work_experience_years ? ` (${seekerData.work_experience_years} yr(s))` : ''}
                                                </p>
                                            </div>
                                        )}

                                        {/* Skills */}
                                        {seekerData.skills && (
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">
                                                    <Award className="h-3 w-3 inline mr-1" /> Skills
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(Array.isArray(seekerData.skills) ? seekerData.skills : (seekerData.skills ? seekerData.skills.split(',').map(s => s.trim()) : [])).map((skill, i) => (
                                                        <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Certifications */}
                                        {seekerData.tesda_nc_certificates && (
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">
                                                    <Award className="h-3 w-3 inline mr-1" /> Certifications
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {seekerData.tesda_nc_certificates.split(',').map((cert, i) => (
                                                        <span key={i} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded">{cert.trim()}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Other Trainings */}
                                        {seekerData.other_trainings && (
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">
                                                    <BookOpen className="h-3 w-3 inline mr-1" /> Trainings & Seminars
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {seekerData.other_trainings.split(',').map((t, i) => (
                                                        <span key={i} className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded">{t.trim()}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Professional Licenses */}
                                        {seekerData.professional_licenses && (
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">
                                                    <ShieldCheck className="h-3 w-3 inline mr-1" /> Professional Licenses
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {seekerData.professional_licenses.split(',').map((l, i) => (
                                                        <span key={i} className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded">{l.trim()}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Missing Fields Warning */}
                                        {missingFields.length > 0 && (
                                            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                                                <div className="flex items-start gap-2">
                                                    <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-medium text-amber-800">Missing Information</p>
                                                        <p className="text-xs text-amber-700 mt-0.5">
                                                            The following fields are needed for a complete resume: {missingFields.join(', ')}.
                                                        </p>
                                                        <p className="text-xs text-amber-600 mt-0.5">
                                                            Update your profile to include these details.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {!seekerData && (
                                    <div className="text-center py-12 text-slate-400">
                                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                        <p>Complete your profile first to see a resume preview.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPreview(false)}>
                    <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl mx-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-slate-500" />
                                <h3 className="font-semibold text-slate-900">Resume Preview</h3>
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                    {templates?.find(t => t.key === selectedTemplate)?.label ?? selectedTemplate}
                                </span>
                            </div>
                            <button onClick={() => setShowPreview(false)} className="p-1 rounded-lg hover:bg-slate-100">
                                <XCircle className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                            {previewLoading && (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            )}
                            {previewHtml && !previewLoading && (
                                <div className="bg-white shadow-sm mx-auto" style={{ maxWidth: '210mm' }}>
                                    <iframe
                                        srcDoc={previewHtml}
                                        className="w-full border-0"
                                        style={{ minHeight: '297mm' }}
                                        title="Resume Preview"
                                    />
                                </div>
                            )}
                            {!previewHtml && !previewLoading && (
                                <div className="text-center py-12 text-slate-400">
                                    <FileText className="h-8 w-8 mx-auto mb-2" />
                                    <p>Unable to generate preview. Complete your profile information.</p>
                                </div>
                            )}
                        </div>
                        <div className="border-t border-slate-200 px-6 py-3 flex items-center justify-between">
                            <span className="text-xs text-slate-400">PDF preview may differ slightly from the generated file</span>
                            {hasResume && resume?.download_url && (
                                <a
                                    href={resume.download_url}
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <Download className="h-4 w-4" /> Download PDF
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
