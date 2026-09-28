<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Job;
use App\Models\JobSeeker;
use App\Notifications\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $jobSeeker = JobSeeker::where('user_id', $user->id)->first();

        if (!$jobSeeker) {
            return response()->json(['message' => 'Job seeker profile not found.'], 404);
        }

        $applications = Application::with(['job.establishment', 'job.skills', 'interview'])
            ->where('job_seeker_id', $jobSeeker->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($applications);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_id' => ['required', 'exists:job,id'],
            'application_details' => ['nullable', 'string', 'max:1000'],
            'expected_salary' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'string', 'max:255'],
        ]);

        $user = Auth::user();
        $jobSeeker = JobSeeker::where('user_id', $user->id)->first();

        if (!$jobSeeker) {
            return response()->json(['message' => 'Please complete your profile first.'], 400);
        }

        $job = Job::findOrFail($validated['job_id']);

        $existingApplication = Application::where('job_seeker_id', $jobSeeker->id)
            ->where('job_id', $job->id)
            ->first();

        if ($existingApplication) {
            return response()->json([
                'message' => 'You have already applied for this job.',
                'application' => $existingApplication,
            ], 409);
        }

        $application = Application::create([
            'job_seeker_id' => $jobSeeker->id,
            'job_id' => $job->id,
            'establishment_id' => $job->establishment_id,
            'status' => 'pending',
            'applied_at' => now(),
            'application_details' => $validated['application_details'] ?? null,
            'expected_salary' => $validated['expected_salary'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
        ]);

        try {
            NotificationService::sendNewApplication($application);
        } catch (\Exception $e) {
            // Non-critical
        }

        return response()->json([
            'message' => 'Application submitted successfully.',
            'application' => $application->load(['job.establishment']),
        ], 201);
    }
}
