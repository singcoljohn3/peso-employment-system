/*
 * Resume editor document model.
 *
 * A document is plain JSON so it can be saved as-is:
 * {
 *   version, template,
 *   theme:   { primary, accent, text, font, size, lineHeight, upperHeadings },
 *   photo:   { src, shape, visible },
 *   name, title,                      // rich-text HTML
 *   contact: [{ id, type, value }],   // value is rich-text HTML
 *   sections: [{ id, kind, type, title, icon, area, hidden, body?, items? }],
 * }
 */

export const uid = () => Math.random().toString(36).slice(2, 10);

export const FONTS = [
    'Poppins',
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Merriweather',
    'Playfair Display',
    'Georgia',
    'Times New Roman',
];

export const GOOGLE_FONTS_URL =
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&family=Playfair+Display:wght@400;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap';

export const FONT_SIZES = [9, 10, 11, 12, 13, 14, 16, 18, 20, 24];

export const COLOR_PRESETS = [
    { name: 'Navy', primary: '#1b3a5c', accent: '#2563eb' },
    { name: 'Charcoal', primary: '#1f2937', accent: '#64748b' },
    { name: 'Emerald', primary: '#064e3b', accent: '#10b981' },
    { name: 'Maroon', primary: '#5b1a24', accent: '#e11d48' },
    { name: 'Royal', primary: '#312e81', accent: '#8b5cf6' },
    { name: 'Coral', primary: '#3b2f2f', accent: '#f97360' },
    { name: 'Teal', primary: '#134e4a', accent: '#14b8a6' },
    { name: 'Gold', primary: '#3f3a2e', accent: '#c8961a' },
];

/** Quick text colours shown in the toolbar (same as the reference design). */
export const QUICK_COLORS = ['#1d63d8', '#64748b', '#cbd5e1', '#f97360'];

export const CONTACT_TYPES = {
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    website: 'Website / LinkedIn',
};

/**
 * Section kinds offered in the Elements panel. `type` picks the renderer,
 * `area` is where two-column templates place it by default.
 */
export const SECTION_CATALOG = {
    profile: { label: 'Profile', type: 'text', icon: 'profile', area: 'main' },
    education: { label: 'Education', type: 'timeline', icon: 'education', area: 'main' },
    experience: { label: 'Work Experience', type: 'timeline', icon: 'experience', area: 'main' },
    skills: { label: 'Skills', type: 'skills', icon: 'skills', area: 'side' },
    certifications: { label: 'Certifications', type: 'list', icon: 'certifications', area: 'side' },
    trainings: { label: 'Trainings', type: 'list', icon: 'trainings', area: 'main' },
    achievements: { label: 'Achievements', type: 'list', icon: 'achievements', area: 'main' },
    languages: { label: 'Languages', type: 'list', icon: 'languages', area: 'side' },
    references: { label: 'References', type: 'references', icon: 'references', area: 'side' },
    custom: { label: 'Custom Section', type: 'text', icon: 'custom', area: 'main' },
};

export const newItem = (type) => {
    switch (type) {
        case 'timeline':
            return { id: uid(), heading: '', subheading: '', date: '', body: '' };
        case 'skills':
            return { id: uid(), name: '', level: 70 };
        case 'references':
            return { id: uid(), name: '', role: '', org: '', contact: '' };
        default:
            return { id: uid(), text: '' };
    }
};

export const newSection = (kind, overrides = {}) => {
    const def = SECTION_CATALOG[kind] || SECTION_CATALOG.custom;
    const section = {
        id: uid(),
        kind,
        type: def.type,
        title: def.label,
        icon: def.icon,
        area: def.area,
        hidden: false,
        ...overrides,
    };

    if (def.type === 'text') {
        section.body = section.body ?? '';
    } else if (!section.items) {
        section.items = [newItem(def.type)];
    }

    return section;
};

/** Profile fields often hold placeholders such as "N/A"; treat them as empty. */
const clean = (value) => {
    const text = String(value ?? '').trim();
    return /^(n\/?a|none|null|-+)$/i.test(text) ? '' : text;
};

