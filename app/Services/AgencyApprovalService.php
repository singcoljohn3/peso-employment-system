<?php

namespace App\Services;

use App\Models\Agency;
use App\Models\User;
use App\Notifications\NotificationService;
use Illuminate\Support\Facades\Log;

/**
 * Single source of truth for the agency approval workflow.
 *
 * Registration always creates a `pending` agency. Only a PESO admin can move an
 * agency to `approved` or `rejected`. The login controller, the portal
 * middleware and the admin controller all read their status rules from here so
 * the gate can never drift between the three call sites.
 */
class AgencyApprovalService
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    /** Every status the `agencies.status` enum accepts, in display order. */
    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
    ];

    public const PENDING_MESSAGE = 'Your agency account is still pending PESO approval. Please wait for your account to be approved.';
    public const REJECTED_MESSAGE = 'Your agency account registration was rejected by PESO. Please contact PESO for more information.';
    public const MISSING_RECORD_MESSAGE = 'No agency record is linked to this account. Please contact PESO for more information.';

    /**
     * The message to show when the agency may not use the portal, or null when
     * the account is approved and may proceed.
     */
    public function blockReason(?string $status): ?string
    {
        return match ($status) {
            self::STATUS_APPROVED => null,
            self::STATUS_PENDING => self::PENDING_MESSAGE,
            self::STATUS_REJECTED => self::REJECTED_MESSAGE,
            default => self::MISSING_RECORD_MESSAGE,
        };
    }

    public function isApproved(?Agency $agency): bool
    {
        return $agency !== null && $agency->status === self::STATUS_APPROVED;
    }

    public function isPending(?Agency $agency): bool
    {
        return $agency !== null && $agency->status === self::STATUS_PENDING;
    }

    /**
     * Approve an agency, clearing any previous rejection trail and re-enabling
     * the login. Reversing a rejection is intentional: PESO re-reviewing an
     * account must produce one unambiguous outcome.
     */
    public function approve(Agency $agency, ?User $reviewer = null): Agency
    {
        $agency->forceFill([
            'status' => self::STATUS_APPROVED,
            'approved_at' => now(),
            'rejected_at' => null,
            'rejection_reason' => null,
            'reviewed_by' => $reviewer?->id,
        ])->save();

        $agency->load('user');

        if ($agency->user && ! $agency->user->is_active) {
            $agency->user->forceFill(['is_active' => true])->save();
        }

        if ($agency->user) {
            $this->notify(
                fn () => NotificationService::sendAgencyAccountApproved($agency->user, $agency),
                'approve',
                $agency
            );
        }

        return $agency;
    }

    /**
     * Reject an agency. The reason is persisted on the row so the outcome
     * survives refresh, logout and server restarts.
     */
    public function reject(Agency $agency, ?User $reviewer = null, ?string $reason = null): Agency
    {
        $reason = $reason !== null ? trim($reason) : '';

        $agency->forceFill([
            'status' => self::STATUS_REJECTED,
            'rejected_at' => now(),
            'rejection_reason' => $reason !== '' ? $reason : null,
            'approved_at' => null,
            'reviewed_by' => $reviewer?->id,
        ])->save();

        $agency->load('user');

        if ($agency->user) {
            $this->notify(
                fn () => NotificationService::sendAgencyAccountRejected(
                    $agency->user,
                    $agency,
                    $reason !== '' ? $reason : 'No reason provided'
                ),
                'reject',
                $agency
            );
        }

        return $agency;
    }

    /**
     * Counters shown next to the agency list so PESO can see the review queue.
     *
     * @return array<string, int>
     */
    public function counts(): array
    {
        $counts = Agency::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->map(fn ($total) => (int) $total)
            ->all();

        $result = ['total' => 0];

        foreach (self::STATUSES as $status) {
            $result[$status] = $counts[$status] ?? 0;
            $result['total'] += $result[$status];
        }

        return $result;
    }

    /**
     * Notifications are best-effort: a mail or queue failure must never abort
     * the approval that was already written to the database.
     */
    private function notify(callable $callback, string $action, Agency $agency): void
    {
        try {
            $callback();
        } catch (\Throwable $e) {
            Log::error("Agency {$action} notification failed for agency #{$agency->id}: " . $e->getMessage());
        }
    }
}
