<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Job;
use App\Models\JobSeeker;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ApplicationsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Application::with(['jobSeeker', 'job', 'job.establishment', 'establishment']);

        // Role-based filtering
        if ($user->role === 'Establishment') {
            $establishment = $user->establishment;
            if ($establishment) {
                $query->where('establishment_id', $establishment->id);
            }
        }

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by establishment (admin only)
        if ($user->role === 'admin' && $request->has('establishment_id') && $request->establishment_id !== '') {
            $query->where('establishment_id', $request->establishment_id);
        }

        // Filter by job title
        if ($request->has('job_id') && $request->job_id !== '') {
            $query->where('job_id', $request->job_id);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from !== '') {
            $query->where('applied_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to !== '') {
            $query->where('applied_at', '<=', $request->date_to);
        }

        // Search by applicant name
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->whereHas('jobSeeker', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        $applications = $query->orderBy('applied_at', 'desc')->paginate(15);

        // Get statistics
        $statistics = [
            'total' => Application::when($user->role === 'Establishment', function ($q) use ($user) {
                $establishment = $user->establishment;
                if ($establishment) {
                    $q->where('establishment_id', $establishment->id);
                }
            })->count(),
            'pending' => Application::when($user->role === 'Establishment', function ($q) use ($user) {
                $establishment = $user->establishment;
                if ($establishment) {
                    $q->where('establishment_id', $establishment->id);
                }
            })->where('status', 'pending')->count(),
            'reviewed' => Application::when($user->role === 'Establishment', function ($q) use ($user) {
                $establishment = $user->establishment;
                if ($establishment) {
                    $q->where('establishment_id', $establishment->id);
                }
            })->where('status', 'reviewed')->count(),
            'shortlisted' => Application::when($user->role === 'Establishment', function ($q) use ($user) {
                $establishment = $user->establishment;
                if ($establishment) {
                    $q->where('establishment_id', $establishment->id);
                }
            })->where('status', 'shortlisted')->count(),
            'interview_scheduled' => Application::when($user->role === 'Establishment', function ($q) use ($user) {
                $establishment = $user->establishment;
                if ($establishment) {
                    $q->where('establishment_id', $establishment->id);
                }
            })->where('status', 'interview_scheduled')->count(),
            'hired' => Application::when($user->role === 'Establishment', function ($q) use ($user) {
                $establishment = $user->establishment;
                if ($establishment) {
                    $q->where('establishment_id', $establishment->id);
                }
            })->where('status', 'hired')->count(),
            'rejected' => Application::when($user->role === 'Establishment', function ($q) use ($user) {
                $establishment = $user->establishment;
                if ($establishment) {
                    $q->where('establishment_id', $establishment->id);
                }
            })->where('status', 'rejected')->count(),
        ];

        // Get filter options
        $establishments = $user->role === 'admin' ? \App\Models\Establishment::all() : [];
        $jobs = $user->role === 'Establishment' 
            ? Job::where('establishment_id', $user->establishment?->id)->get() 
            : Job::all();

        return Inertia::render('Admin/Applications', [
            'applications' => $applications,
            'statistics' => $statistics,
            'establishments' => $establishments,
            'jobs' => $jobs,
            'filters' => $request->only(['status', 'establishment_id', 'job_id', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function show($id)
    {
        $user = Auth::user();
        $application = Application::with(['jobSeeker', 'job', 'job.establishment', 'establishment'])
            ->findOrFail($id);

        // Role-based access control
        if ($user->role === 'Establishment') {
            $establishment = $user->establishment;
            if ($establishment && $application->establishment_id !== $establishment->id) {
                abort(403, 'You are not authorized to view this application.');
            }
        }

        return Inertia::render('Admin/ApplicationDetails', [
            'application' => $application,
        ]);
    }

    public function updateStatus(Request $request, $id): RedirectResponse
    {
        $user = Auth::user();
        $application = Application::findOrFail($id);

        // Role-based access control
        if ($user->role === 'Establishment') {
            $establishment = $user->establishment;
            if ($establishment && $application->establishment_id !== $establishment->id) {
                abort(403, 'You are not authorized to update this application.');
            }
        }

        $validated = $request->validate([
            'status' => ['required', 'in:pending,reviewed,shortlisted,interview_scheduled,hired,rejected'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $application->update([
            'status' => $validated['status'],
            'remarks' => $validated['remarks'] ?? $application->remarks,
        ]);

        return back()->with('success', 'Application status updated successfully.');
    }

    public function downloadResume($id)
    {
        $user = Auth::user();
        $application = Application::findOrFail($id);

        // Role-based access control
        if ($user->role === 'Establishment') {
            $establishment = $user->establishment;
            if ($establishment && $application->establishment_id !== $establishment->id) {
                abort(403, 'You are not authorized to download this resume.');
            }
        }

        if (!$application->resume) {
            abort(404, 'Resume not found.');
        }

        $filePath = storage_path('app/public/' . $application->resume);
        if (!file_exists($filePath)) {
            abort(404, 'File not found.');
        }

        return response()->download($filePath, $application->jobSeeker->first_name . '_' . $application->jobSeeker->last_name . '_resume.pdf');
    }

    public function destroy($id): RedirectResponse
    {
        $user = Auth::user();
        $application = Application::findOrFail($id);

        // Role-based access control
        if ($user->role === 'Establishment') {
            $establishment = $user->establishment;
            if ($establishment && $application->establishment_id !== $establishment->id) {
                abort(403, 'You are not authorized to delete this application.');
            }
        }

        // Delete resume file if exists
        if ($application->resume) {
            Storage::disk('public')->delete($application->resume);
        }

        $application->delete();

        return back()->with('success', 'Application deleted successfully.');
    }
}
