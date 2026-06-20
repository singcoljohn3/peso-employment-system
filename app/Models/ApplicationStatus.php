<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationStatus extends Model
{
    use HasFactory;

    protected $table = 'application_statuses';

    protected $fillable = [
        'application_id',
        'status_id',
        'updated_at',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function hiringStatus(): BelongsTo
    {
        return $this->belongsTo(HiringStatus::class, 'status_id');
    }
}
