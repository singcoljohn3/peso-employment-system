<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Application extends Model
{
    use HasFactory;

    protected $table = 'applications';

    protected $fillable = [
        'job_seeker_id',
        'agency_id',
        'submitted_by',
        'job_id',
        'establishment_id',
        'application_details',
        'expected_salary',
        'start_date',
        'resume',
        'status',
        'remarks',
        'applied_at',
    ];

    protected $appends = ['resume_url'];

    protected $casts = [
        'application_date' => 'date',
        'applied_at' => 'date',
        'start_date' => 'date',
    ];

    public function getResumeUrlAttribute(): ?string
    {
        if ($this->resume && \Illuminate\Support\Facades\Storage::disk('public')->exists($this->resume)) {
            return \Illuminate\Support\Facades\Storage::disk('public')->url($this->resume);
        }
        if ($this->relationLoaded('jobSeeker') && $this->jobSeeker && $this->jobSeeker->relationLoaded('resume') && $this->jobSeeker->resume && $this->jobSeeker->resume->file_path) {
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($this->jobSeeker->resume->file_path)) {
                return \Illuminate\Support\Facades\Storage::disk('public')->url($this->jobSeeker->resume->file_path);
            }
        }
        return null;
    }

    public function jobSeeker(): BelongsTo
    {
        return $this->belongsTo(JobSeeker::class);
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class);
    }

    public function applicationStatus(): HasOne
    {
        return $this->hasOne(\App\Models\ApplicationStatus::class);
    }

    public function interview(): HasOne
    {
        return $this->hasOne(Interview::class);
    }
}
