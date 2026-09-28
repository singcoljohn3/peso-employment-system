import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import AgencyLayouts from '@/Layouts/AgencyLayouts';
import TemplateThumbnail, { LAYOUTS } from '@/Components/Agency/TemplateThumbnail';
import {
    ArrowLeft,
    Check,
    ChevronDown,
    ChevronUp,
    Download,
    Eye,
    GripVertical,
    LayoutTemplate,
    Loader2,
    Palette,
    Pencil,
    Plus,
    Save,
    Trash2,
    Upload,
    User,
    X,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Small building blocks                                              */
/* ------------------------------------------------------------------ */

function Field({ label, value, onChange, placeholder, type = 'text', required = false, multiline = false, rows = 3 }) {
    const common =
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

    return (
        <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {multiline ? (
                <textarea rows={rows} value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${common} resize-y`} />
            ) : (
                <input type={type} value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={common} />
            )}
        </div>
    );
}

function Card({ title, icon: Icon, children, action = null, description = null }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div className="min-w-0">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        {Icon && <Icon className="h-4 w-4 text-blue-600" />}
                        {title}
                    </h3>
                    {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
                </div>
                {action}
            </header>
            <div className="space-y-3 p-4">{children}</div>
        </section>
    );
}

/**
 * Generic repeater used for every list section (education, experience, skills,
 * projects, references, ...). Supports add / edit / delete / reorder.
 */
function Repeater({ items, fields, onChange, addLabel, singular }) {
    const rows = Array.isArray(items) ? items : [];

    const update = (index, key, value) => {
        const next = rows.map((row, i) => (i === index ? { ...row, [key]: value } : row));
        onChange(next);
    };

    const remove = (index) => onChange(rows.filter((_, i) => i !== index));

    const move = (index, delta) => {
        const target = index + delta;
        if (target < 0 || target >= rows.length) return;
        const next = [...rows];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    return (
        <div className="space-y-3">
            {rows.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                    No {singular} entries yet.
                </p>
            )}

            {rows.map((row, index) => (
                <div key={index} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">
                            {singular.charAt(0).toUpperCase() + singular.slice(1)} {index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-30" title="Move up">
                                <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-30" title="Move down">
                                <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => remove(index)} className="rounded p-1 text-red-500 hover:bg-white" title="Delete">
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {fields.map((field) => (
                            <div key={field.key} className={field.full ? 'sm:col-span-2' : ''}>
                                <Field
                                    label={field.label}
                                    value={row[field.key]}
                                    onChange={(v) => update(index, field.key, v)}
                                    placeholder={field.placeholder}
                                    multiline={field.multiline}
                                    rows={field.rows}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={() => onChange([...rows, Object.fromEntries(fields.map((f) => [f.key, '']))])}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
                <Plus className="h-4 w-4" />
                {addLabel}
            </button>
        </div>
    );
}

/** Tag-style editor for plain string lists (skills, certifications, ...). */
function TagList({ items, onChange, placeholder }) {
    const rows = Array.isArray(items) ? items : [];
    const [draft, setDraft] = useState('');

    const add = () => {
        const value = draft.trim();
        if (!value) return;
        if (rows.some((r) => r.toLowerCase() === value.toLowerCase())) {
            setDraft('');
            return;
        }
        onChange([...rows, value]);
        setDraft('');
    };

    return (
        <div className="space-y-2">
            {rows.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {rows.map((item, index) => (
                        <span key={`${item}-${index}`} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {item}
                            <button type="button" onClick={() => onChange(rows.filter((_, i) => i !== index))} className="text-slate-400 hover:text-red-500">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="flex gap-2">
                <input
                    value={draft}
                    placeholder={placeholder}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            add();
                        }
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button type="button" onClick={add} className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Add
                </button>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Template gallery                                                   */
/* ------------------------------------------------------------------ */

function TemplateGallery({ templates, selected, onSelect, variant = 'rail' }) {
    if (variant === 'modal') {
        return (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {templates.map((tpl) => {
                    const active = tpl.key === selected;
                    return (
                        <button
                            key={tpl.key}
                            type="button"
                            onClick={() => onSelect(tpl.key)}
                            className={`group relative overflow-hidden rounded-xl border-2 p-2 text-left transition-all ${
                                active ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                            }`}
                        >
                            <div className="relative">
                                <TemplateThumbnail templateKey={tpl.key} active={active} />
                            </div>
                            <p className="mt-2 truncate text-xs font-bold text-slate-800">{tpl.label}</p>
                            <p className="truncate text-[10px] text-slate-500">{LAYOUTS[tpl.key]?.note}</p>
                            {active && (
                                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                    <Check className="h-3 w-3" /> Selected
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {templates.map((tpl) => {
                const active = tpl.key === selected;
                return (
                    <button
                        key={tpl.key}
                        type="button"
                        onClick={() => onSelect(tpl.key)}
                        className={`flex w-full items-center gap-3 rounded-lg border-2 p-2 text-left transition-all ${
                            active ? 'border-blue-500 bg-blue-50/60' : 'border-slate-200 hover:border-blue-300'
                        }`}
                    >
                        <div className="w-16 shrink-0">
                            <TemplateThumbnail templateKey={tpl.key} active={active} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-slate-800">{tpl.label}</p>
                            <p className="truncate text-[10px] text-slate-500">{LAYOUTS[tpl.key]?.note}</p>
                        </div>
                        {active && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
                    </button>
                );
            })}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function MemberResumeBuilder({
    agency,
    member,
    templates,
    selectedTemplate: initialTemplate,
    content: initialContent,
    design: initialDesign,
    designOptions,
    hasSavedResume,
    savedAt,
}) {
    const { csrf } = usePage().props;

    const [template, setTemplate] = useState(initialTemplate);
    const [content, setContent] = useState(initialContent);
    const [design, setDesign] = useState(initialDesign);

    const [previewHtml, setPreviewHtml] = useState('');
    const [previewing, setPreviewing] = useState(true);
    const [previewError, setPreviewError] = useState(null);

    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState(null);
    const [savedStamp, setSavedStamp] = useState(savedAt || null);

    const [showGallery, setShowGallery] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);

    const fileInputRef = useRef(null);
    const dirtyRef = useRef(false);

    /* -------- content helpers -------- */
    const setField = useCallback((key, value) => {
        dirtyRef.current = true;
        setContent((prev) => ({ ...prev, [key]: value }));
    }, []);

    const setList = useCallback((key, value) => {
        dirtyRef.current = true;
        setContent((prev) => ({ ...prev, [key]: value }));
    }, []);

    const setDesignField = useCallback((key, value) => {
        dirtyRef.current = true;
        setDesign((prev) => ({ ...prev, [key]: value }));
    }, []);

    /* -------- live preview (debounced) -------- */
    useEffect(() => {
        if (!dirtyRef.current) return;

        setPreviewing(true);
        setPreviewError(null);

        const handle = setTimeout(async () => {
            try {
                const { data } = await axios.post(
                    route('agency.members.resume-preview', member.id),
                    { template, content, design },
                    { headers: { 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' } }
                );
                setPreviewHtml(data.html || '');
            } catch (err) {
                setPreviewError(err.response?.data?.error || 'Could not refresh the preview.');
            } finally {
                setPreviewing(false);
            }
        }, 450);

        return () => clearTimeout(handle);
    }, [template, content, design, member.id, csrf]);

    /* -------- initial preview -------- */
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const { data } = await axios.post(
                    route('agency.members.resume-preview', member.id),
                    { template, content, design },
                    { headers: { 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' } }
                );
                if (!cancelled) setPreviewHtml(data.html || '');
            } catch (err) {
                if (!cancelled) setPreviewError(err.response?.data?.error || 'Could not load the preview.');
            } finally {
                if (!cancelled) setPreviewing(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [member.id]);

    /* -------- actions -------- */
    const handleSave = async () => {
        setSaving(true);
        setNotice(null);

        try {
            const { data } = await axios.put(
                route('agency.members.resume-builder.save', member.id),
                { template, content, design },
                { headers: { 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' } }
            );
            setNotice({ type: 'success', message: data.message || 'Resume saved.' });
            setSavedStamp(data.saved_at || null);
            dirtyRef.current = false;
        } catch (err) {
            const errors = err.response?.data?.errors;
            setNotice({
                type: 'error',
                message: errors ? Object.values(errors).flat()[0] : err.response?.data?.error || 'Failed to save the resume.',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSelectTemplate = (key) => {
        setTemplate(key);
        dirtyRef.current = true;
        setShowGallery(false);
        setNotice({ type: 'info', message: `Template switched to ${templates.find((t) => t.key === key)?.label}. Remember to save.` });
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPhoto(true);
        setNotice(null);

        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const { data } = await axios.post(route('agency.members.resume-photo', member.id), formData, {
                headers: { 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
            });
            setPhotoPreview(data.photo_url ? `/storage/${data.photo_url}` : null);
            setNotice({ type: 'success', message: 'Profile photo updated.' });
            router.reload({ only: ['member'], preserveScroll: true });
        } catch (err) {
            setPhotoPreview(null);
            setNotice({ type: 'error', message: err.response?.data?.errors?.photo?.[0] || 'Failed to upload the photo.' });
        } finally {
            setUploadingPhoto(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const currentPhoto = photoPreview || (member.photo_url ? `/storage/${member.photo_url}` : null);

    /* -------- section ordering + visibility -------- */
    const hidden = useMemo(() => design.hidden_sections || [], [design.hidden_sections]);

    const toggleSection = (key) => {
        const next = hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key];
        setDesignField('hidden_sections', next);
    };

    const moveSection = (key, delta) => {
        const order = [...design.section_order];
        const index = order.indexOf(key);
        const target = index + delta;
        if (index < 0 || target < 0 || target >= order.length) return;
        [order[index], order[target]] = [order[target], order[index]];
        setDesignField('section_order', order);
    };

    const resetDesign = () => {
        setDesign({
            accent_color: '#2563eb',
            font_family: 'sans-serif',
            font_size: 'medium',
            line_spacing: 'normal',
            section_order: designOptions.sections ? Object.keys(designOptions.sections) : design.section_order,
            hidden_sections: [],
        });
        dirtyRef.current = true;
        setNotice({ type: 'info', message: 'Design reset to defaults. Remember to save.' });
    };

    const currentTemplateLabel = templates.find((t) => t.key === template)?.label || template;

    return (
        <AgencyLayouts
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.get(route('agency.members'))}
                            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50"
                            title="Back to Members"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Resume Builder</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                {member.full_name} · <span className="text-gray-500">{currentTemplateLabel}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowGallery(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            <LayoutTemplate className="h-4 w-4" />
                            Change Template
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowPreviewModal(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            <Eye className="h-4 w-4" />
                            Preview Resume
                        </button>
                        <a
                            href={route('agency.members.resume', member.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            <Download className="h-4 w-4" />
                            Download PDF
                        </a>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Resume
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Resume Builder — ${member.full_name}`} />

            <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-slate-50 to-white py-6">
                <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                    {notice && (
                        <div
                            className={`mb-4 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${
                                notice.type === 'success'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                    : notice.type === 'error'
                                    ? 'border-red-200 bg-red-50 text-red-800'
                                    : 'border-blue-200 bg-blue-50 text-blue-800'
                            }`}
                        >
                            {notice.type === 'success' ? <Check className="h-4 w-4 shrink-0" /> : <Pencil className="h-4 w-4 shrink-0" />}
                            <p className="font-medium">{notice.message}</p>
                            <button type="button" onClick={() => setNotice(null)} className="ml-auto opacity-60 hover:opacity-100">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                        {/* ---------------- Left rail: template + design ---------------- */}
                        <div className="space-y-5 xl:col-span-3">
                            <Card title="Resume Template" icon={LayoutTemplate} description={`${templates.length} professional designs`}>
                                <TemplateGallery templates={templates} selected={template} onSelect={setTemplate} />
                            </Card>

                            <Card title="Design" icon={Palette} description="Applies to the selected template" action={
                                <button type="button" onClick={resetDesign} className="text-xs font-semibold text-slate-500 hover:text-blue-600">
                                    Reset
                                </button>
                            }>
                                <div>
                                    <label className="mb-2 block text-xs font-semibold text-slate-600">Accent colour</label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(designOptions.accentColors).map(([hex, label]) => (
                                            <button
                                                key={hex}
                                                type="button"
                                                title={label}
                                                onClick={() => setDesignField('accent_color', hex)}
                                                className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                                                    design.accent_color === hex ? 'border-slate-900 ring-2 ring-offset-1' : 'border-slate-200'
                                                }`}
                                                style={{ backgroundColor: hex }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">Font</label>
                                    <select
                                        value={design.font_family}
                                        onChange={(e) => setDesignField('font_family', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        {Object.entries(designOptions.fonts).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-600">Font size</label>
                                        <select
                                            value={design.font_size}
                                            onChange={(e) => setDesignField('font_size', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            {Object.entries(designOptions.fontSizes).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-600">Line spacing</label>
                                        <select
                                            value={design.line_spacing}
                                            onChange={(e) => setDesignField('line_spacing', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            {Object.entries(designOptions.lineSpacings).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold text-slate-600">
                                        Sections — reorder &amp; show/hide
                                    </label>
                                    <div className="space-y-1.5">
                                        {design.section_order.map((key, index) => {
                                            const isHidden = hidden.includes(key);
                                            return (
                                                <div
                                                    key={key}
                                                    className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                                                        isHidden ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 bg-white'
                                                    }`}
                                                >
                                                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                                                    <span className={`min-w-0 flex-1 truncate text-xs font-medium ${isHidden ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                        {designOptions.sections[key] || key}
                                                    </span>
                                                    <div className="flex shrink-0 items-center gap-0.5">
                                                        <button type="button" onClick={() => moveSection(key, -1)} disabled={index === 0} className="rounded p-0.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                                                            <ChevronUp className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveSection(key, 1)}
                                                            disabled={index === design.section_order.length - 1}
                                                            className="rounded p-0.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                                        >
                                                            <ChevronDown className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSection(key)}
                                                            className={`rounded p-0.5 ${isHidden ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}
                                                            title={isHidden ? 'Show section' : 'Hide section'}
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* ---------------- Middle: content editor ---------------- */}
                        <div className="space-y-5 xl:col-span-4">
                            <Card title="Personal Information" icon={User}>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        {currentPhoto ? (
                                            <img src={currentPhoto} alt="Profile" className="h-16 w-16 rounded-full border-2 border-slate-200 object-cover" />
                                        ) : (
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400">
                                                <User className="h-6 w-6" />
                                            </div>
                                        )}
                                        {uploadingPhoto && (
                                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/80">
                                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-blue-600 p-1.5 text-white shadow hover:bg-blue-700"
                                            title="Change profile photo"
                                        >
                                            <Upload className="h-3 w-3" />
                                        </button>
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                    </div>
                                    <p className="text-xs text-slate-500">JPG, PNG or WebP. Max 2MB. Square recommended.</p>
                                </div>

                                <Field label="Full Name" value={content.full_name} onChange={(v) => setField('full_name', v)} required />
                                <Field label="Professional Title" value={content.professional_title} onChange={(v) => setField('professional_title', v)} placeholder="e.g. Welding Technician" />
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <Field label="Email" type="email" value={content.email} onChange={(v) => setField('email', v)} required />
                                    <Field label="Phone Number" value={content.contact_number} onChange={(v) => setField('contact_number', v)} required />
                                </div>
                                <Field label="Address" value={content.address} onChange={(v) => setField('address', v)} required />
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <Field label="Barangay" value={content.barangay} onChange={(v) => setField('barangay', v)} />
                                    <Field label="Date of Birth" value={content.birthdate} onChange={(v) => setField('birthdate', v)} />
                                    <Field label="Civil Status" value={content.civil_status} onChange={(v) => setField('civil_status', v)} />
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <Field label="Sex" value={content.sex} onChange={(v) => setField('sex', v)} />
                                </div>
                            </Card>

                            <Card title="Professional Summary" icon={Pencil}>
                                <Field
                                    label="Summary"
                                    value={content.professional_summary}
                                    onChange={(v) => setField('professional_summary', v)}
                                    multiline
                                    rows={5}
                                    placeholder="A short professional summary..."
                                />
                            </Card>

                            <Card title="Educational Background" icon={Pencil}>
                                <Repeater
                                    items={content.educational_background}
                                    onChange={(v) => setList('educational_background', v)}
                                    addLabel="Add education"
                                    singular="education"
                                    fields={[
                                        { key: 'level', label: 'Degree / Level', placeholder: 'College Graduate' },
                                        { key: 'school', label: 'School', placeholder: 'School name' },
                                        { key: 'year', label: 'Year Graduated', placeholder: '2020' },
                                    ]}
                                />
                            </Card>

                            <Card title="Work Experience" icon={Pencil}>
                                <Repeater
                                    items={content.work_experience}
                                    onChange={(v) => setList('work_experience', v)}
                                    addLabel="Add experience"
                                    singular="experience"
                                    fields={[
                                        { key: 'position', label: 'Position', placeholder: 'Welder' },
                                        { key: 'company', label: 'Company', placeholder: 'Company name' },
                                        { key: 'years', label: 'Duration', placeholder: '2 year(s)' },
                                    ]}
                                />
                            </Card>

                            <Card title="Skills" icon={Pencil}>
                                <TagList items={content.skills} onChange={(v) => setList('skills', v)} placeholder="Type a skill and press Enter" />
                            </Card>

                            <Card title="Certifications" icon={Pencil}>
                                <TagList items={content.certifications} onChange={(v) => setList('certifications', v)} placeholder="e.g. SMAW NC II" />
                            </Card>

                            <Card title="Training &amp; Seminars" icon={Pencil}>
                                <TagList items={content.training} onChange={(v) => setList('training', v)} placeholder="e.g. Safety Training 101" />
                            </Card>

                            <Card title="Projects" icon={Pencil}>
                                <Repeater
                                    items={content.projects}
                                    onChange={(v) => setList('projects', v)}
                                    addLabel="Add project"
                                    singular="project"
                                    fields={[
                                        { key: 'name', label: 'Project Name', placeholder: 'Project title' },
                                        { key: 'description', label: 'Description', placeholder: 'What did you do?', multiline: true, full: true },
                                    ]}
                                />
                            </Card>

                            <Card title="Professional Licenses" icon={Pencil}>
                                <TagList items={content.licenses} onChange={(v) => setList('licenses', v)} placeholder="e.g. TESDA Welder License" />
                            </Card>

                            <Card title="References" icon={Pencil}>
                                <Repeater
                                    items={content.references}
                                    onChange={(v) => setList('references', v)}
                                    addLabel="Add reference"
                                    singular="reference"
                                    fields={[
                                        { key: 'name', label: 'Full Name', placeholder: 'Reference name' },
                                        { key: 'position', label: 'Position', placeholder: 'Foreman' },
                                        { key: 'contact', label: 'Contact', placeholder: '09171234567' },
                                    ]}
                                />
                            </Card>

                            <Card title="Other Relevant Information" icon={Pencil} description="Achievements, awards, affiliations, languages or anything else worth adding.">
                                <Field
                                    label="Additional Information"
                                    value={content.additional_information}
                                    onChange={(v) => setField('additional_information', v)}
                                    multiline
                                    rows={4}
                                    placeholder="e.g. 5-time provincial welding competition winner..."
                                />
                            </Card>
                        </div>

                        {/* ---------------- Right: live preview ---------------- */}
                        <div className="xl:col-span-5">
                            <div className="sticky top-4">
                                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                                    <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                            <Eye className="h-4 w-4 text-blue-600" />
                                            Live Preview
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            {previewing && (
                                                <span className="inline-flex items-center gap-1 text-blue-600">
                                                    <Loader2 className="h-3 w-3 animate-spin" /> Updating
                                                </span>
                                            )}
                                            <span className="hidden sm:inline">A4 · {currentTemplateLabel}</span>
                                        </div>
                                    </header>

                                    <div className="bg-slate-100 p-3">
                                        {previewError ? (
                                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{previewError}</div>
                                        ) : (
                                            <div className="mx-auto overflow-hidden rounded-md bg-white shadow-sm" style={{ maxWidth: '210mm' }}>
                                                <iframe
                                                    srcDoc={previewHtml}
                                                    title="Resume Preview"
                                                    className="h-[70vh] w-full border-0"
                                                    style={{ minHeight: '297mm' }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                                        <span>
                                            {hasSavedResume || savedStamp ? (
                                                <>Last saved: <strong className="text-slate-700">{savedStamp || 'earlier'}</strong></>
                                            ) : (
                                                'Not saved yet — changes only affect this browser until you save.'
                                            )}
                                        </span>
                                        <a href={route('agency.members.resume', member.id)} className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline">
                                            <Download className="h-3.5 w-3.5" /> Download PDF
                                        </a>
                                    </footer>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------------- Template gallery modal ---------------- */}
            {showGallery && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4" onClick={() => setShowGallery(false)}>
                    <div
                        className="mx-auto my-8 max-w-5xl rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Choose a Resume Template</h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    Pick from {templates.length} professional layouts. Your content and design settings are kept.
                                </p>
                            </div>
                            <button type="button" onClick={() => setShowGallery(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <TemplateGallery templates={templates} selected={template} onSelect={handleSelectTemplate} variant="modal" />
                    </div>
                </div>
            )}

            {/* ---------------- Full preview modal ---------------- */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowPreviewModal(false)}>
                    <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Resume Preview</h2>
                                <p className="text-xs text-slate-500">{currentTemplateLabel} · A4</p>
                            </div>
                            <button type="button" onClick={() => setShowPreviewModal(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </header>
                        <div className="flex-1 overflow-y-auto bg-slate-100 p-4">
                            <div className="mx-auto overflow-hidden rounded-md bg-white shadow-sm" style={{ maxWidth: '210mm' }}>
                                <iframe srcDoc={previewHtml} title="Resume Preview" className="h-[70vh] w-full border-0" style={{ minHeight: '297mm' }} />
                            </div>
                        </div>
                        <footer className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
                            <p className="text-xs text-slate-500">The exported PDF matches this preview.</p>
                            <div className="flex gap-2">
                                <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                                </button>
                                <a href={route('agency.members.resume', member.id)} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900">
                                    <Download className="h-4 w-4" /> Download PDF
                                </a>
                            </div>
                        </footer>
                    </div>
                </div>
            )}
        </AgencyLayouts>
    );
}
