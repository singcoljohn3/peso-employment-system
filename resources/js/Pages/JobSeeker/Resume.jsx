import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    FileText, Download, RefreshCw, CheckCircle,
    Palette, Eye, Loader2, AlertCircle, User,
    Mail, Phone, MapPin, Calendar, Heart, BookOpen,
    Briefcase, Award, GraduationCap
} from 'lucide-react';

export default function JobSeekerResume({ resume, seekerData, templates, templateKeys }) {
    const user = usePage().props.auth?.user;
    const [selectedTemplate, setSelectedTemplate] = useState(seekerData?.preferred_template ?? 'modern-professional');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

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

    const previewData = resume?.content ?? seekerData;
    const hasResume = resume && resume.status === 'ready_for_download';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Head title="My Resume" />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">My Resume</h1>
                    <p className="mt-1 text-sm text-slate-500">Choose a template and manage your professional resume.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel - Settings */}
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

                        {/* Resume Actions */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-slate-900 mb-3">Actions</h2>
                            <div className="space-y-2">
                                {hasResume && (
                                    <a
                                        href={route('admin.resumes.download', resume.id)}
                                        className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        <Download className="h-4 w-4" /> Download Resume (PDF)
                                    </a>
                                )}
                                {!hasResume && (
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 text-xs">
                                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                        <p>Your resume hasn't been generated yet. Contact PESO admin to generate it.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Summary */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-slate-900 mb-3">Profile Info</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <User className="h-4 w-4" /> {seekerData?.first_name} {seekerData?.last_name}
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Mail className="h-4 w-4" /> {seekerData?.email}
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Phone className="h-4 w-4" /> {seekerData?.contact_number}
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <MapPin className="h-4 w-4" /> {seekerData?.address ?? 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Preview */}
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
                            </div>
                            <div className="p-6 max-h-[800px] overflow-y-auto">
                                {seekerData && (
                                    <div className="space-y-3 text-sm text-slate-600">
                                        <div className="border-b border-slate-200 pb-3">
                                            <h3 className="text-xl font-bold text-slate-900">
                                                {seekerData.first_name} {seekerData.last_name}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {seekerData.email} | {seekerData.contact_number}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">
                                                <GraduationCap className="h-3 w-3 inline mr-1" /> Education
                                            </h4>
                                            <p>{seekerData.educational_attainment ?? 'N/A'}</p>
                                        </div>

                                        {seekerData.occupation && (
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">
                                                    <Briefcase className="h-3 w-3 inline mr-1" /> Work
                                                </h4>
                                                <p>{seekerData.occupation} {seekerData.employer_company ? `at ${seekerData.employer_company}` : ''}</p>
                                            </div>
                                        )}

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

                                        {seekerData.tesda_nc_certificates && (
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">
                                                    <Award className="h-3 w-3 inline mr-1" /> Certifications
                                                </h4>
                                                <p className="text-xs">{seekerData.tesda_nc_certificates}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
