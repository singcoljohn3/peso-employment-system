<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminResumeController;
use App\Http\Controllers\AgencyAccountController;
use App\Http\Controllers\ApplicationsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        $role = strtolower((string) Auth::user()->role);
        return match ($role) {
            'admin' => redirect()->route('admin.dashboard'),
            'staff' => redirect()->route('staff.dashboard'),
            'establishment' => redirect()->route('establishment.dashboard'),
            'agency' => redirect()->route('agency.dashboard'),
            'job_seeker' => redirect()->route('jobseeker.dashboard'),
            default => redirect()->route('jobseeker.dashboard'),
        };
    }

    return redirect('/peso-login');
});

Route::get('/peso', function () {
    Auth::logout();
    session()->invalidate();
    session()->regenerateToken();

    return redirect()->route('peso.login');
})->name('peso');

// Route to clear all session data
Route::get('/clear-session', function () {
    session()->flush();
    return "Session cleared. Redirecting to login... <script>setTimeout(() => window.location.href='/peso-login', 2000);</script>";
});

// Debug route to check authentication status
Route::get('/debug-auth', function () {
    return [
        'authenticated' => auth()->check(),
        'user' => auth()->user() ? [
            'id' => auth()->user()->id,
            'name' => auth()->user()->name,
            'email' => auth()->user()->email,
            'role' => auth()->user()->role,
        ] : null,
        'session_id' => session()->getId(),
        'intended_url' => session()->get('url.intended'),
        'all_session_data' => session()->all(),
    ];
});

Route::get('/dashboard', function () {
    $role = strtolower((string) (auth()->user()?->role ?? ''));

    return match ($role) {
        'admin' => redirect()->route('admin.dashboard'),
        'staff' => redirect()->route('staff.dashboard'),
        'establishment' => redirect()->route('establishment.dashboard'),
        'agency' => redirect()->route('agency.dashboard'),
        'job_seeker' => redirect()->route('jobseeker.dashboard'),
        default => redirect()->route('jobseeker.dashboard'),
    };
})->middleware(['auth'])->name('dashboard');

// PESO Admin Routes
Route::get('peso-login', function () {
    if (Auth::check()) {
        $role = strtolower((string) Auth::user()->role);
        return match ($role) {
            'admin' => redirect()->route('admin.dashboard'),
            'staff' => redirect()->route('staff.dashboard'),
            'establishment' => redirect()->route('establishment.dashboard'),
            'agency' => redirect()->route('agency.dashboard'),
            'job_seeker' => redirect()->route('jobseeker.dashboard'),
            default => redirect()->route('jobseeker.dashboard'),
        };
    }

    return app(AdminController::class)->loginCreate();
})->name('peso.login');

Route::middleware('guest')->group(function () {
    Route::post('peso-login', [AdminController::class, 'loginStore']);
});

