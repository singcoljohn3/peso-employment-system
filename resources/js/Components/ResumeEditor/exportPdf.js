import { isBlank } from './documentModel';

/**
 * Render the resume page to an A4 PDF exactly as it looks on screen. Pages
 * taller than A4 are split across several PDF pages.
 */
export async function exportResumePdf(pageEl, fileName) {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);

    document.activeElement?.blur?.();
    window.getSelection()?.removeAllRanges();

    if (document.fonts?.ready) await document.fonts.ready;

    pageEl.classList.add('re-exporting');

    try {
        const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            ignoreElements: (el) => el.classList?.contains('re-ui'),
            onclone: (clonedDoc) => {
                // The editor zooms the page with a CSS transform; export it at 100%.
                clonedDoc.querySelectorAll('[data-re-scaler]').forEach((el) => {
                    el.style.transform = 'none';
                });
                // html2canvas turns ::before placeholders into real text, so drop
                // empty fields, empty entries and editor controls from the copy.
                clonedDoc.querySelectorAll('[data-empty="true"], .re-ui').forEach((el) => el.remove());
                clonedDoc.querySelectorAll('.re-editable').forEach((el) => {
                    if (isBlank(el.innerHTML)) el.remove();
                    else el.removeAttribute('data-placeholder');
                });
            },
        });

        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const pageWidthMm = 210;
        const pageHeightMm = 297;
        const sliceHeightPx = Math.floor(canvas.width * (pageHeightMm / pageWidthMm));

        for (let y = 0, page = 0; y < canvas.height - 4; y += sliceHeightPx, page++) {
            const height = Math.min(sliceHeightPx, canvas.height - y);
            const slice = document.createElement('canvas');
            slice.width = canvas.width;
            slice.height = height;
            const ctx = slice.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, slice.width, slice.height);
            ctx.drawImage(canvas, 0, y, canvas.width, height, 0, 0, canvas.width, height);

            if (page > 0) pdf.addPage();
            pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageWidthMm, (height * pageWidthMm) / canvas.width);
        }

        pdf.save(fileName);
    } finally {
        pageEl.classList.remove('re-exporting');
    }
}
