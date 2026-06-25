<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Resume extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PENDING = 'pending';
    public const STATUS_GENERATED = 'generated';
    public const STATUS_READY = 'ready_for_download';
    public const STATUS_DOWNLOADED = 'downloaded';
    public const STATUS_UPDATED = 'updated';

    public const ALL_STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_PENDING,
        self::STATUS_GENERATED,
        self::STATUS_READY,
        self::STATUS_DOWNLOADED,
        self::STATUS_UPDATED,
    ];

    public const STATUS_LABELS = [
        self::STATUS_DRAFT => 'Draft',
        self::STATUS_PENDING => 'Pending',
        self::STATUS_GENERATED => 'Generated',
        self::STATUS_READY => 'Ready for Download',
        self::STATUS_DOWNLOADED => 'Downloaded',
        self::STATUS_UPDATED => 'Updated',
    ];

    public const STATUS_COLORS = [
        self::STATUS_DRAFT => 'slate',
        self::STATUS_PENDING => 'amber',
        self::STATUS_GENERATED => 'blue',
        self::STATUS_READY => 'green',
        self::STATUS_DOWNLOADED => 'teal',
        self::STATUS_UPDATED => 'indigo',
    ];

    protected $fillable = [
        'job_seeker_id',
        'resume_id',
        'template',
        'content',
        'status',
        'generated_by',
        'generated_at',
        'downloaded_at',
        'download_count',
        'file_path',
        'notes',
    ];

    protected $appends = ['download_url', 'status_label', 'status_color'];

    protected $casts = [
        'content' => 'array',
        'generated_at' => 'datetime',
        'downloaded_at' => 'datetime',
        'download_count' => 'integer',
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
        if ($this->file_path && Storage::disk('public')->exists($this->file_path)) {
            return Storage::disk('public')->url($this->file_path);
        }
        return null;
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? ucfirst($this->status);
    }

    public function getStatusColorAttribute(): string
    {
        return self::STATUS_COLORS[$this->status] ?? 'slate';
    }

    public function markAsDownloaded(): void
    {
        $this->update([
            'status' => self::STATUS_DOWNLOADED,
            'downloaded_at' => now(),
            'download_count' => ($this->download_count ?? 0) + 1,
        ]);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeGenerated($query)
    {
        return $query->whereIn('status', [
            self::STATUS_GENERATED,
            self::STATUS_READY,
            self::STATUS_DOWNLOADED,
            self::STATUS_UPDATED,
        ]);
    }
}