Route::get('peso-register', function () {
    if (Auth::check()) {
        return redirect()->route('jobseeker.dashboard');
    }
    return app(AdminController::class)->registerCreate();
})->name('peso.register');


Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])
        ->name('admin.dashboard');
    Route::get('/admin/jobseekers', [AdminController::class, 'jobseekers'])
        ->name('admin.jobseekers');
    Route::post('/admin/jobseekers', [AdminController::class, 'storeJobSeeker'])
        ->name('admin.jobseekers.store');
    Route::get('/admin/establishments', [AdminController::class, 'establishments'])
        ->name('admin.establishments');
    Route::post('/admin/establishments', [AdminController::class, 'storeEstablishment'])
        ->name('admin.establishments.store');
    Route::get('/admin/job-vacancies', [AdminController::class, 'jobVacancies'])
        ->name('admin.jobvacancies');
    Route::post('/admin/job-vacancies', [AdminController::class, 'storeJobVacancy'])
        ->name('admin.jobvacancies.store');
    Route::delete('/admin/job-vacancies/{job}', [AdminController::class, 'destroyJobVacancy'])
        ->name('admin.jobvacancies.destroy');
    Route::delete('/admin/establishments/{establishment}', [AdminController::class, 'destroyEstablishment'])
        ->name('admin.establishments.destroy');
    Route::get('/admin/applications', [AdminController::class, 'applications'])
        ->name('admin.applications');
    Route::post('/admin/applications', [AdminController::class, 'storeApplication'])
        ->name('admin.applications.store');

    Route::get('/admin/hiring-statuses', [AdminController::class, 'hiringStatuses'])
        ->name('admin.hiring-statuses');
    Route::post('/admin/hiring-statuses', [AdminController::class, 'storeHiringStatus'])
        ->name('admin.hiring-statuses.store');

    Route::get('/admin/map', [AdminController::class, 'map'])
        ->name('admin.map');
    Route::get('/admin/gis-map', [AdminController::class, 'gisMap'])
        ->name('admin.gismap');

    Route::get('/admin/user-management', [AdminController::class, 'userManagement'])
        ->name('admin.user-management');
    Route::post('/admin/user-management', [AdminController::class, 'storeUserAccount'])
        ->name('admin.user-management.store');
    Route::put('/admin/user-management/{user}/deactivate', [AdminController::class, 'deactivateUser'])
        ->name('admin.user-management.deactivate');

    Route::get('/admin/hiring-establishments', [AdminController::class, 'hiringEstablishments'])
        ->name('admin.hiring-establishments');

    // Agency Accounts (registration approval workflow)
    Route::get('/admin/agencies', [AgencyAccountController::class, 'index'])
        ->name('admin.agencies');
    Route::get('/admin/agencies/{agency}', [AgencyAccountController::class, 'show'])
        ->name('admin.agencies.show');
    Route::post('/admin/agencies/{agency}/approve', [AgencyAccountController::class, 'approve'])
        ->name('admin.agencies.approve');
    Route::post('/admin/agencies/{agency}/reject', [AgencyAccountController::class, 'reject'])
        ->name('admin.agencies.reject');

    // Approve/Reject routes
    Route::post('/admin/jobseekers/{jobSeeker}/approve', [AdminController::class, 'approveJobSeeker'])
        ->name('admin.jobseekers.approve');
    Route::post('/admin/jobseekers/{jobSeeker}/reject', [AdminController::class, 'rejectJobSeeker'])
        ->name('admin.jobseekers.reject');

    // Suspend routes
    Route::post('/admin/jobseekers/{jobSeeker}/suspend', [AdminController::class, 'suspendJobSeeker'])
        ->name('admin.jobseekers.suspend');
    Route::post('/admin/establishments/{establishment}/suspend', [AdminController::class, 'suspendEstablishment'])
        ->name('admin.establishments.suspend');

    // Reports Routes
    Route::get('/admin/reports', [ReportsController::class, 'index'])
        ->name('admin.reports');
    Route::get('/api/reports/data', [ReportsController::class, 'getReportsData']);
    Route::get('/api/reports/statistics', [ReportsController::class, 'getStatistics']);
    Route::get('/api/reports/monthly-applications', [ReportsController::class, 'getMonthlyApplications']);
    Route::get('/api/reports/hiring-distribution', [ReportsController::class, 'getHiringStatusDistribution']);
    Route::get('/api/reports/employment-growth', [ReportsController::class, 'getEmploymentGrowth']);
    Route::get('/api/reports/filter', [ReportsController::class, 'getFilteredReports']);
    Route::get('/api/reports/export/pdf', [ReportsController::class, 'exportPdf']);
    Route::get('/api/reports/export/excel', [ReportsController::class, 'exportExcel']);
    Route::get('/api/reports/export/csv', [ReportsController::class, 'exportCsv']);
    Route::post('/api/reports/generate', [ReportsController::class, 'generateReport']);

    // New Analytics Routes
    Route::get('/api/reports/monthly-job-seekers', [ReportsController::class, 'getMonthlyJobSeekers']);
    Route::get('/api/reports/monthly-establishments', [ReportsController::class, 'getMonthlyEstablishments']);
    Route::get('/api/reports/top-establishments', [ReportsController::class, 'getTopHiringEstablishments']);
    Route::get('/api/reports/top-jobs', [ReportsController::class, 'getTopAppliedJobs']);
    Route::get('/api/reports/barangay-distribution', [ReportsController::class, 'getBarangayEmploymentDistribution']);
    Route::get('/api/reports/top-skills', [ReportsController::class, 'getMostRequestedSkills']);
    Route::get('/api/reports/top-categories', [ReportsController::class, 'getMostInDemandCategories']);
    Route::get('/api/reports/average-hiring-time', [ReportsController::class, 'getAverageHiringTime']);
    Route::get('/api/reports/recent-activities', [ReportsController::class, 'getRecentActivities']);
    Route::get('/api/reports/system-monitoring', [ReportsController::class, 'getSystemMonitoring']);
    Route::get('/api/reports/application-trend', [ReportsController::class, 'getApplicationTrend']);
    Route::get('/api/reports/employment-success-rate', [ReportsController::class, 'getEmploymentSuccessRate']);

    // Report Table Routes
    Route::get('/api/reports/table/job-seekers', [ReportsController::class, 'getJobSeekersReport']);
    Route::get('/api/reports/table/establishments', [ReportsController::class, 'getEstablishmentsReport']);
    Route::get('/api/reports/table/job-vacancies', [ReportsController::class, 'getJobVacanciesReport']);
    Route::get('/api/reports/table/applications', [ReportsController::class, 'getApplicationsReport']);
    Route::get('/api/reports/table/hiring-status', [ReportsController::class, 'getHiringStatusReport']);
    Route::get('/api/reports/table/employment-statistics', [ReportsController::class, 'getEmploymentStatisticsReport']);
    Route::get('/api/reports/table/barangay-employment', [ReportsController::class, 'getBarangayEmploymentReport']);
    Route::get('/api/reports/table/resume-generation', [ReportsController::class, 'getResumeGenerationReport']);

    // Additional API routes for filters
    Route::get('/api/barangays', function () {
        return response()->json(\App\Models\Barangay::orderBy('barangay_name')->get());
    });
    Route::get('/api/establishments', function () {
        return response()->json(\App\Models\Establishment::orderBy('company_name')->get());
    });



    // Establishment Locations API (session-based auth for admin dashboard)
    // Note: api.php already registers these under auth:sanctum for mobile

    // GIS Module API
    Route::get('/api/gis/data', [\App\Http\Controllers\Api\GisDataController::class, 'index']);
    Route::get('/api/gis/barangay-stats', [\App\Http\Controllers\Api\GisDataController::class, 'barangayStats']);
    Route::get('/api/gis/establishments/{id}', [\App\Http\Controllers\Api\GisDataController::class, 'establishmentDetail']);
    Route::get('/api/gis/heatmap', [\App\Http\Controllers\Api\GisDataController::class, 'heatmapData']);

    // Resume Management
    Route::get('/admin/resumes', [AdminResumeController::class, 'index'])
        ->name('admin.resumes');
    Route::post('/admin/resumes/generate', [AdminResumeController::class, 'generate'])
        ->name('admin.resumes.generate');
    Route::post('/admin/resumes/bulk-generate', [AdminResumeController::class, 'bulkGenerate'])
        ->name('admin.resumes.bulk-generate');
    Route::post('/admin/resumes/{resume}/regenerate', [AdminResumeController::class, 'regenerate'])
        ->name('admin.resumes.regenerate');
    Route::get('/admin/resumes/{resume}/download', [AdminResumeController::class, 'download'])
        ->name('admin.resumes.download');
    Route::delete('/admin/resumes/{resume}', [AdminResumeController::class, 'delete'])
        ->name('admin.resumes.delete');
    Route::get('/admin/resumes/validate-fields', [AdminResumeController::class, 'validateFields'])
        ->name('admin.resumes.validate-fields');
    Route::get('/admin/resumes/preview', [AdminResumeController::class, 'preview'])
        ->name('admin.resumes.preview');
    Route::get('/admin/resumes/logs', [AdminResumeController::class, 'logs'])
        ->name('admin.resumes.logs');

    // Applications Management Routes
    Route::get('/admin/applications-management', [ApplicationsController::class, 'index'])
        ->name('admin.applications-management');
    Route::get('/admin/applications/{id}', [ApplicationsController::class, 'show'])
        ->name('admin.applications.show');
    Route::put('/admin/applications/{id}/status', [ApplicationsController::class, 'updateStatus'])
        ->name('admin.applications.update-status');
    Route::get('/admin/applications/{id}/download-resume', [ApplicationsController::class, 'downloadResume'])
        ->name('admin.applications.download-resume');
    Route::delete('/admin/applications/{id}', [ApplicationsController::class, 'destroy'])
        ->name('admin.applications.destroy');
});

