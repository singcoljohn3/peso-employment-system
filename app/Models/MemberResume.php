<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberResume extends Model
{
    use HasFactory;

    protected $table = 'member_resumes';

    protected $fillable = [
        'job_seeker_id',
        'agency_id',
        'template',
        'content',
        'design_options',
        'saved_by',
    ];

    protected $casts = [
        'content' => 'array',
        'design_options' => 'array',
    ];

    public function jobSeeker(): BelongsTo
    {
        return $this->belongsTo(JobSeeker::class);
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function savedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'saved_by');
    }
}
