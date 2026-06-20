<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Resume extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_seeker_id',
        'resume_id',
        'template',
        'content',
        'status',
        'generated_by',
        'generated_at',
        'file_path',
        'notes',
    ];

    protected $appends = ['download_url'];

    protected $casts = [
        'content' => 'array',
        'generated_at' => 'datetime',
    ];

    public function jobSeeker(): BelongsTo
    {
        return $this->belongsTo(JobSeeker::class);
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function getDownloadUrlAttribute(): ?string
    {
        if ($this->file_path && \Storage::disk('public')->exists($this->file_path)) {
            return \Storage::disk('public')->url($this->file_path);
        }
        return null;
    }
}