// Notification API (session-based auth for all authenticated web users)
Route::middleware(['auth'])->group(function () {
    Route::get('/api/notifications', function () {
        $user = Auth::user();
        $rows = \Illuminate\Support\Facades\DB::table('notifications')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($n) {
                $data = $n->data ? json_decode($n->data, true) : [];
                return [
                    'id' => $n->id,
                    'type' => $n->type,
                    'title' => $data['title'] ?? $n->type,
                    'message' => $data['message'] ?? '',
                    'data' => $data,
                    'read_at' => $n->read_at,
                    'created_at' => $n->created_at,
                ];
            });
        $unreadCount = \Illuminate\Support\Facades\DB::table('notifications')
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();
        return response()->json([
            'notifications' => $rows,
            'unread_count' => $unreadCount,
        ]);
    });
    Route::post('/api/notifications/{id}/read', function ($id) {
        $user = Auth::user();
        \Illuminate\Support\Facades\DB::table('notifications')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->update(['read_at' => now()]);
        return response()->json(['message' => 'Notification marked as read.']);
    });
    Route::post('/api/notifications/read-all', function () {
        $user = Auth::user();
        \Illuminate\Support\Facades\DB::table('notifications')
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
        return response()->json(['message' => 'All notifications marked as read.']);
    });
});

