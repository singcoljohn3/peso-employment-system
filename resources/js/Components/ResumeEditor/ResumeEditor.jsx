import { useCallback, useDeferredValue, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    ArrowLeft,
    Bold,
    Download,
    Image as ImageIcon,
    Italic,
    LayoutTemplate,
    Link as LinkIcon,
    List,
    ListOrdered,
    Loader2,
    Palette,
    Redo2,
    Rows3,
    Shapes,
    Type,
    Underline,
    Undo2,
    X,
} from 'lucide-react';
import { EditorContext } from './Editable';
import { CONTACT_TYPES, FONT_SIZES, FONTS, QUICK_COLORS, newItem, newSection, plainText, uid } from './documentModel';
import { PAGE_H, PAGE_W, ResumePage, findTemplate } from './templates';
import { ColorsPanel, ElementsPanel, PhotosPanel, SectionsPanel, TemplatesPanel, TextPanel } from './panels';
import { exportResumePdf } from './exportPdf';

const EDITOR_CSS = `
.re-editable { outline: none; border-radius: 2px; min-width: 1.5em; cursor: text; transition: box-shadow .12s; }
.re-editable:hover { box-shadow: 0 0 0 1px rgba(59,130,246,.45); }
.re-editable:focus { box-shadow: 0 0 0 2px rgba(59,130,246,.75); }
.re-editable:empty:before { content: attr(data-placeholder); color: currentColor; opacity: .4; pointer-events: none; }
.re-page ul { list-style: disc; padding-left: 1.25em; margin: .15em 0; }
.re-page ol { list-style: decimal; padding-left: 1.4em; margin: .15em 0; }
.re-page a { color: inherit; text-decoration: underline; }
.re-page h1, .re-page h3 { margin: 0; }
.re-exporting .re-editable { box-shadow: none !important; }
.re-exporting .re-editable:empty:before { content: none; }
.re-exporting [data-empty="true"] { display: none !important; }
.re-exporting .re-ui { display: none !important; }
`;

/* ------------------------------------------------------------------ */
/* Document history (undo / redo)                                      */
/* ------------------------------------------------------------------ */

const TEXT_KEYS = new Set(['name', 'title', 'contactTitle', 'body', 'heading', 'subheading', 'date', 'role', 'org', 'contact', 'text', 'value']);
const isTyping = (patch) => Object.keys(patch).every((k) => TEXT_KEYS.has(k));

function historyReducer(state, action) {
    switch (action.type) {
        case 'set': {
            const next = action.updater(state.present);
            if (next === state.present) return state;
            const now = Date.now();
            // Group keystrokes (and slider drags) into one undo step.
            const merge = action.merge && state.mergedAt && now - state.mergedAt < 900;
            return {
                past: merge ? state.past : [...state.past.slice(-99), state.present],
                present: next,
                future: [],
                mergedAt: action.merge ? now : 0,
            };
        }
        case 'undo':
            if (!state.past.length) return state;
            return { past: state.past.slice(0, -1), present: state.past[state.past.length - 1], future: [state.present, ...state.future], mergedAt: 0 };
        case 'redo':
            if (!state.future.length) return state;
            return { past: [...state.past, state.present], present: state.future[0], future: state.future.slice(1), mergedAt: 0 };
        default:
            return state;
    }
}

const moveById = (list, id, delta) => {
    const index = list.findIndex((x) => x.id === id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= list.length) return list;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
};

/** Swap a section with its nearest neighbour that is shown in the same column. */
const moveSection = (doc, id, delta) => {
    const sections = doc.sections;
    const index = sections.findIndex((s) => s.id === id);
    if (index < 0) return doc;
    const grouped = findTemplate(doc.template).grouped;
    let j = index + delta;
    while (j >= 0 && j < sections.length && grouped && sections[j].area !== sections[index].area) j += delta;
    if (j < 0 || j >= sections.length) return doc;
    const next = [...sections];
    [next[index], next[j]] = [next[j], next[index]];
    return { ...doc, sections: next };
};

/* ------------------------------------------------------------------ */
/* Toolbar pieces                                                      */
/* ------------------------------------------------------------------ */

