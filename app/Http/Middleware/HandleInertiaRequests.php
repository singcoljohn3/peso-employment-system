<?php

namespace App\Http\Middleware;

use App\Models\Agency;
use App\Models\Establishment;
use App\Services\AgencyApprovalService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $establishment = null;
        $pendingAgencyCount = 0;

        if ($user && strtolower((string) ($user->role ?? '')) === 'establishment') {
            $establishment = Establishment::with('barangay')
                ->where('user_id', $user->id)
                ->first();
        }

        // Shared on every admin page so the sidebar can show the size of the
        // agency review queue without each page passing it down.
        if ($user && in_array(strtolower((string) ($user->role ?? '')), ['admin', 'staff'], true)) {
            $pendingAgencyCount = Agency::where('status', AgencyApprovalService::STATUS_PENDING)->count();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'establishment' => $establishment,
            'pendingAgencyCount' => $pendingAgencyCount,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
