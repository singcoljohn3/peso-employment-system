<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Services\AgencyApprovalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PESO Admin management of agency registrations.
 *
 * Every action lives behind the existing `auth` + `admin` middleware, so only
 * a PESO admin/staff account can read or change an agency's approval status.
 */
class AgencyAccountController extends Controller
{
    public function __construct(
        private readonly AgencyApprovalService $approval,
    ) {
    }

    /**
     * The agency review queue: every registered agency with its submitted
     * information, filterable by status and searchable by name, email, permit
     * number or contact person.
     */
    public function index(Request $request): Response
    {
        $status = (string) $request->query('status', 'all');
        $search = trim((string) $request->query('search', ''));

        $agencies = Agency::query()
            ->with(['user:id,name,email,is_active', 'barangay:id,barangay_name', 'reviewer:id,name'])
            ->when(
                in_array($status, AgencyApprovalService::STATUSES, true),
                fn ($query) => $query->where('status', $status)
            )
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $like = '%' . $search . '%';
                    $query->where('agency_name', 'like', $like)
                        ->orWhere('email', 'like', $like)
                        ->orWhere('license_number', 'like', $like)
                        ->orWhere('contact_person', 'like', $like)
                        ->orWhere('contact_number', 'like', $like);
                });
            })
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Agencies', [
            'agencies' => $agencies,
            'counts' => $this->approval->counts(),
            'filters' => [
                'status' => in_array($status, AgencyApprovalService::STATUSES, true) || $status === 'all' ? $status : 'all',
                'search' => $search,
            ],
        ]);
    }

    /**
     * Full submitted information for a single agency.
     */
    public function show(Agency $agency): Response
    {
        $agency->load([
            'user:id,name,email,is_active,created_at',
            'barangay:id,barangay_name',
            'reviewer:id,name',
        ]);

        return Inertia::render('Admin/AgencyDetails', [
            'agency' => [
                'id' => $agency->id,
                'agency_name' => $agency->agency_name,
                'license_number' => $agency->license_number,
                'contact_person' => $agency->contact_person,
                'email' => $agency->email,
                'contact_number' => $agency->contact_number,
                'address' => $agency->address,
                'city' => $agency->city,
                'province' => $agency->province,
                'barangay' => $agency->barangay?->barangay_name,
                'agency_type' => $agency->agency_type,
                'industry_category' => $agency->industry_category,
                'description' => $agency->description,
                'status' => $agency->status,
                'status_label' => $agency->statusLabel(),
                'rejection_reason' => $agency->rejection_reason,
                'approved_at' => $agency->approved_at?->toDateTimeString(),
                'rejected_at' => $agency->rejected_at?->toDateTimeString(),
                'registered_at' => $agency->created_at?->toDateTimeString(),
                'reviewer' => $agency->reviewer?->name,
                'account_active' => (bool) $agency->user?->is_active,
            ],
        ]);
    }

    /**
     * Approve a pending (or previously rejected) agency, enabling its login.
     */
    public function approve(Request $request, Agency $agency): RedirectResponse
    {
        $this->approval->approve($agency, $request->user());

        return redirect()
            ->route('admin.agencies')
            ->with('success', "\"{$agency->agency_name}\" has been approved. The agency can now sign in.");
    }

    /**
     * Reject an agency and persist the reason.
     */
    public function reject(Request $request, Agency $agency): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $reason = $validated['rejection_reason'] ?? null;

        $this->approval->reject($agency, $request->user(), $reason);

        return redirect()
            ->route('admin.agencies')
            ->with('success', "\"{$agency->agency_name}\" has been rejected and can no longer sign in.");
    }
}