function ToolButton({ title, onClick, active = false, disabled = false, children }) {
    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                active ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
            } disabled:opacity-35 disabled:hover:bg-transparent`}
        >
            {children}
        </button>
    );
}

const ALIGNMENTS = [
    ['justifyLeft', 'Align left', AlignLeft],
    ['justifyCenter', 'Align center', AlignCenter],
    ['justifyRight', 'Align right', AlignRight],
    ['justifyFull', 'Justify', AlignJustify],
];

function AlignMenu({ onPick }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative shrink-0">
            <ToolButton title="Text alignment" active={open} onClick={() => setOpen((o) => !o)}>
                <AlignLeft className="h-[18px] w-[18px]" />
            </ToolButton>
            {open && (
                <div className="absolute left-0 top-10 z-30 flex gap-0.5 rounded-lg border border-slate-200 bg-white p-1 shadow-lg" onMouseLeave={() => setOpen(false)}>
                    {ALIGNMENTS.map(([command, title, Icon]) => (
                        <ToolButton
                            key={command}
                            title={title}
                            onClick={() => {
                                onPick(command);
                                setOpen(false);
                            }}
                        >
                            <Icon className="h-[18px] w-[18px]" />
                        </ToolButton>
                    ))}
                </div>
            )}
        </div>
    );
}

const Divider = () => <span className="mx-1 h-6 w-px shrink-0 bg-slate-200" />;

const TABS = [
    ['templates', 'Templates', LayoutTemplate],
    ['elements', 'Elements', Shapes],
    ['text', 'Text', Type],
    ['photos', 'Photos', ImageIcon],
    ['colors', 'Colors', Palette],
    ['sections', 'Sections', Rows3],
];

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

export default function ResumeEditor({ initialDocument, saveUrl, backUrl, backLabel, subjectName, savedAt }) {
    const [history, dispatch] = useReducer(historyReducer, { past: [], present: initialDocument, future: [], mergedAt: 0 });
    const doc = history.present;

    const [panel, setPanel] = useState('templates');
    const [panelOpenMobile, setPanelOpenMobile] = useState(false);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [savedStamp, setSavedStamp] = useState(savedAt);
    const [notice, setNotice] = useState(null);
    const [format, setFormat] = useState({ bold: false, italic: false, underline: false });

    const savedDocRef = useRef(initialDocument);
    const pageRef = useRef(null);
    const areaRef = useRef(null);
    const rangeRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [pageHeight, setPageHeight] = useState(PAGE_H);

    const dirty = doc !== savedDocRef.current;

    const notify = useCallback((type, message) => setNotice({ type, message, id: uid() }), []);

    useEffect(() => {
        if (!notice) return undefined;
        const handle = setTimeout(() => setNotice(null), 4000);
        return () => clearTimeout(handle);
    }, [notice]);

    /* -------- document mutations -------- */
    const api = useMemo(() => {
        const change = (updater, merge = false) => dispatch({ type: 'set', updater, merge });
        const mapSection = (id, fn) => (d) => ({ ...d, sections: d.sections.map((s) => (s.id === id ? fn(s) : s)) });

        return {
            setField: (key, value) => change((d) => ({ ...d, [key]: value }), true),
            setTheme: (patch, merge = false) => change((d) => ({ ...d, theme: { ...d.theme, ...patch } }), merge),
            setPhoto: (patch) => change((d) => ({ ...d, photo: { ...d.photo, ...patch } })),
            setTemplate: (template) => change((d) => (d.template === template ? d : { ...d, template })),

            updateSection: (id, patch) => change(mapSection(id, (s) => ({ ...s, ...patch })), isTyping(patch)),
            addSection: (kind) => change((d) => ({ ...d, sections: [...d.sections, newSection(kind)] })),
            removeSection: (id) => change((d) => ({ ...d, sections: d.sections.filter((s) => s.id !== id) })),
            moveSection: (id, delta) => change((d) => moveSection(d, id, delta)),

            updateItem: (sectionId, itemId, patch) =>
                change(mapSection(sectionId, (s) => ({ ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) })), isTyping(patch)),
            addItem: (sectionId, afterId = null) =>
                change(
                    mapSection(sectionId, (s) => {
                        const items = [...(s.items || [])];
                        const at = afterId ? items.findIndex((i) => i.id === afterId) + 1 : items.length;
                        items.splice(at, 0, newItem(s.type));
                        return { ...s, items };
                    })
                ),
            removeItem: (sectionId, itemId) => change(mapSection(sectionId, (s) => ({ ...s, items: s.items.filter((i) => i.id !== itemId) }))),
            moveItem: (sectionId, itemId, delta) => change(mapSection(sectionId, (s) => ({ ...s, items: moveById(s.items, itemId, delta) }))),

            updateContact: (id, patch) => change((d) => ({ ...d, contact: d.contact.map((c) => (c.id === id ? { ...c, ...patch } : c)) }), isTyping(patch)),
            addContact: (type) => change((d) => ({ ...d, contact: [...d.contact, { id: uid(), type: CONTACT_TYPES[type] ? type : 'phone', value: '' }] })),
            removeContact: (id) => change((d) => ({ ...d, contact: d.contact.filter((c) => c.id !== id) })),
            moveContact: (id, delta) => change((d) => ({ ...d, contact: moveById(d.contact, id, delta) })),

            openPanel: (tab) => {
                setPanel(tab);
                setPanelOpenMobile(true);
            },
        };
    }, []);

    const undo = useCallback(() => dispatch({ type: 'undo' }), []);
    const redo = useCallback(() => dispatch({ type: 'redo' }), []);

    /* -------- text selection (for the formatting toolbar) -------- */
    const editableRoot = () => {
        const range = rangeRef.current;
        if (!range) return null;
        const node = range.commonAncestorContainer;
        const el = node.nodeType === 1 ? node : node.parentElement;
        return el?.closest('.re-editable') || null;
    };

    useEffect(() => {
        const onSelectionChange = () => {
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;
            const range = sel.getRangeAt(0);
            const node = range.commonAncestorContainer;
            const el = node.nodeType === 1 ? node : node.parentElement;
            if (!el || !pageRef.current?.contains(el)) return;

            if (el.closest('.re-editable')) {
                rangeRef.current = range.cloneRange();
                setFormat({
                    bold: document.queryCommandState('bold'),
                    italic: document.queryCommandState('italic'),
                    underline: document.queryCommandState('underline'),
                });
            } else {
                rangeRef.current = null;
            }
        };
        document.addEventListener('selectionchange', onSelectionChange);
        return () => document.removeEventListener('selectionchange', onSelectionChange);
    }, []);

    const restoreSelection = () => {
        const root = editableRoot();
        if (!root || !root.isConnected) return false;
        root.focus({ preventScroll: true });
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(rangeRef.current);
        return true;
    };

    const hasTextSelection = () => {
        const root = editableRoot();
        return Boolean(root && root.isConnected && !rangeRef.current.collapsed);
    };

    const exec = (command, value = null) => {
        if (!restoreSelection()) {
            notify('info', 'Click inside the text on the resume first.');
            return false;
        }
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(command, false, value);
        return true;
    };

    const applyFont = (font) => {
        if (hasTextSelection()) exec('fontName', font);
        else api.setTheme({ font });
    };

    const applySize = (px) => {
        if (!hasTextSelection()) {
            api.setTheme({ size: px });
            return;
        }
        const root = editableRoot();
        if (!exec('fontSize', '7')) return;
        root.querySelectorAll('font[size="7"]').forEach((f) => {
            const span = document.createElement('span');
            span.style.fontSize = `${px}px`;
            span.innerHTML = f.innerHTML;
            f.replaceWith(span);
        });
        root.querySelectorAll('span').forEach((s) => {
            if (s.style.fontSize === 'xxx-large') s.style.fontSize = `${px}px`;
        });
        root.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const applyColor = (color) => {
        if (hasTextSelection()) exec('foreColor', color);
        else api.setTheme({ accent: color });
    };

    const applyLink = () => {
        if (!hasTextSelection()) {
            notify('info', 'Select the text you want to turn into a link.');
            return;
        }
        const url = window.prompt('Link address (e.g. https://linkedin.com/in/you)');
        if (url) exec('createLink', /^https?:\/\//i.test(url) ? url : `https://${url}`);
    };

    /* -------- save / export -------- */
    const save = useCallback(async () => {
        setSaving(true);
        try {
            const snapshot = history.present;
            const { data } = await axios.put(saveUrl, { document: snapshot });
            savedDocRef.current = snapshot;
            setSavedStamp(data.saved_at || null);
            notify('success', data.message || 'Resume saved.');
        } catch (err) {
            const errors = err.response?.data?.errors;
            notify('error', errors ? Object.values(errors).flat()[0] : err.response?.data?.error || err.response?.data?.message || 'Failed to save the resume.');
        } finally {
            setSaving(false);
        }
    }, [history.present, saveUrl, notify]);

    const download = async () => {
        if (!pageRef.current) return;
        setExporting(true);
        try {
            const base = (plainText(doc.name) || subjectName || 'Resume').replace(/[^A-Za-z0-9 _-]/g, '').trim().replace(/\s+/g, '_');
            await exportResumePdf(pageRef.current, `${base || 'Resume'}_Resume.pdf`);
        } catch (err) {
            console.error(err);
            notify('error', 'Could not create the PDF. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    /* -------- keyboard shortcuts & leave warning -------- */
    useEffect(() => {
        const onKey = (e) => {
            if (!(e.ctrlKey || e.metaKey)) return;
            const key = e.key.toLowerCase();
            if (key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if ((key === 'z' && e.shiftKey) || key === 'y') {
                e.preventDefault();
                redo();
            } else if (key === 's') {
                e.preventDefault();
                save();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [undo, redo, save]);

    useEffect(() => {
        const onBeforeUnload = (e) => {
            if (!dirty) return;
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [dirty]);

    const goBack = () => {
        if (dirty && !window.confirm('You have unsaved changes. Leave without saving?')) return;
        router.visit(backUrl);
    };

    /* -------- fit the A4 page to the available width -------- */
    useEffect(() => {
        const area = areaRef.current;
        const page = pageRef.current;
        if (!area || !page) return undefined;
        const observer = new ResizeObserver(() => {
            setScale(Math.min(1, (area.clientWidth - 48) / PAGE_W));
            setPageHeight(page.offsetHeight);
        });
        observer.observe(area);
        observer.observe(page);
        return () => observer.disconnect();
    }, []);

    const deferredDoc = useDeferredValue(doc);
    const panelProps = { doc, api, notify };
    const context = useMemo(() => ({ api, doc, readOnly: false }), [api, doc]);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-800">
            <style>{EDITOR_CSS}</style>

            {/* ---------------- Icon rail ---------------- */}
            <nav className="flex w-[72px] shrink-0 flex-col bg-[#0f2340] text-white sm:w-[92px]">
                <button type="button" onClick={goBack} className="flex flex-col items-center gap-1 border-b border-white/10 px-1 py-4 text-[11px] text-white/80 hover:bg-white/5" title={`Back to ${backLabel}`}>
                    <ArrowLeft className="h-5 w-5" />
                    <span className="max-w-full truncate">{backLabel}</span>
                </button>
                {TABS.map(([key, label, Icon]) => {
                    const active = panel === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => {
                                setPanel(key);
                                setPanelOpenMobile((open) => (panel === key ? !open : true));
                            }}
                            className={`flex flex-col items-center gap-1.5 px-1 py-4 text-[12px] transition sm:text-[13px] ${
                                active ? 'bg-[#1d4ed8] text-white' : 'text-white/80 hover:bg-white/5'
                            }`}
                        >
                            <Icon className="h-6 w-6" strokeWidth={1.6} />
                            {label}
                        </button>
                    );
                })}
            </nav>

            {/* ---------------- Side panel ---------------- */}
            <aside
                className={`${panelOpenMobile ? 'fixed inset-y-0 left-[72px] z-40 shadow-2xl sm:left-[92px]' : 'hidden'} w-[min(340px,calc(100vw-72px))] shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-6 lg:static lg:block lg:shadow-none`}
            >
                <button type="button" onClick={() => setPanelOpenMobile(false)} className="absolute right-3 top-3 rounded p-1 text-slate-400 hover:bg-slate-100 lg:hidden">
                    <X className="h-5 w-5" />
                </button>
                {panel === 'templates' && <TemplatesPanel {...panelProps} doc={deferredDoc} />}
                {panel === 'elements' && <ElementsPanel {...panelProps} />}
                {panel === 'text' && <TextPanel {...panelProps} />}
                {panel === 'photos' && <PhotosPanel {...panelProps} />}
                {panel === 'colors' && <ColorsPanel {...panelProps} />}
                {panel === 'sections' && <SectionsPanel {...panelProps} />}
            </aside>

            {/* ---------------- Toolbar + canvas ---------------- */}
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex min-h-16 shrink-0 flex-wrap items-center gap-1 border-b border-slate-200 bg-white px-4 py-2.5">
                    <select
                        value={FONTS.includes(doc.theme.font) ? doc.theme.font : FONTS[0]}
                        onChange={(e) => applyFont(e.target.value)}
                        className="h-9 w-36 shrink-0 rounded-lg border-slate-300 py-0 text-sm"
                        title="Font (applies to the selected text, or the whole resume)"
                    >
                        {FONTS.map((f) => (
                            <option key={f} value={f}>
                                {f}
                            </option>
                        ))}
                    </select>
                    <select
                        value={doc.theme.size}
                        onChange={(e) => applySize(Number(e.target.value))}
                        className="h-9 w-[4.5rem] shrink-0 rounded-lg border-slate-300 py-0 text-sm"
                        title="Font size (applies to the selected text, or the whole resume)"
                    >
                        {[...new Set([...FONT_SIZES, doc.theme.size])].sort((a, b) => a - b).map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                    <Divider />
                    <ToolButton title="Bold (Ctrl+B)" active={format.bold} onClick={() => exec('bold')}>
                        <Bold className="h-[18px] w-[18px]" />
                    </ToolButton>
                    <ToolButton title="Italic (Ctrl+I)" active={format.italic} onClick={() => exec('italic')}>
                        <Italic className="h-[18px] w-[18px]" />
                    </ToolButton>
                    <ToolButton title="Underline (Ctrl+U)" active={format.underline} onClick={() => exec('underline')}>
                        <Underline className="h-[18px] w-[18px]" />
                    </ToolButton>
                    <Divider />
                    <AlignMenu onPick={(command) => exec(command)} />
                    <ToolButton title="Bullet list" onClick={() => exec('insertUnorderedList')}>
                        <List className="h-[18px] w-[18px]" />
                    </ToolButton>
                    <ToolButton title="Numbered list" onClick={() => exec('insertOrderedList')}>
                        <ListOrdered className="h-[18px] w-[18px]" />
                    </ToolButton>
                    <ToolButton title="Insert link" onClick={applyLink}>
                        <LinkIcon className="h-[18px] w-[18px]" />
                    </ToolButton>
                    <Divider />
                    {QUICK_COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            title="Colour the selected text (or set the accent colour)"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyColor(color)}
                            className="mx-0.5 h-6 w-6 shrink-0 rounded-full border-2 border-white shadow ring-1 ring-slate-200 transition hover:scale-110"
                            style={{ background: color }}
                        />
                    ))}
                    <Divider />
                    <ToolButton title="Undo (Ctrl+Z)" onClick={undo} disabled={!history.past.length}>
                        <Undo2 className="h-[18px] w-[18px]" />
                    </ToolButton>
                    <ToolButton title="Redo (Ctrl+Y)" onClick={redo} disabled={!history.future.length}>
                        <Redo2 className="h-[18px] w-[18px]" />
                    </ToolButton>

                    <div className="ml-auto flex shrink-0 items-center gap-2 pl-3">
                        <button
                            type="button"
                            onClick={save}
                            disabled={saving}
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                        >
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={download}
                            disabled={exporting}
                            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                        >
                            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Download PDF
                        </button>
                    </div>
                </div>

                <div ref={areaRef} className="flex-1 overflow-auto px-6 py-8">
                    <div className="mx-auto" style={{ width: PAGE_W * scale, height: pageHeight * scale }}>
                        <div data-re-scaler style={{ width: PAGE_W, transform: `scale(${scale})`, transformOrigin: 'top left' }} className="shadow-[0_8px_30px_rgba(15,35,64,0.15)]">
                            <EditorContext.Provider value={context}>
                                <ResumePage doc={doc} pageRef={pageRef} />
                            </EditorContext.Provider>
                        </div>
                    </div>
                    <p className="mt-4 text-center text-xs text-slate-400">
                        <span className={dirty ? 'font-semibold text-amber-600' : ''}>
                            {dirty ? 'Unsaved changes' : savedStamp ? `Saved ${savedStamp}` : 'Not saved yet'}
                        </span>
                        {' · '}Click any text to edit it · hover a section to add, move or delete · Ctrl+S to save
                    </p>
                </div>
            </div>

            {notice && (
                <div
                    key={notice.id}
                    className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
                        notice.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : notice.type === 'error'
                              ? 'border-red-200 bg-red-50 text-red-800'
                              : 'border-blue-200 bg-blue-50 text-blue-800'
                    }`}
                >
                    <span className="font-medium">{notice.message}</span>
                    <button type="button" onClick={() => setNotice(null)} className="opacity-60 hover:opacity-100">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
