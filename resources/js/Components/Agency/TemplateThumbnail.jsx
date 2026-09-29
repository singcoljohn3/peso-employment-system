import { Check } from 'lucide-react';

/**
 * Visual layout descriptor per template, so the gallery cards actually reflect
 * each template's real layout instead of just a colour swatch.
 *
 * columns: 'single' | 'two'
 * header:  'gradient' | 'solid' | 'cream' | 'centered' | 'bordered' | 'plain' | 'sidebar'
 */
const LAYOUTS = {
    'modern-professional': { columns: 'single', header: 'gradient', accent: '#2563eb', note: 'Gradient banner header' },
    'simple-classic': { columns: 'single', header: 'centered', accent: '#1e293b', note: 'Centred header' },
    'ats-friendly': { columns: 'single', header: 'bordered', accent: '#000000', note: 'Plain, parser safe' },
    creative: { columns: 'two', header: 'sidebar', accent: '#7c3aed', note: 'Coloured sidebar' },
    minimalist: { columns: 'single', header: 'plain', accent: '#94a3b8', note: 'Airy, thin rules' },
    'formal-corporate': { columns: 'single', header: 'solid', accent: '#1e293b', note: 'Dark solid header' },
    'formal-elegant': { columns: 'single', header: 'cream', accent: '#8b5e3c', note: 'Cream & bronze' },
    'formal-executive': { columns: 'two', header: 'sidebar', accent: '#1a1a2e', note: 'Navy sidebar, gold titles' },
    'clean-modern': { columns: 'single', header: 'plain', accent: '#0f766e', note: 'Clean teal lines & cards' },
    'two-column-professional': { columns: 'two', header: 'sidebar', accent: '#0f3b5e', note: 'Two-column corporate grid' },
    'formal-professional': { columns: 'single', header: 'plain', accent: '#0f766e', note: 'Clean teal lines & cards' },
    'formal-traditional': { columns: 'two', header: 'sidebar', accent: '#0f3b5e', note: 'Two-column corporate grid' },
};

export { LAYOUTS };

function Bar({ w = '100%', h = 3, color = '#cbd5e1', className = '' }) {
    return <div className={`rounded-full ${className}`} style={{ width: w, height: h, backgroundColor: color }} />;
}

function SectionMock({ accent, wide = false }) {
    return (
        <div className="space-y-[3px]">
            <div className="h-[3px] w-1/2 rounded-full" style={{ backgroundColor: accent }} />
            <Bar w={wide ? '100%' : '85%'} />
            <Bar w="70%" />
        </div>
    );
}

export default function TemplateThumbnail({ templateKey, active = false }) {
    const layout = LAYOUTS[templateKey] || LAYOUTS['modern-professional'];
    const { columns, header, accent } = layout;

    const headerBlock = () => {
        switch (header) {
            case 'gradient':
                return (
                    <div
                        className="flex h-9 w-full items-end px-1.5 pb-1"
                        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}
                    >
                        <div className="space-y-[2px]">
                            <div className="h-[4px] w-10 rounded-full bg-white/90" />
                            <div className="h-[2px] w-14 rounded-full bg-white/60" />
                        </div>
                    </div>
                );
            case 'solid':
                return (
                    <div className="flex h-9 w-full items-end px-1.5 pb-1" style={{ backgroundColor: accent }}>
                        <div className="h-[4px] w-10 rounded-full bg-white/90" />
                    </div>
                );
            case 'cream':
                return (
                    <div className="flex w-full flex-col justify-end bg-[#f8f5f0] px-1.5 pb-1">
                        <div className="h-[4px] w-10 rounded-full" style={{ backgroundColor: accent }} />
                        <div className="mt-[2px] h-[2px] w-full" style={{ backgroundColor: accent }} />
                    </div>
                );
            case 'centered':
                return (
                    <div className="flex h-9 w-full flex-col items-center justify-center gap-[3px] border-b border-slate-300">
                        <div className="h-[4px] w-12 rounded-full" style={{ backgroundColor: accent }} />
                        <div className="h-[2px] w-16 rounded-full bg-slate-300" />
                    </div>
                );
            case 'bordered':
                return (
                    <div className="flex h-9 w-full flex-col justify-center gap-[3px] border-b-2 px-1" style={{ borderColor: accent }}>
                        <div className="h-[4px] w-12 rounded-full" style={{ backgroundColor: accent }} />
                        <div className="h-[2px] w-16 rounded-full bg-slate-400" />
                    </div>
                );
            case 'plain':
            default:
                return (
                    <div className="flex h-9 w-full flex-col justify-center gap-[3px]">
                        <div className="h-[4px] w-12 rounded-full bg-slate-700" />
                        <div className="h-[2px] w-full rounded-full bg-slate-200" />
                    </div>
                );
        }
    };

    return (
        <div
            className={`flex h-[92px] w-full flex-col overflow-hidden rounded-md border bg-white transition-shadow ${
                active ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-200'
            }`}
        >
            {columns === 'two' ? (
                <div className="flex h-full">
                    <div
                        className="w-[34%] px-1 py-1.5"
                        style={{ background: `linear-gradient(180deg, ${accent}, ${accent}cc)` }}
                    >
                        <div className="space-y-[3px]">
                            <div className="h-[4px] w-4/5 rounded-full bg-white/90" />
                            <div className="h-[2px] w-4/5 rounded-full bg-white/50" />
                            <div className="h-[2px] w-3/5 rounded-full bg-white/40" />
                        </div>
                        <div className="mt-2 space-y-[2px]">
                            <div className="h-[2px] w-full rounded-full bg-white/40" />
                            <div className="h-[2px] w-4/5 rounded-full bg-white/40" />
                            <div className="h-[2px] w-3/5 rounded-full bg-white/40" />
                        </div>
                    </div>
                    <div className="flex-1 space-y-2 px-1.5 py-1.5">
                        <SectionMock accent={accent === '#1a1a2e' ? '#e0a800' : accent} wide />
                        <SectionMock accent={accent === '#1a1a2e' ? '#e0a800' : accent} />
                    </div>
                </div>
            ) : (
                <div className="flex h-full flex-col">
                    {headerBlock()}
                    <div className="flex-1 space-y-2 px-1.5 py-1.5">
                        <SectionMock accent={accent} />
                        <SectionMock accent={accent} />
                    </div>
                </div>
            )}

            {active && (
                <div className="absolute right-1 top-1 rounded-full bg-blue-600 p-0.5 text-white shadow">
                    <Check className="h-2.5 w-2.5" />
                </div>
            )}
        </div>
    );
}
