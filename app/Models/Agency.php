<?php

namespace App\Models;

use App\Services\AgencyApprovalService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agency extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'agency_name',
        'contact_person',
        'contact_number',
        'email',
        'address',
        'barangay_id',
        'city',
        'province',
        'industry_category',
        'description',
        'logo',
        'agency_type',
        'license_number',
        'status',
    ];

    /**
     * The approval columns are written by AgencyApprovalService through
     * forceFill, so they are deliberately kept out of $fillable.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'id';
    }

    /* ---------------------------------------------------------------------
     | Approval workflow helpers
     | ------------------------------------------------------------------ */

    public function isPending(): bool
    {
        return $this->status === AgencyApprovalService::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === AgencyApprovalService::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === AgencyApprovalService::STATUS_REJECTED;
    }

    /** Human readable label for the status column. */
    public function statusLabel(): string
    {
        return match ($this->status) {
            AgencyApprovalService::STATUS_APPROVED => 'Approved',
            AgencyApprovalService::STATUS_REJECTED => 'Rejected',
            default => 'Pending',
        };
    }

    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', AgencyApprovalService::STATUS_PENDING);
    }

    /* ---------------------------------------------------------------------
     | Relationships
     | ------------------------------------------------------------------ */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** The PESO admin who last approved or rejected this agency. */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function members(): HasMany
    {
        return $this->hasMany(JobSeeker::class, 'agency_id');
    }

    public function barangay()
    {
        return $this->belongsTo(Barangay::class);
    }

    public function jobs()
    {
        return $this->hasMany(Job::class, 'establishment_id');
    }

    public function applications()
    {
        return $this->hasManyThrough(
            Application::class,
            Job::class,
            'establishment_id',
            'job_id'
        );
    }
}