const escapeHtml = (value) =>
    clean(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

/** Seed lists may hold strings or objects from older builders. */
const toText = (entry) => {
    if (entry == null) return '';
    if (typeof entry === 'string' || typeof entry === 'number') return String(entry);
    return Object.values(entry).filter(Boolean).join(' – ');
};

const textItems = (list) =>
    (Array.isArray(list) ? list : [])
        .map(toText)
        .map(clean)
        .filter(Boolean)
        .map((t) => ({ id: uid(), text: escapeHtml(t) }));

const withFallback = (items, type) => (items.length ? items : [newItem(type)]);

export const DEFAULT_THEME = {
    primary: '#1b3a5c',
    accent: '#2563eb',
    text: '#1f2937',
    font: 'Poppins',
    size: 12,
    lineHeight: 1.5,
    upperHeadings: true,
};

/**
 * Build a first draft from the member's profile (ResumeBuilderService::buildContent).
 */
export function seedToDocument(seed = {}, photoUrl = null) {
    const contact = [
        clean(seed.contact_number) && { id: uid(), type: 'phone', value: escapeHtml(seed.contact_number) },
        clean(seed.email) && { id: uid(), type: 'email', value: escapeHtml(seed.email) },
        (clean(seed.address) || clean(seed.barangay)) && {
            id: uid(),
            type: 'address',
            value: escapeHtml([clean(seed.address), clean(seed.barangay)].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')),
        },
    ].filter(Boolean);

    const education = (seed.educational_background || [])
        .filter((e) => e && (clean(e.level) || clean(e.school) || clean(e.year)))
        .map((e) => ({
            id: uid(),
            heading: escapeHtml(e.level),
            subheading: escapeHtml(e.school),
            date: escapeHtml(e.year),
            body: '',
        }));

    const experience = (seed.work_experience || [])
        .filter((e) => e && (clean(e.position) || clean(e.company) || clean(e.years)))
        .map((e) => ({
            id: uid(),
            heading: escapeHtml(e.position),
            subheading: escapeHtml(e.company),
            date: escapeHtml(e.years),
            body: '',
        }));

    const skills = (seed.skills || [])
        .map(toText)
        .map(clean)
        .filter(Boolean)
        .map((name) => ({ id: uid(), name: escapeHtml(name), level: 80 }));

    const references = (seed.references || [])
        .filter((r) => r && (clean(r.name) || clean(r.position) || clean(r.contact)))
        .map((r) => ({
            id: uid(),
            name: escapeHtml(r.name),
            role: escapeHtml(r.position),
            org: '',
            contact: escapeHtml(r.contact),
        }));

    const sections = [
        newSection('profile', { body: escapeHtml(seed.professional_summary) }),
        newSection('education', { items: withFallback(education, 'timeline') }),
        newSection('experience', { items: withFallback(experience, 'timeline') }),
        newSection('trainings', { items: withFallback(textItems(seed.training), 'list') }),
        newSection('achievements'),
        newSection('skills', { items: withFallback(skills, 'skills') }),
        newSection('certifications', {
            items: withFallback(textItems([...(seed.certifications || []), ...(seed.licenses || [])]), 'list'),
        }),
        newSection('references', { items: withFallback(references, 'references') }),
    ];

    if (clean(seed.additional_information)) {
        sections.push(newSection('custom', { title: 'Additional Information', body: escapeHtml(seed.additional_information) }));
    }

    return {
        version: 1,
        template: 'professional',
        theme: { ...DEFAULT_THEME },
        photo: { src: photoUrl || null, shape: 'circle', visible: true },
        name: escapeHtml((seed.full_name || '').toUpperCase()),
        title: escapeHtml(seed.professional_title),
        contactTitle: 'Contact',
        contact: contact.length ? contact : [{ id: uid(), type: 'phone', value: '' }],
        sections,
    };
}

/** Fill in anything an older saved document may be missing. */
export function normaliseDocument(doc) {
    return {
        version: 1,
        template: 'professional',
        name: '',
        title: '',
        contactTitle: 'Contact',
        contact: [],
        sections: [],
        ...doc,
        theme: { ...DEFAULT_THEME, ...(doc?.theme || {}) },
        photo: { src: null, shape: 'circle', visible: true, ...(doc?.photo || {}) },
    };
}

/** True when a rich-text value has no visible text. */
export const isBlank = (html) => !String(html ?? '').replace(/<[^>]*>|&nbsp;/g, '').trim();

/** Plain text of a rich-text value (for file names etc). */
export const plainText = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return (div.textContent || '').trim();
};

/** Resize an uploaded image to a compact JPEG data URL. */
export function readImageAsDataUrl(file, maxSize = 480) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not read the image.'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('That file is not a valid image.'));
            img.onload = () => {
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}
