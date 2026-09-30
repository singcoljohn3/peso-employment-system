import {
    Award,
    Briefcase,
    FileText,
    Globe,
    GraduationCap,
    Languages,
    Mail,
    MapPin,
    Phone,
    Settings,
    Star,
    Trophy,
    User,
    Users,
} from 'lucide-react';
import { Editable, HoverControls, useEditor } from './Editable';
import { isBlank } from './documentModel';

export const PAGE_W = 794; // A4 at 96dpi
export const PAGE_H = 1123;

const SECTION_ICONS = {
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

/* ------------------------------------------------------------------ */
/* Colour helpers                                                      */
/* ------------------------------------------------------------------ */

const hexToRgb = (hex) => {
    const h = (hex || '#000000').replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Blend `hex` toward `target` by `amount` (0 = hex, 1 = target). */
export const mix = (hex, amount, target = '#ffffff') => {
    const a = hexToRgb(hex);
    const b = hexToRgb(target);
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

const palette = (tone, theme) =>
    tone === 'light'
        ? {
              text: '#ffffff',
              strong: '#ffffff',
              muted: 'rgba(255,255,255,0.82)',
              rule: 'rgba(255,255,255,0.45)',
              heading: '#ffffff',
              icon: '#ffffff',
              track: 'rgba(255,255,255,0.22)',
              fill: mix(theme.accent, 0.45),
              bullet: '#ffffff',
          }
        : {
              text: theme.text,
              strong: '#111827',
              muted: '#4b5563',
              rule: '#d6dde8',
              heading: theme.primary,
              icon: theme.accent,
              track: '#e2e8f0',
              fill: theme.accent,
              bullet: theme.accent,
          };

const itemBlank = (item) => ['heading', 'subheading', 'date', 'body', 'name', 'role', 'org', 'contact', 'text'].every((k) => isBlank(item[k]));
const sectionBlank = (section) => (section.items ? section.items.every(itemBlank) : isBlank(section.body));

const visibleSections = (doc, area) => doc.sections.filter((s) => !s.hidden && (!area || s.area === area));

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function Photo({ size, ring, className = '' }) {
    const { doc, api, readOnly } = useEditor();
    const { src, shape, visible } = doc.photo;
    if (!visible) return null;

    const radius = shape === 'circle' ? '50%' : shape === 'rounded' ? '16%' : '4px';
    const style = {
        width: size,
        height: size,
        borderRadius: radius,
        border: ring,
        backgroundColor: '#cbd5e1',
        backgroundImage: src ? `url("${src}")` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    if (src) return <div className={`shrink-0 ${className}`} style={style} />;

    return (
        <button
            type="button"
            disabled={readOnly}
            onClick={() => api?.openPanel('photos')}
            className={`flex shrink-0 flex-col items-center justify-center text-slate-500 ${className}`}
            style={style}
        >
            <User style={{ width: size * 0.35, height: size * 0.35 }} color="#64748b" />
            {!readOnly && <span className="re-ui mt-1 text-[11px] font-semibold">Add photo</span>}
        </button>
    );
}

function Name({ doc, color, size = '2.6em', align, className = '' }) {
    const { api } = useEditor();
    return (
        <Editable
            tag="h1"
            value={doc.name}
            onChange={(v) => api.setField('name', v)}
            placeholder="YOUR NAME"
            singleLine
            className={`font-bold ${className}`}
            style={{ color, fontSize: size, lineHeight: 1.12, textAlign: align }}
        />
    );
}

function Title({ doc, color, align, spacing = '0.3em', className = '' }) {
    const { api } = useEditor();
    return (
        <Editable
            value={doc.title}
            onChange={(v) => api.setField('title', v)}
            placeholder="Professional Title"
            singleLine
            className={`uppercase ${className}`}
            style={{ color, letterSpacing: spacing, fontSize: '1.15em', textAlign: align }}
        />
    );
}

function SectionHeading({ look, tone, title, icon, theme }) {
    const c = palette(tone, theme);
    const transform = theme.upperHeadings ? 'uppercase' : 'none';

    if (look === 'icon') {
        const Icon = SECTION_ICONS[icon] || FileText;
        return (
            <div className="mb-2 flex items-center gap-3">
                <span
                    className="flex shrink-0 items-center justify-center rounded-full"
                    style={{ width: '2.5em', height: '2.5em', background: theme.accent }}
                >
                    <Icon color="#ffffff" style={{ width: '1.3em', height: '1.3em' }} />
                </span>
                <h3 className="font-bold" style={{ color: c.heading, fontSize: '1.35em', textTransform: transform }}>
                    {title}
                </h3>
            </div>
        );
    }

    if (look === 'side') {
        return (
            <h3
                className="mb-3 pb-1.5 font-semibold tracking-wide"
                style={{ color: c.heading, borderBottom: `1px solid ${c.rule}`, fontSize: '1.3em', textTransform: transform }}
            >
                {title}
            </h3>
        );
    }

    if (look === 'bar') {
        return (
            <div className="mb-3">
                <h3 className="font-bold" style={{ color: c.heading, fontSize: '1.2em', textTransform: transform }}>
                    {title}
                </h3>
                <div className="mt-1 h-[3px] w-10 rounded-full" style={{ background: theme.accent }} />
            </div>
        );
    }

    if (look === 'label') {
        return (
            <h3 className="font-semibold tracking-[0.14em]" style={{ color: theme.accent, fontSize: '0.9em', textTransform: transform }}>
                {title}
            </h3>
        );
    }

    if (look === 'centered') {
        return (
            <div className="mb-3 flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: c.rule }} />
                <h3 className="font-semibold tracking-[0.2em]" style={{ color: c.heading, fontSize: '1.1em', textTransform: transform }}>
                    {title}
                </h3>
                <div className="h-px flex-1" style={{ background: c.rule }} />
            </div>
        );
    }

    // 'strip'
    return (
        <h3
            className="mb-3 pl-2 font-bold"
            style={{ color: c.heading, borderLeft: `4px solid ${theme.accent}`, fontSize: '1.15em', textTransform: transform }}
        >
            {title}
        </h3>
    );
}

function ItemControls({ section, item }) {
    const { api } = useEditor();
    return (
        <HoverControls
            className="-top-3 right-0"
            actions={[
                ['up', () => api.moveItem(section.id, item.id, -1)],
                ['down', () => api.moveItem(section.id, item.id, 1)],
                ['add', () => api.addItem(section.id, item.id)],
                ['delete', () => api.removeItem(section.id, item.id)],
            ]}
        />
    );
}

function SkillBar({ section, item, c }) {
    const { api, readOnly } = useEditor();
    const setFromClick = (e) => {
        if (readOnly) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const level = Math.max(10, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 10) * 10));
        api.updateItem(section.id, item.id, { level });
    };

    return (
        <div
            onClick={setFromClick}
            title={readOnly ? undefined : 'Click to set the skill level'}
            className={`relative h-[0.5em] w-full overflow-hidden rounded-full ${readOnly ? '' : 'cursor-pointer'}`}
            style={{ background: c.track }}
        >
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${item.level ?? 70}%`, background: c.fill }} />
        </div>
    );
}

function SectionBody({ section, look, tone, theme }) {
    const { api } = useEditor();
    const c = palette(tone, theme);
    const setItem = (item, key) => (v) => api.updateItem(section.id, item.id, { [key]: v });

    if (section.type === 'text') {
        return (
            <Editable
                value={section.body}
                onChange={(v) => api.updateSection(section.id, { body: v })}
                placeholder="Write something here…"
                style={{ color: c.text }}
            />
        );
    }

    if (section.type === 'timeline') {
        const rail = look === 'icon';
        return (
            <div>
                {section.items.map((item, index) => (
                    <div
                        key={item.id}
                        data-empty={itemBlank(item)}
                        className="group/item relative"
                        // Each entry draws its own piece of the rail as a border, which
                        // html2canvas renders at the right length (a stretched line does not).
                        style={
                            rail
                                ? {
                                      marginLeft: '0.3em',
                                      paddingLeft: '1.2em',
                                      paddingBottom: index < section.items.length - 1 ? '0.75em' : 0,
                                      borderLeft: `1.5px solid ${mix(theme.accent, 0.55)}`,
                                  }
                                : { marginBottom: index < section.items.length - 1 ? '0.75em' : 0 }
                        }
                    >
                        {rail && (
                            <span
                                className="absolute rounded-full"
                                style={{ left: 'calc(-0.31em - 0.75px)', top: '0.4em', width: '0.62em', height: '0.62em', background: theme.accent }}
                            />
                        )}
                        <Editable value={item.heading} onChange={setItem(item, 'heading')} placeholder="Position / Degree" singleLine className="font-semibold" style={{ color: c.strong, fontSize: '1.08em' }} />
                        <Editable value={item.subheading} onChange={setItem(item, 'subheading')} placeholder="Company / School" singleLine style={{ color: c.text }} />
                        <Editable value={item.date} onChange={setItem(item, 'date')} placeholder="Date" singleLine style={{ color: c.muted }} />
                        <Editable value={item.body} onChange={setItem(item, 'body')} placeholder="Details (optional)" className="mt-0.5" style={{ color: c.text }} />
                        <ItemControls section={section} item={item} />
                    </div>
                ))}
            </div>
        );
    }

    if (section.type === 'skills') {
        return (
            <div className="space-y-2">
                {section.items.map((item) => (
                    <div key={item.id} data-empty={itemBlank(item)} className="group/item relative grid items-center gap-3" style={{ gridTemplateColumns: '1fr 30%' }}>
                        <div className="flex items-start gap-2">
                            <span style={{ color: c.bullet }}>•</span>
                            <Editable value={item.name} onChange={setItem(item, 'name')} placeholder="Skill" singleLine className="flex-1" style={{ color: c.text }} />
                        </div>
                        <SkillBar section={section} item={item} c={c} />
                        <ItemControls section={section} item={item} />
                    </div>
                ))}
            </div>
        );
    }

    if (section.type === 'references') {
        return (
            <div className="space-y-3">
                {section.items.map((item) => (
                    <div key={item.id} data-empty={itemBlank(item)} className="group/item relative">
                        <Editable value={item.name} onChange={setItem(item, 'name')} placeholder="Reference name" singleLine className="font-semibold" style={{ color: c.strong }} />
                        <Editable value={item.role} onChange={setItem(item, 'role')} placeholder="Position" singleLine style={{ color: c.text }} />
                        <Editable value={item.org} onChange={setItem(item, 'org')} placeholder="Company" singleLine style={{ color: c.text }} />
                        <Editable value={item.contact} onChange={setItem(item, 'contact')} placeholder="Contact number" singleLine style={{ color: c.text }} />
                        <ItemControls section={section} item={item} />
                    </div>
                ))}
            </div>
        );
    }

    // 'list'
    return (
        <div className="space-y-1">
            {section.items.map((item) => (
                <div key={item.id} data-empty={itemBlank(item)} className="group/item relative flex items-start gap-2">
                    <span style={{ color: c.bullet }}>•</span>
                    <Editable value={item.text} onChange={setItem(item, 'text')} placeholder="Add an entry" className="flex-1" style={{ color: c.text }} />
                    <ItemControls section={section} item={item} />
                </div>
            ))}
        </div>
    );
}

function SectionView({ section, look, tone = 'dark', first = false }) {
    const { api, doc } = useEditor();
    const theme = doc.theme;
    const c = palette(tone, theme);

    const title = (
        <Editable
            tag="span"
            value={section.title}
            onChange={(v) => api.updateSection(section.id, { title: v })}
            placeholder="Section title"
            singleLine
        />
    );

    const controls = (
        <HoverControls
            group="section"
            className="-top-3 right-0"
            actions={[
                section.items && ['add', () => api.addItem(section.id)],
                ['up', () => api.moveSection(section.id, -1)],
                ['down', () => api.moveSection(section.id, 1)],
                ['hide', () => api.updateSection(section.id, { hidden: true })],
                ['delete', () => api.removeSection(section.id)],
            ]}
        />
    );

    if (look === 'label') {
        return (
            <section data-empty={sectionBlank(section)} className="group/section relative grid gap-6 py-4" style={{ gridTemplateColumns: '11em 1fr', borderTop: first ? 'none' : `1px solid ${c.rule}` }}>
                <SectionHeading look={look} tone={tone} title={title} icon={section.icon} theme={theme} />
                <SectionBody section={section} look={look} tone={tone} theme={theme} />
                {controls}
            </section>
        );
    }

    const iconLook = look === 'icon';

    return (
        <section
            data-empty={sectionBlank(section)}
            className="group/section relative"
            style={iconLook ? { borderTop: first ? 'none' : `1px solid ${c.rule}`, paddingTop: first ? 0 : '1.1em', marginTop: first ? 0 : '1.1em' } : undefined}
        >
            <SectionHeading look={look} tone={tone} title={title} icon={section.icon} theme={theme} />
            <div style={iconLook ? { paddingLeft: '3.5em' } : undefined}>
                <SectionBody section={section} look={look} tone={tone} theme={theme} />
            </div>
            {controls}
        </section>
    );
}

function ContactList({ tone, inline = false, center = false }) {
    const { api, doc } = useEditor();
    const c = palette(tone, doc.theme);

    return (
        <div className={inline ? `flex flex-wrap gap-x-5 gap-y-1 ${center ? 'justify-center' : ''}` : 'space-y-2.5'}>
            {doc.contact.map((entry) => {
                const Icon = CONTACT_ICONS[entry.type] || Globe;
                return (
                    <div key={entry.id} className="group/item relative flex items-start gap-2.5">
                        <Icon color={c.icon} className="mt-[0.15em] shrink-0" style={{ width: '1.2em', height: '1.2em' }} />
                        <Editable
                            value={entry.value}
                            onChange={(v) => api.updateContact(entry.id, { value: v })}
                            placeholder={entry.type === 'email' ? 'email@example.com' : entry.type === 'address' ? 'Address' : entry.type === 'phone' ? '0900 000 0000' : 'linkedin.com/in/you'}
                            className={inline ? '' : 'flex-1'}
                            style={{ color: c.text }}
                        />
                        <HoverControls
                            className="-top-3 right-0"
                            actions={[
                                ['up', () => api.moveContact(entry.id, -1)],
                                ['down', () => api.moveContact(entry.id, 1)],
                                ['delete', () => api.removeContact(entry.id)],
                            ]}
                        />
                    </div>
                );
            })}
        </div>
    );
}

function ContactBlock({ look, tone }) {
    const { api, doc } = useEditor();
    const title = (
        <Editable tag="span" value={doc.contactTitle} onChange={(v) => api.setField('contactTitle', v)} placeholder="Contact" singleLine />
    );
    return (
        <div className="group/section relative">
            <SectionHeading look={look} tone={tone} title={title} icon="profile" theme={doc.theme} />
            <ContactList tone={tone} />
            <HoverControls group="section" className="-top-3 right-0" actions={[['add', () => api.addContact('phone')]]} />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

function Professional({ doc }) {
    const t = doc.theme;
    const main = visibleSections(doc, 'main');

    return (
        <div className="flex" style={{ minHeight: PAGE_H }}>
            <aside className="shrink-0" style={{ width: 262, background: t.primary, color: '#fff', borderBottomRightRadius: 56, padding: '40px 26px 48px' }}>
                <div className="mb-8 flex justify-center">
                    <Photo size={184} ring="5px solid #ffffff" />
                </div>
                <ContactBlock look="side" tone="light" />
                {visibleSections(doc, 'side').map((s) => (
                    <div key={s.id} className="mt-7">
                        <SectionView section={s} look="side" tone="light" />
                    </div>
                ))}
            </aside>

            <main className="relative flex-1" style={{ padding: '54px 40px 40px 34px' }}>
                {/* Corner triangles drawn with borders so they also appear in the PDF. */}
                <div className="absolute right-0 top-0" style={{ borderTop: `120px solid ${t.accent}`, borderLeft: '120px solid transparent' }} />
                <div className="absolute right-0 top-0" style={{ borderTop: `55px solid ${t.primary}`, borderLeft: '55px solid transparent' }} />
                <div className="relative pr-16">
                    <Name doc={doc} color={t.primary} />
                    <Title doc={doc} color="#374151" className="mt-2" />
                </div>
                <div className="mt-8">
                    {main.map((s, i) => (
                        <SectionView key={s.id} section={s} look="icon" first={i === 0} />
                    ))}
                </div>
            </main>
        </div>
    );
}

function Modern({ doc }) {
    const t = doc.theme;
    return (
        <div className="flex flex-col" style={{ minHeight: PAGE_H }}>
            <header className="flex items-center gap-7 px-10 pb-6 pt-10">
                <Photo size={122} ring={`4px solid ${mix(t.accent, 0.7)}`} />
                <div className="min-w-0 flex-1">
                    <Name doc={doc} color={t.primary} size="2.4em" />
                    <Title doc={doc} color={t.accent} spacing="0.15em" className="mt-1 font-semibold" />
                    <div className="mt-3 h-1 w-16 rounded-full" style={{ background: t.accent }} />
                </div>
            </header>
            <div className="flex flex-1">
                <main className="flex-1 space-y-6 px-10 pb-10 pt-2">
                    {visibleSections(doc, 'main').map((s) => (
                        <SectionView key={s.id} section={s} look="bar" />
                    ))}
                </main>
                <aside className="shrink-0 space-y-6 px-6 py-6" style={{ width: 245, background: '#f1f5f9' }}>
                    <ContactBlock look="bar" tone="dark" />
                    {visibleSections(doc, 'side').map((s) => (
                        <SectionView key={s.id} section={s} look="bar" />
                    ))}
                </aside>
            </div>
        </div>
    );
}

function Minimal({ doc }) {
    const t = doc.theme;
    return (
        <div className="px-14 py-12" style={{ minHeight: PAGE_H }}>
            <header className="flex items-center gap-6">
                <Photo size={96} />
                <div className="min-w-0 flex-1">
                    <Name doc={doc} color="#111827" size="2.3em" className="!font-semibold" />
                    <Title doc={doc} color="#6b7280" spacing="0.12em" className="mt-1" />
                </div>
            </header>
            <div className="mt-5 border-y py-3" style={{ borderColor: '#e5e7eb', color: t.text }}>
                <ContactList tone="dark" inline />
            </div>
            <div className="mt-2">
                {visibleSections(doc).map((s, i) => (
                    <SectionView key={s.id} section={s} look="label" first={i === 0} />
                ))}
            </div>
        </div>
    );
}

function Creative({ doc }) {
    const t = doc.theme;
    return (
        <div className="relative overflow-hidden" style={{ minHeight: PAGE_H }}>
            <div className="absolute rounded-full" style={{ width: 250, height: 250, left: -90, top: -110, background: t.accent, opacity: 0.18 }} />
            <div className="absolute rounded-full" style={{ width: 210, height: 210, right: -60, top: -50, background: t.accent, opacity: 0.32 }} />
            <div className="absolute rounded-full" style={{ width: 190, height: 190, right: -50, bottom: -70, background: t.accent, opacity: 0.14 }} />

            <header className="relative flex items-center gap-7 px-12 pt-12">
                <Photo size={132} ring={`6px solid ${t.accent}`} />
                <div className="min-w-0 flex-1">
                    <Name doc={doc} color={t.primary} size="2.5em" />
                    <Title doc={doc} color={t.accent} spacing="0.2em" className="mt-1 font-semibold" />
                </div>
            </header>

            <div className="relative grid gap-8 px-12 pb-12 pt-8" style={{ gridTemplateColumns: '1fr 232px' }}>
                <main className="space-y-6">
                    {visibleSections(doc, 'main').map((s) => (
                        <SectionView key={s.id} section={s} look="bar" />
                    ))}
                </main>
                <aside className="space-y-6 self-start rounded-2xl p-5" style={{ background: mix(t.accent, 0.9) }}>
                    <ContactBlock look="bar" tone="dark" />
                    {visibleSections(doc, 'side').map((s) => (
                        <SectionView key={s.id} section={s} look="bar" />
                    ))}
                </aside>
            </div>
        </div>
    );
}

function Elegant({ doc }) {
    const t = doc.theme;
    return (
        <div className="px-14 py-12" style={{ minHeight: PAGE_H, background: '#fffaf4' }}>
            <header className="flex flex-col items-center text-center">
                <Photo size={112} ring={`3px solid ${mix(t.accent, 0.5)}`} />
                <Name doc={doc} color={t.primary} size="2.3em" align="center" className="mt-4 tracking-[0.12em]" />
                <Title doc={doc} color={t.accent} align="center" spacing="0.25em" className="mt-1" />
                <div className="mt-4 w-full">
                    <ContactList tone="dark" inline center />
                </div>
            </header>
            <div className="mt-8 space-y-6">
                {visibleSections(doc, 'main').map((s) => (
                    <SectionView key={s.id} section={s} look="centered" />
                ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-x-10 gap-y-6">
                {visibleSections(doc, 'side').map((s) => (
                    <SectionView key={s.id} section={s} look="centered" />
                ))}
            </div>
        </div>
    );
}

function Corporate({ doc }) {
    const t = doc.theme;
    return (
        <div className="flex flex-col" style={{ minHeight: PAGE_H }}>
            <header className="flex items-center gap-7 px-10 py-8" style={{ background: t.primary }}>
                <Photo size={118} ring="4px solid rgba(255,255,255,0.85)" />
                <div className="min-w-0 flex-1">
                    <Name doc={doc} color="#ffffff" size="2.4em" />
                    <Title doc={doc} color={mix(t.accent, 0.35)} spacing="0.2em" className="mt-1" />
                </div>
            </header>
            <div className="h-1.5" style={{ background: t.accent }} />
            <div className="flex flex-1">
                <aside className="shrink-0 space-y-6 px-6 py-7" style={{ width: 250, background: '#eef2f7' }}>
                    <ContactBlock look="strip" tone="dark" />
                    {visibleSections(doc, 'side').map((s) => (
                        <SectionView key={s.id} section={s} look="strip" />
                    ))}
                </aside>
                <main className="flex-1 space-y-6 px-9 py-7">
                    {visibleSections(doc, 'main').map((s) => (
                        <SectionView key={s.id} section={s} look="strip" />
                    ))}
                </main>
            </div>
        </div>
    );
}

/**
 * `grouped` templates show sidebar and main sections separately, so moving a
 * section only swaps it with its neighbour in the same area.
 */
export const TEMPLATES = [
    { key: 'professional', label: 'Professional', component: Professional, grouped: true },
    { key: 'modern', label: 'Modern', component: Modern, grouped: true },
    { key: 'minimal', label: 'Minimal', component: Minimal, grouped: false },
    { key: 'creative', label: 'Creative', component: Creative, grouped: true },
    { key: 'elegant', label: 'Elegant', component: Elegant, grouped: true },
    { key: 'corporate', label: 'Corporate', component: Corporate, grouped: true },
];

export const findTemplate = (key) => TEMPLATES.find((t) => t.key === key) || TEMPLATES[0];

/** The A4 page itself. `pageRef` is what gets exported to PDF. */
export function ResumePage({ doc, pageRef }) {
    const { component: Template } = findTemplate(doc.template);
    const t = doc.theme;
    const font = ['Georgia', 'Times New Roman', 'Merriweather', 'Playfair Display'].includes(t.font) ? 'serif' : 'sans-serif';

    return (
        <div
            ref={pageRef}
            className="re-page relative overflow-hidden bg-white"
            style={{
                width: PAGE_W,
                minHeight: PAGE_H,
                fontFamily: `'${t.font}', ${font}`,
                fontSize: t.size,
                lineHeight: t.lineHeight,
                color: t.text,
            }}
        >
            <Template doc={doc} />
        </div>
    );
}
