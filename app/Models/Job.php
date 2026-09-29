<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Job extends Model
{
    use HasFactory;

    protected $table = 'job';

    protected $touches = ['establishment'];

    protected $casts = [
        'application_deadline' => 'date',
    ];

    protected $fillable = [
        'establishment_id',
        'agency_id',
        'job_title',
        'description',
        'responsibilities',
        'qualifications',
        'benefits',
        'working_hours',
        'job_location',
        'salary_range',
        'vacant_positions',
        'required_experience',
        'required_education',
        'application_deadline',
        'employment_type',
        'work_arrangement',
        'educational_background',
        'hiring_status',
        'status',
        'barangay_id',
        'salary_type',
        'min_salary',
        'max_salary',
        'salary_negotiable',
        'preferred_age',
        'gender_requirement',
        'certifications',
        'languages',
        'course',
        'required_documents',
        'application_instructions',
    ];

    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class);
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'job_skills');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }
}
