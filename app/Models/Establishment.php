<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
}
