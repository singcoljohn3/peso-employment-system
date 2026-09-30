import { memo, useRef, useState } from 'react';
import {
    ArrowDown,
    ArrowUp,
    Award,
    Briefcase,
    Check,
    Eye,
    EyeOff,
    FileText,
    Globe,
    GraduationCap,
    Languages,
    Mail,
    MapPin,
    Phone,
    Settings,
    Star,
    Trash2,
    Trophy,
    Upload,
    User,
    Users,
} from 'lucide-react';
import { EditorContext } from './Editable';
import { COLOR_PRESETS, CONTACT_TYPES, FONTS, SECTION_CATALOG, plainText, readImageAsDataUrl } from './documentModel';
import { PAGE_H, PAGE_W, ResumePage, TEMPLATES, findTemplate } from './templates';

const KIND_ICONS = {
    profile: User,
    education: GraduationCap,
    experience: Briefcase,
    skills: Star,
    certifications: Award,
    trainings: Settings,
    achievements: Trophy,
    languages: Languages,
    references: Users,
    custom: FileText,
};

const CONTACT_ICONS = { phone: Phone, email: Mail, address: MapPin, website: Globe };

function PanelHeader({ title, subtitle }) {
    return (
        <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
    );
}

function Label({ children }) {
    return <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-slate-500 first:mt-0">{children}</p>;
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

const THUMB_W = 138;

const Thumbnail = memo(function Thumbnail({ doc }) {
    const scale = THUMB_W / PAGE_W;
    return (
        <div className="pointer-events-none overflow-hidden rounded bg-white" style={{ width: THUMB_W, height: PAGE_H * scale }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: PAGE_W }}>
                <EditorContext.Provider value={{ readOnly: true, doc, api: null }}>
                    <ResumePage doc={doc} />
                </EditorContext.Provider>
            </div>
        </div>
    );
});

