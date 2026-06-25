<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\JobSeeker;
use App\Models\Resume;
use App\Services\ResumeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminResumeController extends Controller
{
    public function __construct(
        protected ResumeService $resumeService
    ) {}

    public function index(): Response
    {
        $resumes = Resume::with(['jobSeeker.user', 'generatedBy'])
            ->orderBy('updated_at', 'desc')
            ->paginate(15);

        $jobSeekersWithoutResume = JobSeeker::with(['user', 'barangay'])
            ->whereDoesntHave('resume')
            ->where('is_fully_registered', true)
            ->orderBy('last_name')
            ->get();

        $logs = ActivityLog::with('user')
            ->where('module', 'resume')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $stats = [
            'total' => Resume::count(),
            'generated' => Resume::generated()->count(),
            'downloaded' => Resume::byStatus(Resume::STATUS_DOWNLOADED)->count(),
            'draft' => Resume::byStatus(Resume::STATUS_DRAFT)->count(),
            'seekers_without' => $jobSeekersWithoutResume->count(),
        ];

        return Inertia::render('Admin/Resumes', [
            'resumes' => $resumes,
            'jobSeekersWithoutResume' => $jobSeekersWithoutResume,
            'templates' => ResumeService::TEMPLATES,
            'statusLabels' => Resume::STATUS_LABELS,
            'statusColors' => Resume::STATUS_COLORS,
            'allStatuses' => Resume::ALL_STATUSES,
            'logs' => $logs,
            'stats' => $stats,
        ]);
    }

    public function validateFields(Request $request)
    {
        $validated = $request->validate([
            'job_seeker_id' => ['required', 'exists:job_seekers,id'],
        ]);

        $jobSeeker = JobSeeker::with(['user'])->findOrFail($validated['job_seeker_id']);
        $missing = $this->resumeService->validateRequiredFields($jobSeeker);

        return response()->json([
            'valid' => empty($missing),
            'missing_fields' => $missing,
            'job_seeker_name' => $jobSeeker->full_name,
        ]);
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'job_seeker_id' => ['required', 'exists:job_seekers,id'],
            'template' => ['nullable', 'string', 'in:' . implode(',', array_keys(ResumeService::TEMPLATES))],
        ]);

        $jobSeeker = JobSeeker::with(['user', 'barangay'])->findOrFail($validated['job_seeker_id']);
        $admin = Auth::user();

        try {
            $resume = $this->resumeService->generateResume(
                $jobSeeker,
                $admin,
                $validated['template'] ?? null,
            );

            return redirect()->route('admin.resumes')
                ->with('success', "Resume {$resume->resume_id} generated successfully for {$jobSeeker->full_name}.");
        } catch (ValidationException $e) {
            $missing = $e->validator->errors()->get('fields')[0] ?? [];
            $fieldList = is_array($missing) ? implode(', ', $missing) : $missing;
            return redirect()->back()->withErrors([
                'missing_fields' => "Cannot generate resume. Missing required fields: {$fieldList}",
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to generate resume: ' . $e->getMessage(),
            ]);
        }
    }

    public function preview(Request $request)
    {
        $validated = $request->validate([
            'job_seeker_id' => ['required', 'exists:job_seekers,id'],
            'template' => ['required', 'string', 'in:' . implode(',', array_keys(ResumeService::TEMPLATES))],
        ]);

        $jobSeeker = JobSeeker::with(['user', 'barangay'])->findOrFail($validated['job_seeker_id']);

        try {
            $data = $this->resumeService->buildResumeData($jobSeeker);
            $html = view('resumes.templates.' . $validated['template'], ['data' => $data])->render();

            return response()->json([
                'html' => $html,
                'data' => $data,
                'template' => $validated['template'],
                'seeker_name' => $jobSeeker->full_name,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Preview generation failed: ' . $e->getMessage()], 500);
        }
    }

    public function regenerate(Request $request, Resume $resume)
    {
        $validated = $request->validate([
            'template' => ['nullable', 'string', 'in:' . implode(',', array_keys(ResumeService::TEMPLATES))],
            'custom_content' => ['nullable', 'array'],
        ]);

        $admin = Auth::user();

        try {
            $this->resumeService->regenerateResume(
                $resume,
                $admin,
                $validated['template'] ?? null,
                $validated['custom_content'] ?? null,
            );

            return redirect()->route('admin.resumes')
                ->with('success', "Resume {$resume->resume_id} regenerated successfully.");
        } catch (ValidationException $e) {
            $missing = $e->validator->errors()->get('fields')[0] ?? [];
            $fieldList = is_array($missing) ? implode(', ', $missing) : $missing;
            return redirect()->back()->withErrors([
                'missing_fields' => "Cannot regenerate resume. Missing required fields: {$fieldList}",
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to regenerate resume: ' . $e->getMessage(),
            ]);
        }
    }

    public function download(Resume $resume)
    {
        if (!$resume->file_path || !\Storage::disk('public')->exists($resume->file_path)) {
            return redirect()->route('admin.resumes')->with('error', 'Resume file not found.');
        }

        $this->resumeService->markAsDownloaded($resume);

        $jobSeeker = $resume->jobSeeker;
        $downloadName = $resume->resume_id . '_' . str_replace(' ', '_', $jobSeeker?->full_name ?? 'Resume') . '.pdf';

        return response()->download(
            \Storage::disk('public')->path($resume->file_path),
            $downloadName
        );
    }

    public function delete(Resume $resume)
    {
        $seekerName = $resume->jobSeeker?->full_name ?? 'Unknown';
        $resumeId = $resume->resume_id;

        if ($resume->file_path && \Storage::disk('public')->exists($resume->file_path)) {
            \Storage::disk('public')->delete($resume->file_path);
        }

        $resume->delete();

        ActivityLog::log(
            'deleted',
            'resume',
            "Resume {$resumeId} deleted for {$seekerName}",
            null,
            ['resume_id' => $resumeId, 'job_seeker_name' => $seekerName],
        );

        return redirect()->route('admin.resumes')
            ->with('success', "Resume {$resumeId} deleted successfully.");
    }

    public function bulkGenerate(Request $request)
    {
        $validated = $request->validate([
            'job_seeker_ids' => ['required', 'array', 'min:1'],
            'job_seeker_ids.*' => ['exists:job_seekers,id'],
            'template' => ['nullable', 'string', 'in:' . implode(',', array_keys(ResumeService::TEMPLATES))],
        ]);

        $admin = Auth::user();
        $generated = 0;
        $errors = [];

        foreach ($validated['job_seeker_ids'] as $id) {
            $jobSeeker = JobSeeker::find($id);
            if (!$jobSeeker) continue;

            try {
                $this->resumeService->generateResume($jobSeeker, $admin, $validated['template'] ?? null);
                $generated++;
            } catch (ValidationException $e) {
                $errors[] = "{$jobSeeker->full_name}: missing required fields";
            } catch (\Exception $e) {
                $errors[] = "{$jobSeeker->full_name}: {$e->getMessage()}";
            }
        }

        $message = "{$generated} resume(s) generated successfully.";
        if (!empty($errors)) {
            $message .= ' Errors: ' . implode('; ', $errors);
        }

        return redirect()->route('admin.resumes')
            ->with('success', $message);
    }

    public function logs()
    {
        $logs = ActivityLog::with('user')
            ->where('module', 'resume')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return Inertia::render('Admin/ResumeLogs', [
            'logs' => $logs,
        ]);
    }
}
