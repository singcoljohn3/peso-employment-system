<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\JobSeeker;
use App\Models\Resume;
use App\Services\ResumeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ResumeController extends Controller
{
    public function __construct(
        protected ResumeService $resumeService
    ) {}

    public function templates()
    {
        $templates = [];
        foreach (ResumeService::TEMPLATES as $key => $label) {
            $templates[] = ['key' => $key, 'label' => $label, 'description' => $this->getTemplateDescription($key)];
        }

        return response()->json(['templates' => $templates]);
    }

    public function updateTemplate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'template' => ['required', 'string', 'in:' . implode(',', array_keys(ResumeService::TEMPLATES))],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $jobSeeker = JobSeeker::where('user_id', $user->id)->first();

        if (!$jobSeeker) {
            return response()->json(['message' => 'Job seeker profile not found'], 404);
        }

        $oldTemplate = $jobSeeker->preferred_template;
        $jobSeeker->update(['preferred_template' => $request->template]);

        if ($jobSeeker->resume) {
            $jobSeeker->resume->update(['template' => $request->template]);
        }

        ActivityLog::log(
            'template_updated',
            'resume',
            "Resume template changed from '{$oldTemplate}' to '{$request->template}'",
            $jobSeeker->resume,
            ['old_template' => $oldTemplate, 'new_template' => $request->template],
            $user->id,
        );

        return response()->json([
            'message' => 'Resume template updated successfully',
            'template' => $request->template,
        ]);
    }

    public function preview()
    {
        $user = request()->user();
        $jobSeeker = JobSeeker::with(['barangay', 'resume'])->where('user_id', $user->id)->first();

        if (!$jobSeeker) {
            return response()->json(['message' => 'Job seeker profile not found'], 404);
        }

        $template = request('template', $jobSeeker->preferred_template ?? 'modern-professional');
        $data = $this->resumeService->buildResumeData($jobSeeker);

        try {
            $html = view($this->resumeService->viewFor($template), ['data' => $data])->render();
        } catch (\Exception $e) {
            $html = null;
        }

        return response()->json([
            'data' => $data,
            'template' => $template,
            'html' => $html,
            'missing_fields' => $this->resumeService->validateRequiredFields($jobSeeker),
        ]);
    }

    public function generate(Request $request)
    {
        $user = $request->user();
        $jobSeeker = JobSeeker::with(['barangay'])->where('user_id', $user->id)->first();

        if (!$jobSeeker) {
            return response()->json(['message' => 'Job seeker profile not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'template' => ['nullable', 'string', 'in:' . implode(',', array_keys(ResumeService::TEMPLATES))],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $admin = \App\Models\User::where('role', 'admin')->first() ?? $user;
            $resume = $this->resumeService->generateResume(
                $jobSeeker,
                $admin,
                $request->template ?? $jobSeeker->preferred_template,
            );

            $resume->append('download_url');

            return response()->json([
                'message' => 'Resume generated successfully',
                'resume' => $resume,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $missing = $e->validator->errors()->get('fields')[0] ?? [];
            return response()->json([
                'message' => 'Cannot generate resume. Missing required fields.',
                'missing_fields' => $missing,
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to generate resume: ' . $e->getMessage()], 500);
        }
    }

    public function show()
    {
        $user = request()->user();
        $jobSeeker = JobSeeker::where('user_id', $user->id)->first();

        if (!$jobSeeker) {
            return response()->json(['message' => 'Job seeker profile not found'], 404);
        }

        $resume = Resume::where('job_seeker_id', $jobSeeker->id)->first();

        if (!$resume) {
            return response()->json([
                'message' => 'No resume generated yet',
                'resume' => null,
                'missing_fields' => $this->resumeService->validateRequiredFields($jobSeeker),
            ]);
        }

        $resume->load(['generatedBy']);
        $resume->append('download_url');

        return response()->json([
            'resume' => $resume,
            'missing_fields' => $this->resumeService->validateRequiredFields($jobSeeker),
        ]);
    }

    public function download(Resume $resume)
    {
        if ($resume->job_seeker_id !== auth()->user()?->jobSeeker?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$resume->file_path || !\Storage::disk('public')->exists($resume->file_path)) {
            return response()->json(['message' => 'Resume file not found'], 404);
        }

        $this->resumeService->markAsDownloaded($resume);

        return response()->download(
            \Storage::disk('public')->path($resume->file_path),
            $resume->resume_id . '_' . str_replace(' ', '_', $resume->jobSeeker->full_name ?? 'Resume') . '.pdf'
        );
    }

    public function status()
    {
        $user = request()->user();
        $jobSeeker = JobSeeker::where('user_id', $user->id)->first();

        if (!$jobSeeker) {
            return response()->json(['message' => 'Job seeker profile not found'], 404);
        }

        $resume = Resume::where('job_seeker_id', $jobSeeker->id)->first();

        return response()->json([
            'has_resume' => $resume !== null,
            'status' => $resume?->status ?? 'none',
            'status_label' => $resume?->status_label ?? 'No Resume',
            'template' => $resume?->template ?? $jobSeeker->preferred_template ?? 'modern-professional',
            'generated_at' => $resume?->generated_at,
            'downloaded_at' => $resume?->downloaded_at,
            'download_count' => $resume?->download_count ?? 0,
        ]);
    }

    private function getTemplateDescription(string $key): string
    {
        return match ($key) {
            'modern-professional' => 'Clean blue-themed layout with gradient header, perfect for corporate applications.',
            'simple-classic' => 'Traditional black header with straightforward section layout.',
            'ats-friendly' => 'Plain black/white ATS-optimized format for automated screening systems.',
            'creative' => 'Vibrant purple sidebar design for creative industry roles.',
            'minimalist' => 'Clean minimal design with uppercase headers and subtle styling.',
            'formal-corporate' => 'Dark solid header with formal section rules, suited to corporate and supervisory roles.',
            'formal-elegant' => 'Cream and bronze serif styling with an elegant, understated feel.',
            'formal-executive' => 'Navy sidebar with gold section titles for senior leadership profiles.',
            'clean-modern' => 'Clean teal accent lines and cards for a modern professional look.',
            'two-column-professional' => 'Centred traditional layout ideal for long careers and detailed histories.',
            default => '',
        };
    }
}