export function TemplatesPanel({ doc, api }) {
    return (
        <>
            <PanelHeader title="Resume Templates" subtitle="Choose a template to start editing." />
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                {TEMPLATES.map((tpl) => {
                    const active = tpl.key === doc.template;
                    return (
                        <button key={tpl.key} type="button" onClick={() => api.setTemplate(tpl.key)} className="group text-center">
                            <div
                                className={`relative inline-block rounded-md border-2 p-0.5 shadow-sm transition ${
                                    active ? 'border-blue-600' : 'border-slate-200 group-hover:border-blue-300'
                                }`}
                            >
                                <Thumbnail doc={{ ...doc, template: tpl.key }} />
                                {active && (
                                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow">
                                        <Check className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                            <p className={`mt-1.5 text-sm ${active ? 'font-semibold text-blue-700' : 'text-slate-700'}`}>{tpl.label}</p>
                        </button>
                    );
                })}
            </div>
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Elements                                                            */
/* ------------------------------------------------------------------ */

export function ElementsPanel({ api }) {
    return (
        <>
            <PanelHeader title="Elements" subtitle="Add sections and contact details to your resume." />
            <Label>Sections</Label>
            <div className="grid grid-cols-2 gap-2">
                {Object.entries(SECTION_CATALOG).map(([kind, def]) => {
                    const Icon = KIND_ICONS[kind];
                    return (
                        <button
                            key={kind}
                            type="button"
                            onClick={() => api.addSection(kind)}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                        >
                            <Icon className="h-4 w-4 shrink-0 text-blue-600" />
                            {def.label}
                        </button>
                    );
                })}
            </div>

            <Label>Contact details</Label>
            <div className="grid grid-cols-2 gap-2">
                {Object.entries(CONTACT_TYPES).map(([type, label]) => {
                    const Icon = CONTACT_ICONS[type];
                    return (
                        <button
                            key={type}
                            type="button"
                            onClick={() => api.addContact(type)}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                        >
                            <Icon className="h-4 w-4 shrink-0 text-blue-600" />
                            {label}
                        </button>
                    );
                })}
            </div>

            <p className="mt-6 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                Tip: hover over any section or entry on the page to add, move or delete it.
            </p>
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

export function TextPanel({ doc, api }) {
    const t = doc.theme;
    return (
        <>
            <PanelHeader title="Text" subtitle="Fonts and spacing for the whole resume." />

            <button
                type="button"
                onClick={() => api.addSection('custom')}
                className="w-full rounded-lg border border-dashed border-blue-300 bg-blue-50/60 px-3 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
                + Add a text block
            </button>

            <Label>Font</Label>
            <div className="space-y-1">
                {FONTS.map((font) => (
                    <button
                        key={font}
                        type="button"
                        onClick={() => api.setTheme({ font })}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-base ${
                            t.font === font ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                        style={{ fontFamily: `'${font}'` }}
                    >
                        {font}
                        {t.font === font && <Check className="h-4 w-4" />}
                    </button>
                ))}
            </div>

            <Label>Base size — {t.size}px</Label>
            <input type="range" min="9" max="16" step="0.5" value={t.size} onChange={(e) => api.setTheme({ size: Number(e.target.value) }, true)} className="w-full" />

            <Label>Line spacing — {t.lineHeight.toFixed(2)}</Label>
            <input
                type="range"
                min="1.1"
                max="2"
                step="0.05"
                value={t.lineHeight}
                onChange={(e) => api.setTheme({ lineHeight: Number(e.target.value) }, true)}
                className="w-full"
            />

            <label className="mt-6 flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={t.upperHeadings} onChange={(e) => api.setTheme({ upperHeadings: e.target.checked })} className="rounded" />
                UPPERCASE section headings
            </label>

            <p className="mt-6 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                To style only part of the text, select it on the page and use the toolbar (bold, size, font, colour, lists, links).
            </p>
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

export function PhotosPanel({ doc, api, notify }) {
    const inputRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const { src, shape, visible } = doc.photo;

    const upload = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) {
            notify('error', 'Please choose an image smaller than 8 MB.');
            return;
        }
        setBusy(true);
        try {
            api.setPhoto({ src: await readImageAsDataUrl(file), visible: true });
        } catch (err) {
            notify('error', err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <PanelHeader title="Photos" subtitle="Your profile picture on the resume." />

            <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div
                    className="h-32 w-32 bg-slate-200 bg-cover bg-center"
                    style={{ backgroundImage: src ? `url("${src}")` : undefined, borderRadius: shape === 'circle' ? '50%' : shape === 'rounded' ? '16%' : 4 }}
                >
                    {!src && <User className="m-auto mt-9 h-12 w-12 text-slate-400" />}
                </div>
                <div className="mt-4 flex gap-2">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={busy}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Upload className="h-4 w-4" />
                        {src ? 'Replace' : 'Upload'}
                    </button>
                    {src && (
                        <button
                            type="button"
                            onClick={() => api.setPhoto({ src: null })}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            <Trash2 className="h-4 w-4" />
                            Remove
                        </button>
                    )}
                </div>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={upload} />
                <p className="mt-2 text-xs text-slate-500">JPG or PNG. A square photo works best.</p>
            </div>

            <Label>Shape</Label>
            <div className="grid grid-cols-3 gap-2">
                {[
                    ['circle', 'Circle', '50%'],
                    ['rounded', 'Rounded', '22%'],
                    ['square', 'Square', 3],
                ].map(([key, label, radius]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => api.setPhoto({ shape: key })}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border-2 py-3 text-xs font-medium ${
                            shape === key ? 'border-blue-600 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                    >
                        <span className="h-8 w-8 bg-slate-300" style={{ borderRadius: radius }} />
                        {label}
                    </button>
                ))}
            </div>

            <label className="mt-6 flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={visible} onChange={(e) => api.setPhoto({ visible: e.target.checked })} className="rounded" />
                Show photo on the resume
            </label>
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Colors                                                              */
/* ------------------------------------------------------------------ */

function ColorField({ label, value, onChange }) {
    return (
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            {label}
            <span className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase text-slate-500">{value}</span>
                <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-9 cursor-pointer rounded border-0 p-0" />
            </span>
        </label>
    );
}

export function ColorsPanel({ doc, api }) {
    const t = doc.theme;
    return (
        <>
            <PanelHeader title="Colors" subtitle="Pick a colour scheme or set your own." />
            <div className="grid grid-cols-4 gap-3">
                {COLOR_PRESETS.map((preset) => {
                    const active = preset.primary === t.primary && preset.accent === t.accent;
                    return (
                        <button key={preset.name} type="button" onClick={() => api.setTheme({ primary: preset.primary, accent: preset.accent })} className="text-center">
                            <span
                                className={`relative mx-auto flex h-12 w-12 overflow-hidden rounded-full border-2 ${active ? 'border-blue-600 ring-2 ring-blue-200' : 'border-white shadow'}`}
                            >
                                <span className="h-full w-1/2" style={{ background: preset.primary }} />
                                <span className="h-full w-1/2" style={{ background: preset.accent }} />
                            </span>
                            <span className="mt-1 block text-xs text-slate-600">{preset.name}</span>
                        </button>
                    );
                })}
            </div>

            <Label>Custom</Label>
            <div className="space-y-2">
                <ColorField label="Main colour" value={t.primary} onChange={(v) => api.setTheme({ primary: v }, true)} />
                <ColorField label="Accent colour" value={t.accent} onChange={(v) => api.setTheme({ accent: v }, true)} />
                <ColorField label="Text colour" value={t.text} onChange={(v) => api.setTheme({ text: v }, true)} />
            </div>
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

export function SectionsPanel({ doc, api }) {
    const grouped = findTemplate(doc.template).grouped;
    const areas = grouped ? [['main', 'Main column'], ['side', 'Sidebar']] : [[null, 'All sections']];

    return (
        <>
            <PanelHeader title="Sections" subtitle="Reorder, hide or move sections." />
            {areas.map(([area, label]) => {
                const list = doc.sections.filter((s) => !area || s.area === area);
                return (
                    <div key={label}>
                        <Label>{label}</Label>
                        {list.length === 0 && <p className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">No sections here.</p>}
                        <div className="space-y-1.5">
                            {list.map((s) => {
                                const Icon = KIND_ICONS[s.icon] || FileText;
                                return (
                                    <div key={s.id} className={`flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 ${s.hidden ? 'bg-slate-50 opacity-60' : 'bg-white'}`}>
                                        <Icon className="h-4 w-4 shrink-0 text-blue-600" />
                                        <span className={`min-w-0 flex-1 truncate text-sm ${s.hidden ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {plainText(s.title) || 'Untitled'}
                                        </span>
                                        <div className="flex shrink-0 items-center">
                                            {grouped && (
                                                <button
                                                    type="button"
                                                    onClick={() => api.updateSection(s.id, { area: s.area === 'side' ? 'main' : 'side' })}
                                                    className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50"
                                                    title="Move to the other column"
                                                >
                                                    {s.area === 'side' ? '→ Main' : '→ Side'}
                                                </button>
                                            )}
                                            <button type="button" onClick={() => api.moveSection(s.id, -1)} className="rounded p-1 text-slate-500 hover:bg-slate-100" title="Move up">
                                                <ArrowUp className="h-3.5 w-3.5" />
                                            </button>
                                            <button type="button" onClick={() => api.moveSection(s.id, 1)} className="rounded p-1 text-slate-500 hover:bg-slate-100" title="Move down">
                                                <ArrowDown className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => api.updateSection(s.id, { hidden: !s.hidden })}
                                                className="rounded p-1 text-slate-500 hover:bg-slate-100"
                                                title={s.hidden ? 'Show' : 'Hide'}
                                            >
                                                {s.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                            </button>
                                            <button type="button" onClick={() => api.removeSection(s.id)} className="rounded p-1 text-red-500 hover:bg-red-50" title="Delete">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </>
    );
}
