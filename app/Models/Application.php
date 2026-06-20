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
        'job_id',
        'establishment_id',
        'application_details',
        'resume',
        'status',
        'remarks',
        'applied_at',
        'application_date',
    ];

    protected $casts = [
        'application_date' => 'date',
        'applied_at' => 'date',
    ];

    public function jobSeeker(): BelongsTo
    {
        return $this->belongsTo(JobSeeker::class);
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
}
