<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class Establishment extends Model
{
    use HasFactory;

    protected $table = 'establishments';

    protected $fillable = [
        'user_id',
        'company_name',
        'contact_person',
        'contact_number',
        'email',
        'logo',
        'barangay_id',
        'address',
        'latitude',
        'longitude',
        'industry_category',
        'description',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class, 'barangay_id');
    }

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class);
    }

    public function scopeWithLocation($query)
    {
        return $query->whereNotNull('latitude')->whereNotNull('longitude');
    }

    public function scopeHiring($query)
    {
        return $query->whereHas('jobs', function ($q) {
            $q->whereIn('hiring_status', ['Open', 'Hiring']);
        });
    }

    public function savedBy(): HasMany
    {
        return $this->hasMany(SavedEstablishment::class);
    }

    /**
     * Branches of one company are separate establishment rows that share a
     * company name (case and extra spaces ignored).
     */
    public static function branchKey(?string $companyName): string
    {
        return (string) Str::of($companyName ?? '')->lower()->squish();
    }

    /**
     * For map rows: when any branch of a company has an active hiring post,
     * mark every branch of that company as hiring and give it the company's
     * active posts (each post once). Each branch keeps its own location,
     * contact details and application counts. Rows are plain arrays as built
     * by the GIS map endpoints; `$nameKey` is the field holding the company name.
     */
    public static function shareHiringAcrossBranches(Collection $rows, string $nameKey = 'company_name'): Collection
    {
        $branches = $rows->groupBy(fn ($row) => static::branchKey($row[$nameKey] ?? null));

        return $rows->map(function ($row) use ($branches, $nameKey) {
            $key = static::branchKey($row[$nameKey] ?? null);

            if ($key === '' || ! empty($row['is_hiring'])) {
                return $row;
            }

            $hiringBranches = $branches->get($key, collect())->filter(fn ($b) => ! empty($b['is_hiring']));

            if ($hiringBranches->isEmpty()) {
                return $row;
            }

            $jobs = $hiringBranches
                ->flatMap(fn ($b) => collect($b['job_positions'] ?? []))
                ->unique('id')
                ->values();

            $hiringSoon = $hiringBranches->contains(fn ($b) => ! empty($b['is_hiring_soon']));

            return array_merge($row, [
                'is_hiring' => true,
                'is_hiring_soon' => $hiringSoon,
                'is_closed' => false,
                'hiring_status_label' => $hiringSoon ? 'hiring_soon' : 'hiring',
                'available_jobs_count' => $jobs->count(),
                'job_positions' => $jobs->all(),
            ]);
        });
    }
}
