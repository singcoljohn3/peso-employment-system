import { createContext, useContext, useLayoutEffect, useRef } from 'react';
import { ArrowDown, ArrowUp, EyeOff, Plus, Trash2 } from 'lucide-react';

/**
 * `api` holds the document mutations; `readOnly` renders static HTML (used by
 * the template thumbnails) so nothing in them can be focused or edited.
 */
export const EditorContext = createContext({ api: null, readOnly: true });
export const useEditor = () => useContext(EditorContext);

const pastePlainText = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
};

/**
 * A contentEditable region bound to an HTML string. The DOM is only rewritten
 * when the value differs from what is already there (e.g. after undo), so the
 * caret is not reset while typing.
 */
export function Editable({ value, onChange, tag: Tag = 'div', className = '', style, placeholder, singleLine = false }) {
    const ref = useRef(null);
    const { readOnly } = useEditor();

    useLayoutEffect(() => {
        if (ref.current && ref.current.innerHTML !== (value || '')) {
            ref.current.innerHTML = value || '';
        }
    }, [value, readOnly]);

    if (readOnly) {
        return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: value || '' }} />;
    }

    return (
        <Tag
            ref={ref}
            className={`re-editable ${className}`}
            style={style}
            contentEditable
            suppressContentEditableWarning
            spellCheck
            data-placeholder={placeholder}
            onInput={(e) => {
                const html = e.currentTarget.innerHTML;
                onChange(html === '<br>' ? '' : html);
            }}
            onKeyDown={
                singleLine
                    ? (e) => {
                          if (e.key === 'Enter') e.preventDefault();
                      }
                    : undefined
            }
            onPaste={pastePlainText}
        />
    );
}

const ICONS = { up: ArrowUp, down: ArrowDown, add: Plus, hide: EyeOff, delete: Trash2 };
const TITLES = { up: 'Move up', down: 'Move down', add: 'Add item', hide: 'Hide section', delete: 'Delete' };

/**
 * Small floating action bar shown on hover. Marked `re-ui` so it is left out
 * of the PDF.
 */
export function HoverControls({ actions, group = 'item', className = '' }) {
    const { readOnly } = useEditor();
    if (readOnly) return null;

    const visibility = group === 'section' ? 'group-hover/section:flex' : 'group-hover/item:flex';

    return (
        <div
            className={`re-ui absolute z-20 hidden items-center gap-0.5 rounded-md border border-slate-200 bg-white p-0.5 shadow-md ${visibility} ${className}`}
            onMouseDown={(e) => e.preventDefault()}
        >
            {actions.filter(Boolean).map(([kind, handler]) => {
                const Icon = ICONS[kind];
                return (
                    <button
                        key={kind}
                        type="button"
                        title={TITLES[kind]}
                        onClick={handler}
                        className={`rounded p-1 ${kind === 'delete' ? 'text-red-500 hover:bg-red-50' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                    </button>
                );
            })}
        </div>
    );
}
