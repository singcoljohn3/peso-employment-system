<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
            $templates[] = ['key' => $key, 'label' => $label];
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

        $jobSeeker->update(['preferred_template' => $request->template]);

        return response()->json([
            'message' => 'Resume template updated successfully',
            'template' => $request->template,
        ]);
    }

    public function preview()
    {
        $user = request()->user();
        $jobSeeker = JobSeeker::with(['barangay'])->where('user_id', $user->id)->first();

        if (!$jobSeeker) {
            return response()->json(['message' => 'Job seeker profile not found'], 404);
        }

        $data = $this->resumeService->buildResumeData($jobSeeker);

        return response()->json([
            'data' => $data,
            'template' => $jobSeeker->preferred_template ?? 'modern-professional',
        ]);
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
            return response()->json(['message' => 'No resume generated yet', 'resume' => null]);
        }

        $resume->load(['generatedBy']);
        $resume->append('download_url');

        return response()->json(['resume' => $resume]);
    }

    public function download(Resume $resume)
    {
        if (!$resume->file_path || !\Storage::disk('public')->exists($resume->file_path)) {
            return response()->json(['message' => 'Resume file not found'], 404);
        }

        return response()->download(
            \Storage::disk('public')->path($resume->file_path),
            $resume->resume_id . '_' . str_replace(' ', '_', $resume->jobSeeker->full_name ?? 'Resume') . '.pdf'
        );
    }

}
