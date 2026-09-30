<?php

namespace App\Services;

use App\Models\JobSeeker;
use App\Models\ResumeDocument;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Backs the visual resume editor shared by the job seeker and agency portals.
 * The editor document is stored as-is; the builder's profile content is only
 * used to seed a first draft when nothing has been saved yet.
 */
class ResumeEditorService
{
    /** Upper bound for a saved document, photo included (bytes of JSON). */
    private const MAX_DOCUMENT_BYTES = 5_000_000;

    public function pageProps(JobSeeker $jobSeeker, string $saveUrl, string $backUrl, string $backLabel): array
    {
        $jobSeeker->loadMissing(['user', 'barangay']);

        $record = ResumeDocument::where('job_seeker_id', $jobSeeker->id)->first();

        return [
            'document' => $record?->document,
            'seed' => app(ResumeBuilderService::class)->buildContent($jobSeeker),
            'photoUrl' => $this->photoUrl($jobSeeker->photo_url),
            'subjectName' => $jobSeeker->full_name,
            'savedAt' => $record?->updated_at?->format('M d, Y g:i A'),
            'saveUrl' => $saveUrl,
            'backUrl' => $backUrl,
            'backLabel' => $backLabel,
        ];
    }

    public function save(Request $request, JobSeeker $jobSeeker): ResumeDocument
    {
        $validated = $request->validate([
            'document' => ['required', 'array'],
            'document.template' => ['required', 'string', 'max:50'],
            'document.sections' => ['present', 'array'],
        ]);

        if (strlen(json_encode($validated['document'])) > self::MAX_DOCUMENT_BYTES) {
            throw ValidationException::withMessages([
                'document' => 'The resume is too large to save. Try a smaller photo.',
            ]);
        }

        return ResumeDocument::updateOrCreate(
            ['job_seeker_id' => $jobSeeker->id],
            ['document' => $request->input('document'), 'saved_by' => $request->user()?->id],
        );
    }

    private function photoUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return str_starts_with($path, 'http') ? $path : '/storage/' . ltrim($path, '/');
    }
}
