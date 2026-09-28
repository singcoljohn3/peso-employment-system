<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobSeeker extends Model
{
    use HasFactory;

    protected $table = 'job_seekers';

    protected $fillable = [
        'user_id',
        'agency_id',
        'first_name',
        'middle_name',
        'last_name',
        'birthdate',
        'age',
        'sex',
        'civil_status',
        'address',
        'contact_number',
        'email',
        'barangay_id',
        'barangay_name',
        'educational_attainment',
        'employment_status',
        'occupation',
        'employer_company',
        'work_experience_years',
        'preferred_job',
        'skills',
        'tesda_nc_certificates',
        'other_trainings',
        'professional_licenses',
        'willing_outside_municipality',
        'willing_abroad',
        'remarks',
        'is_fully_registered',
        'preferred_template',
        'verification_status',
        'verified_by',
        'verified_at',
        'verification_notes',
        'photo_url',
    ];

    protected $appends = ['full_name'];

    protected $casts = [
        'birthdate' => 'date',
        'skills' => 'array',
        'willing_outside_municipality' => 'boolean',
        'willing_abroad' => 'boolean',
        'is_fully_registered' => 'boolean',
        'verification_status' => 'string',
        'verified_at' => 'datetime',
    ];

    public function getFullNameAttribute(): string
    {
        return trim(($this->first_name ?? '') . ' ' . ($this->middle_name ? $this->middle_name . ' ' : '') . ($this->last_name ?? ''));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class, 'agency_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'job_seeker_skills');
    }
    public function barangay()
    {
        return $this->belongsTo(Barangay::class, 'barangay_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function resume()
    {
        return $this->hasOne(Resume::class);
    }

    public function savedEstablishments(): BelongsToMany
    {
        return $this->belongsToMany(Establishment::class, 'saved_establishments', 'job_seeker_id', 'establishment_id')
            ->withTimestamps();
    }

    public function recentlyViewed(): HasMany
    {
        return $this->hasMany(RecentlyViewedEstablishment::class, 'job_seeker_id');
    }
}
