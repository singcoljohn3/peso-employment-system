<?php

namespace App\Http\Controllers;

use App\Models\JobSeeker;
use App\Models\Resume;
use App\Services\ResumeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        return Inertia::render('Admin/Resumes', [
            'resumes' => $resumes,
            'jobSeekersWithoutResume' => $jobSeekersWithoutResume,
            'templates' => ResumeService::TEMPLATES,
        ]);

        
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'job_seeker_id' => ['required', 'exists:job_seekers,id'],
        ]);

        $jobSeeker = JobSeeker::with(['user'])->findOrFail($validated['job_seeker_id']);
        $admin = Auth::user();

        if (!$jobSeeker->is_fully_registered) {
            return redirect()->back()->with('error', 'Job seeker must be fully registered first.');
        }

        $resume = $this->resumeService->generateResume($jobSeeker, $admin);

        return redirect()->route('admin.resumes')
            ->with('success', "Resume {$resume->resume_id} generated successfully.");
    }

    public function regenerate(Request $request, Resume $resume)
    {
        $validated = $request->validate([
            'custom_content' => ['nullable', 'array'],
        ]);

        $admin = Auth::user();

        $this->resumeService->regenerateResume($resume, $admin, $validated['custom_content'] ?? null);

        return redirect()->route('admin.resumes')
            ->with('success', "Resume {$resume->resume_id} regenerated successfully.");
    }

    public function download(Resume $resume)
    {
        if (!$resume->file_path || !\Storage::disk('public')->exists($resume->file_path)) {
            return redirect()->route('admin.resumes')->with('error', 'Resume file not found.');
        }

        return response()->download(
            \Storage::disk('public')->path($resume->file_path),
            $resume->resume_id . '_' . str_replace(' ', '_', $resume?->jobSeeker?->full_name ?? 'Resume') . '.pdf'
        );
    }

    public function delete(Resume $resume)
    {
        if ($resume->file_path && \Storage::disk('public')->exists($resume->file_path)) {
            \Storage::disk('public')->delete($resume->file_path);
        }

        $resume->delete();

        return redirect()->route('admin.resumes')
            ->with('success', 'Resume deleted successfully.');
    }

    
}
