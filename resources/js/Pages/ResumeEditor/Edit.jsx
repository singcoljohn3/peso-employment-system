import { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import ResumeEditor from '@/Components/ResumeEditor/ResumeEditor';
import { GOOGLE_FONTS_URL, normaliseDocument, seedToDocument } from '@/Components/ResumeEditor/documentModel';

/**
 * Visual resume editor, shared by the job seeker portal and the agency
 * member resume builder. The server decides where it saves and goes back to.
 */
export default function Edit({ document, seed, photoUrl, subjectName, savedAt, saveUrl, backUrl, backLabel }) {
    const initialDocument = useMemo(
        () => (document ? normaliseDocument(document) : seedToDocument(seed, photoUrl)),
        // Only on first load; later edits live in the editor's own state.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <>
            <Head title={`Resume Editor — ${subjectName || 'Resume'}`}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="stylesheet" href={GOOGLE_FONTS_URL} />
            </Head>
            <ResumeEditor
                initialDocument={initialDocument}
                saveUrl={saveUrl}
                backUrl={backUrl}
                backLabel={backLabel}
                subjectName={subjectName}
                savedAt={savedAt}
            />
        </>
    );
}