Route::middleware(['auth', 'staff'])->group(function () {
    Route::get('/staff/dashboard', function () {
        return Inertia::render('Staff/Dashboard');
    })->name('staff.dashboard');
});

// Establishment Authentication Routes
Route::get('establishment/login', function () {
    if (Auth::check()) {
        $role = strtolower((string) Auth::user()->role);
        if ($role === 'establishment') {
            return redirect()->route('establishment.dashboard');
        }
        Auth::logout();
        session()->invalidate();
        session()->regenerateToken();
    }

    return app(App\Http\Controllers\EstablishmentController::class)->loginCreate();
})->name('establishment.login');

Route::middleware('guest')->group(function () {
    Route::post('establishment/login', [App\Http\Controllers\EstablishmentController::class, 'loginStore']);
});

Route::middleware(['auth', 'establishment'])->group(function () {
    Route::get('/establishment/dashboard', [App\Http\Controllers\EstablishmentController::class, 'dashboard'])
        ->name('establishment.dashboard');
    Route::get('/establishment/jobs', [App\Http\Controllers\EstablishmentController::class, 'jobs'])
        ->name('establishment.jobs');
    Route::post('/establishment/jobs', [App\Http\Controllers\EstablishmentController::class, 'storeJob'])
        ->name('establishment.jobs.store');
    Route::put('/establishment/jobs/{job}', [App\Http\Controllers\EstablishmentController::class, 'updateJob'])
        ->name('establishment.jobs.update');
    Route::delete('/establishment/jobs/{job}', [App\Http\Controllers\EstablishmentController::class, 'deleteJob'])
        ->name('establishment.jobs.delete');
    Route::post('/establishment/jobs/{job}/status', [App\Http\Controllers\EstablishmentController::class, 'updateJobStatus'])
        ->name('establishment.jobs.status');
    Route::get('/establishment/applicants', [App\Http\Controllers\EstablishmentController::class, 'applicants'])
        ->name('establishment.applicants');
    Route::put('/establishment/applicants/{application}', [App\Http\Controllers\EstablishmentController::class, 'updateApplication'])
        ->name('establishment.applicants.update');
    Route::post('/establishment/applicants/{application}/schedule-interview', [App\Http\Controllers\EstablishmentController::class, 'scheduleInterview'])
        ->name('establishment.applicants.schedule-interview');
    Route::get('/establishment/applicants/{application}/resume-preview', [App\Http\Controllers\EstablishmentController::class, 'resumePreview'])
        ->name('establishment.applicants.resume-preview');
    Route::get('/establishment/hiring-status', [App\Http\Controllers\EstablishmentController::class, 'hiringStatus'])
        ->name('establishment.hiring-status');
    Route::get('/establishment/reports', [App\Http\Controllers\EstablishmentController::class, 'reports'])
        ->name('establishment.reports');
    Route::get('/establishment/reports/export/pdf', [App\Http\Controllers\EstablishmentController::class, 'exportPdf'])
        ->name('establishment.reports.export.pdf');
    Route::get('/establishment/reports/export/excel', [App\Http\Controllers\EstablishmentController::class, 'exportExcel'])
        ->name('establishment.reports.export.excel');
    Route::get('/establishment/notifications', [App\Http\Controllers\EstablishmentController::class, 'notifications'])
        ->name('establishment.notifications');
    Route::get('/establishment/settings', [App\Http\Controllers\EstablishmentController::class, 'settings'])
        ->name('establishment.settings');
    Route::put('/establishment/settings/password', [App\Http\Controllers\EstablishmentController::class, 'updatePassword'])
        ->name('establishment.settings.password');
    Route::get('/establishment/profile', [App\Http\Controllers\EstablishmentController::class, 'profile'])
        ->name('establishment.profile');
    Route::put('/establishment/profile', [App\Http\Controllers\EstablishmentController::class, 'updateProfile'])
        ->name('establishment.profile.update');
    Route::post('/establishment/profile/logo', [App\Http\Controllers\EstablishmentController::class, 'uploadLogo'])
        ->name('establishment.profile.logo');
    Route::delete('/establishment/profile/logo', [App\Http\Controllers\EstablishmentController::class, 'removeLogo'])
        ->name('establishment.profile.logo.remove');
    Route::post('/establishment/logout', [App\Http\Controllers\EstablishmentController::class, 'logout'])
        ->name('establishment.logout');
});

