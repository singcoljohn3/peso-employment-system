<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResumeDocument extends Model
{
    protected $table = 'resume_documents';

    protected $fillable = [
        'job_seeker_id',
        'document',
        'saved_by',
    ];

    protected $casts = [
        'document' => 'array',
    ];

    public function jobSeeker(): BelongsTo
    {
        return $this->belongsTo(JobSeeker::class);
    }

    public function savedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'saved_by');
    }
}
