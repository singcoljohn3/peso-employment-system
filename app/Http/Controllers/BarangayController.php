<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Barangay;
use App\Models\Job;
use App\Models\JobSeeker;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BarangayController extends Controller
{
    private function resolveBarangayForCurrentUser(): ?Barangay
    {
        $userId = Auth::id();
        $userEmail = Auth::user()?->email;

        $barangay = Barangay::where('user_id', $userId)->first();

        if ($barangay) {
            return $barangay;
        }

        if (!$userEmail) {
            return null;
        }

        $barangayByEmail = Barangay::whereRaw('LOWER(contact_email) = ?', [strtolower((string) $userEmail)])
            ->first();

        if ($barangayByEmail && $userId) {
            $barangayByEmail->update(['user_id' => $userId]);
            $barangayByEmail->refresh();
        }

        return $barangayByEmail;
    }

    /**
     * Display the barangay login view.
     */
    public function loginCreate(): Response
    {
        return Inertia::render('Barangay/BarangayLogin', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle barangay authentication request.
     */
    public function loginStore(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // Check if user is barangay
            $role = (string) (Auth::user()->role ?? '');

            if ($role === 'baranggay') {
                return redirect()->intended(route('barangay.dashboard', absolute: false));
            }

            // If not barangay, logout and redirect
            Auth::logout();
            session()->invalidate();
            session()->regenerateToken();
            
            return back()->withErrors([
                'email' => 'This account is not registered as a barangay officer.',
            ]);
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    /**
     * Display the barangay dashboard.
     */
    public function dashboard(): Response
    {
        $barangay = $this->resolveBarangayForCurrentUser();
        
        // Get statistics
        $totalJobSeekers = JobSeeker::where('barangay_id', $barangay?->id)->count() ?? 0;
        $totalApplications = Application::whereHas('jobSeeker', function ($query) use ($barangay) {
            $query->where('barangay_id', $barangay?->id);
        })->count() ?? 0;
        $activeJobs = Job::where('barangay_id', $barangay?->id)->count() ?? 0;
        
        // Get recent job seekers
        $recentJobSeekers = JobSeeker::where('barangay_id', $barangay?->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Get recent applications
        $recentApplications = Application::with(['jobSeeker', 'job'])
            ->whereHas('jobSeeker', function ($query) use ($barangay) {
                $query->where('barangay_id', $barangay?->id);
            })
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Barangay/Dashboard', [
            'barangay' => $barangay,
            'statistics' => [
                'totalJobSeekers' => $totalJobSeekers,
                'totalApplications' => $totalApplications,
                'activeJobs' => $activeJobs,
            ],
            'recentJobSeekers' => $recentJobSeekers,
            'recentApplications' => $recentApplications,
        ]);
    }

    /**
     * Display the job seekers management page.
     */
    public function jobSeekers(): Response
    {
        $barangay = $this->resolveBarangayForCurrentUser();

        $jobSeekers = JobSeeker::where('barangay_id', $barangay?->id)
            ->with(['applications.job'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Barangay/JobSeekers', [
            'jobSeekers' => $jobSeekers,
            'barangay' => $barangay,
        ]);
    }

    /**
     * Display the residents management page.
     */
    public function residents(): Response
    {
        $barangay = $this->resolveBarangayForCurrentUser();

        $residents = JobSeeker::where('barangay_id', $barangay?->id)
            ->orderBy('last_name', 'asc')
            ->paginate(10);

        return Inertia::render('Barangay/Residents', [
            'residents' => $residents,
            'barangay' => $barangay,
        ]);
    }

    /**
     * Display the job referrals page.
     */
    public function jobReferrals(): Response
    {
        $barangay = $this->resolveBarangayForCurrentUser();

        $applications = Application::with(['jobSeeker', 'job.establishment'])
            ->whereHas('jobSeeker', function ($query) use ($barangay) {
                $query->where('barangay_id', $barangay?->id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Barangay/JobReferrals', [
            'applications' => $applications,
            'barangay' => $barangay,
        ]);
    }

    /**
     * Display the local job vacancies page.
     */
    public function localJobs(): Response
    {
        $barangay = $this->resolveBarangayForCurrentUser();

        $jobs = Job::with(['establishment', 'skills', 'applications'])
            ->where('barangay_id', $barangay?->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Barangay/LocalJobs', [
            'jobs' => $jobs,
            'barangay' => $barangay,
        ]);
    }

    /**
     * Display the barangay reports page.
     */
    public function reports(): Response
    {
        $barangay = $this->resolveBarangayForCurrentUser();

        // Get statistics for reports
        $totalJobSeekers = JobSeeker::where('barangay_id', $barangay?->id)->count() ?? 0;
        $totalApplications = Application::whereHas('jobSeeker', function ($query) use ($barangay) {
            $query->where('barangay_id', $barangay?->id);
        })->count() ?? 0;
        $hiredCount = Application::whereHas('jobSeeker', function ($query) use ($barangay) {
            $query->where('barangay_id', $barangay?->id);
        })->where('status', 'hired')->count() ?? 0;

        return Inertia::render('Barangay/Reports', [
            'barangay' => $barangay,
            'statistics' => [
                'totalJobSeekers' => $totalJobSeekers,
                'totalApplications' => $totalApplications,
                'hiredCount' => $hiredCount,
            ],
        ]);
    }

    /**
     * Display the notifications page.
     */
    public function notifications(): Response
    {
        $barangay = $this->resolveBarangayForCurrentUser();

        return Inertia::render('Barangay/Notifications', [
            'barangay' => $barangay,
        ]);
    }

    /**
     * Display the announcements page.
     */
    public function announcements(): Response
    {
        $barangay = $this->resolveBarangayForCurrentUser();

        return Inertia::render('Barangay/Announcements', [
            'barangay' => $barangay,
        ]);
    }

    /**
     * Display the barangay profile page.
     */
    public function profile(): Response
    {
        $barangay = $this->resolveBarangayForCurrentUser();

        return Inertia::render('Barangay/Profile', [
            'barangay' => $barangay,
        ]);
    }

    /**
     * Update barangay profile.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $barangay = $this->resolveBarangayForCurrentUser();
        
        if (!$barangay) {
            abort(403, 'Barangay profile not found.');
        }

        $validated = $request->validate([
            'barangay_name' => ['required', 'string', 'max:255'],
            'municipality' => ['required', 'string', 'max:255'],
            'contact_person' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:20'],
            'contact_email' => ['required', 'email', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('barangays/logos', 'public');
            $validated['logo'] = $path;
        }

        $barangay->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Display the settings page.
     */
    public function settings(): Response
    {
        $barangay = $this->resolveBarangayForCurrentUser();

        return Inertia::render('Barangay/Settings', [
            'barangay' => $barangay,
        ]);
    }

    /**
     * Handle barangay logout.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('barangay.login');
    }
}