// ═══════════════════════════════════════════════════════════════
// AGENCY PORTAL
// ═══════════════════════════════════════════════════════════════
Route::middleware('guest')->group(function () {
    // Agency Account Creation moved to Admin -> User Management
    // Route::get('/agency/register', [App\Http\Controllers\AgencyController::class, 'registerCreate'])
    //     ->name('agency.register');
    // Route::post('/agency/register', [App\Http\Controllers\AgencyController::class, 'registerStore'])
    //     ->middleware('throttle:10,1')
    //     ->name('agency.register.store');
    Route::get('/agency/login', [App\Http\Controllers\AgencyController::class, 'loginCreate'])
        ->name('agency.login');
    Route::post('/agency/login', [App\Http\Controllers\AgencyController::class, 'loginStore'])
        ->middleware('throttle:5,1')
        ->name('agency.login.store');
});

Route::middleware(['auth', 'agency'])->prefix('agency')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\AgencyController::class, 'dashboard'])
        ->name('agency.dashboard');
    Route::get('/profile', [App\Http\Controllers\AgencyController::class, 'profile'])
        ->name('agency.profile');
    Route::put('/profile', [App\Http\Controllers\AgencyController::class, 'updateProfile'])
        ->name('agency.profile.update');
    Route::post('/profile/logo', [App\Http\Controllers\AgencyController::class, 'uploadLogo'])
        ->name('agency.profile.logo');
    Route::delete('/profile/logo', [App\Http\Controllers\AgencyController::class, 'removeLogo'])
        ->name('agency.profile.logo.remove');
    Route::get('/jobs', [App\Http\Controllers\AgencyController::class, 'jobs'])
        ->name('agency.jobs');
    Route::post('/jobs', [App\Http\Controllers\AgencyController::class, 'storeJob'])
        ->name('agency.jobs.store');
    Route::put('/jobs/{job}', [App\Http\Controllers\AgencyController::class, 'updateJob'])
        ->name('agency.jobs.update');
    Route::delete('/jobs/{job}', [App\Http\Controllers\AgencyController::class, 'deleteJob'])
        ->name('agency.jobs.delete');
    Route::post('/jobs/{job}/apply', [App\Http\Controllers\AgencyController::class, 'applyJob'])
        ->name('agency.jobs.apply');
    Route::patch('/jobs/{job}/status', [App\Http\Controllers\AgencyController::class, 'updateJobStatus'])
        ->name('agency.jobs.status');
    Route::get('/applicants', [App\Http\Controllers\AgencyController::class, 'applicants'])
        ->name('agency.applicants');
    Route::patch('/applicants/{application}', [App\Http\Controllers\AgencyController::class, 'updateApplication'])
        ->name('agency.applicants.update');
    Route::post('/applicants/{application}/schedule-interview', [App\Http\Controllers\AgencyController::class, 'scheduleInterview'])
        ->name('agency.applicants.schedule-interview');
    Route::get('/applicants/{application}/resume-preview', [App\Http\Controllers\AgencyController::class, 'resumePreview'])
        ->name('agency.applicants.resume-preview');
    Route::get('/members', [App\Http\Controllers\AgencyController::class, 'members'])
        ->name('agency.members');
    Route::post('/members', [App\Http\Controllers\AgencyController::class, 'storeMember'])
        ->name('agency.members.store');
    Route::patch('/members/{jobSeeker}', [App\Http\Controllers\AgencyController::class, 'updateMember'])
        ->name('agency.members.update');
    Route::patch('/members/{jobSeeker}/status', [App\Http\Controllers\AgencyController::class, 'updateMemberStatus'])
        ->name('agency.members.status');
    Route::get('/members/{jobSeeker}/resume', [App\Http\Controllers\AgencyController::class, 'memberResumeDownload'])
        ->name('agency.members.resume');
    Route::get('/members/{jobSeeker}/resume-builder', [App\Http\Controllers\AgencyController::class, 'memberResumeBuilder'])
        ->name('agency.members.resume-builder');
    Route::put('/members/{jobSeeker}/resume-builder', [App\Http\Controllers\AgencyController::class, 'saveMemberResume'])
        ->name('agency.members.resume-builder.save');
    Route::post('/members/{jobSeeker}/resume-preview', [App\Http\Controllers\AgencyController::class, 'memberResumeLivePreview'])
        ->name('agency.members.resume-preview');
    Route::post('/members/{jobSeeker}/resume/photo', [App\Http\Controllers\AgencyController::class, 'updateMemberResumePhoto'])
        ->name('agency.members.resume-photo');
    Route::get('/hiring-status', [App\Http\Controllers\AgencyController::class, 'hiringStatus'])
        ->name('agency.hiring-status');
    Route::get('/reports', [App\Http\Controllers\AgencyController::class, 'reports'])
        ->name('agency.reports');
    Route::get('/reports/pdf', [App\Http\Controllers\AgencyController::class, 'exportReport'])
        ->name('agency.reports.pdf');
    Route::get('/notifications', [App\Http\Controllers\AgencyController::class, 'notifications'])
        ->name('agency.notifications');
    Route::get('/settings', [App\Http\Controllers\AgencyController::class, 'settings'])
        ->name('agency.settings');
    Route::put('/settings/password', [App\Http\Controllers\AgencyController::class, 'updatePassword'])
        ->name('agency.settings.password');
    Route::post('/logout', [App\Http\Controllers\AgencyController::class, 'logout'])
        ->name('agency.logout');
});

