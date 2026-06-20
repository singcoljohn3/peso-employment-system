<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barangay extends Model
{
    use HasFactory;

    protected $table = 'barangays';

    protected $fillable = [
        'barangay_name',
        'municipality',
        'latitude',
        'longitude',
        'contact_person',
        'contact_number',
        'contact_email',
        'logo',
        'user_id',
    ];

    public function jobSeekers(): HasMany
    {
        return $this->hasMany(JobSeeker::class);
    }
}
