<?php

namespace App\Http\Middleware;

use App\Models\Agency;
use App\Services\AgencyApprovalService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAgency
{
    public function __construct(
        private readonly AgencyApprovalService $approval,
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return redirect()->route('agency.login');
        }

        $role = strtolower((string) (Auth::user()->role ?? ''));

        if ($role !== 'agency') {
            return $this->logout($request, 'Access denied. Agency privileges required.');
        }

        // Only an explicitly disabled account is deactivated. The value can be
        // null on a partially hydrated model, which must not lock anyone out.
        if (Auth::user()->is_active === false) {
            return $this->logout($request, 'Your account has been deactivated. Please contact the administrator.');
        }

        // Re-read the status on every request so an admin approval takes effect
        // immediately, and so a rejected agency cannot keep using an existing
        // session or reach a portal URL directly.
        $status = Agency::where('user_id', Auth::id())->value('status');
        $message = $this->approval->blockReason($status);

        if ($message !== null) {
            return $this->logout($request, $message);
        }

        return $next($request);
    }

    private function logout(Request $request, string $message): Response
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('agency.login')->with('status', $message);
    }
}