Route::middleware(['auth', 'job_seeker'])->group(function () {
    Route::get('/jobseeker/dashboard', function () {
        return Inertia::render('JobSeeker/Dashboard');
    })->name('jobseeker.dashboard');

    Route::get('/jobseeker/resume', function () {
        $user = Auth::user();
        $jobSeeker = \App\Models\JobSeeker::with(['barangay'])->where('user_id', $user->id)->first();

        if (!$jobSeeker) {
            return redirect()->route('jobseeker.dashboard')->with('error', 'Please complete your profile first.');
        }

        $resume = \App\Models\Resume::where('job_seeker_id', $jobSeeker->id)->first();

        if ($resume) {
            $resume->load('generatedBy');
            $resume->append('download_url');
        }

        $templates = [];
        foreach (\App\Services\ResumeService::TEMPLATES as $key => $label) {
            $templates[] = ['key' => $key, 'label' => $label];
        }

        return Inertia::render('JobSeeker/Resume', [
            'resume' => $resume,
            'seekerData' => $jobSeeker,
            'templates' => $templates,
            'templateKeys' => array_keys(\App\Services\ResumeService::TEMPLATES),
        ]);
    })->name('jobseeker.resume');

    Route::get('/jobseeker/map', function () {
        $user = Auth::user();
        $jobSeeker = \App\Models\JobSeeker::where('user_id', $user->id)->first();
        return Inertia::render('JobSeeker/JobMap', [
            'seekerData' => $jobSeeker,
        ]);
    })->name('jobseeker.map');

    // Job Seeker Map API (session-based auth)
    Route::get('/api/job-seeker/map-data', [\App\Http\Controllers\Api\JobSeekerMapController::class, 'index']);
    Route::get('/api/job-seeker/establishments/{id}', [\App\Http\Controllers\Api\JobSeekerMapController::class, 'show']);
    Route::post('/api/job-seeker/establishments/{id}/toggle-save', [\App\Http\Controllers\Api\JobSeekerMapController::class, 'toggleSave']);
    Route::get('/api/job-seeker/saved-list', [\App\Http\Controllers\Api\JobSeekerMapController::class, 'savedList']);
    Route::get('/api/job-seeker/recently-viewed', [\App\Http\Controllers\Api\JobSeekerMapController::class, 'recentlyViewed']);
    Route::get('/api/job-seeker/recommendations', [\App\Http\Controllers\Api\JobSeekerMapController::class, 'recommendations']);
    Route::get('/api/job-seeker/barangay-stats', [\App\Http\Controllers\Api\JobSeekerMapController::class, 'barangayStats']);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
