<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\JobSeeker;
use App\Models\Resume;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;
use Illuminate\Validation\ValidationException;

class ResumeService
{
    public const TEMPLATES = [
        'modern-professional' => 'Modern Professional',
        'simple-classic' => 'Simple Classic',
        'ats-friendly' => 'ATS-Friendly',
        'creative' => 'Creative',
        'minimalist' => 'Minimalist',
        'formal-corporate' => 'Formal Corporate',
        'formal-elegant' => 'Formal Elegant',
        'formal-executive' => 'Formal Executive',
        'clean-modern' => 'Clean Modern',
        'two-column-professional' => 'Two-Column Professional',
    ];

    public const TEMPLATE_ALIASES = [
        'formal-professional' => 'clean-modern',
        'formal-traditional' => 'two-column-professional',
    ];

    public const DEFAULT_TEMPLATE = 'modern-professional';

    /**
     * Blade view backing each template key.
     *
     * Most keys map to the view of the same name. The two renamed templates
     * ("clean-modern" and "two-column-professional") keep their original
     * blades instead of duplicating them, so the existing designs stay intact.
     */
    public const TEMPLATE_VIEWS = [
        'modern-professional' => 'resumes.templates.modern-professional',
        'simple-classic' => 'resumes.templates.simple-classic',
        'ats-friendly' => 'resumes.templates.ats-friendly',
        'creative' => 'resumes.templates.creative',
        'minimalist' => 'resumes.templates.minimalist',
        'formal-corporate' => 'resumes.templates.formal-corporate',
        'formal-elegant' => 'resumes.templates.formal-elegant',
        'formal-executive' => 'resumes.templates.formal-executive',
        'clean-modern' => 'resumes.templates.formal-professional',
        'two-column-professional' => 'resumes.templates.formal-traditional',
    ];

    public const REQUIRED_FIELDS = [
        'first_name' => 'First Name',
        'last_name' => 'Last Name',
        'address' => 'Address',
        'contact_number' => 'Contact Number',
        'email' => 'Email',
    ];

    /**
     * Resolve a template identifier to the Blade view that renders it.
     *
     * Identifiers may come from user input, request query strings or the
     * database, so legacy aliases are applied first, unknown values fall back
     * to the default template, and the view is verified to exist. This keeps
     * every render path (preview, edit and PDF export) on the same template
     * without ever raising a "view not found" error.
     */
    public function viewFor(?string $template): string
    {
        $template = trim((string) $template);

        if (isset(self::TEMPLATE_ALIASES[$template])) {
            $template = self::TEMPLATE_ALIASES[$template];
        }

        if (! array_key_exists($template, self::TEMPLATES)) {
            $template = self::DEFAULT_TEMPLATE;
        }

        $view = self::TEMPLATE_VIEWS[$template] ?? 'resumes.templates.' . $template;

        if (! View::exists($view)) {
            $view = self::TEMPLATE_VIEWS[self::DEFAULT_TEMPLATE];
        }

        return $view;
    }

    public function validateRequiredFields(JobSeeker $jobSeeker): array
    {
        $missing = [];
        foreach (self::REQUIRED_FIELDS as $field => $label) {
            $value = $jobSeeker->{$field} ?? null;
            if (empty($value) && $value !== '0') {
                $missing[$field] = $label;
            }
        }
        return $missing;
    }

    public function assertValidForGeneration(JobSeeker $jobSeeker): void
    {
        $missing = $this->validateRequiredFields($jobSeeker);
        if (!empty($missing)) {
            throw ValidationException::withMessages([
                'missing_fields' => 'Cannot generate resume. Missing required fields: ' . implode(', ', $missing),
                'fields' => $missing,
            ]);
        }
    }

    private function generateResumeId(): string
    {
        $year = date('Y');
        do {
            $maxSequence = Resume::where('resume_id', 'like', "RSM-{$year}-%")
                ->orderByDesc('resume_id')
                ->value('resume_id');
            if ($maxSequence) {
                $lastNumber = (int) substr($maxSequence, -4);
                $nextNumber = $lastNumber + 1;
            } else {
                $nextNumber = 1;
            }
            $resumeId = 'RSM-' . $year . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        } while (Resume::where('resume_id', $resumeId)->exists());

        return $resumeId;
    }

    public function buildResumeData(JobSeeker $jobSeeker): array
    {
        $user = $jobSeeker->user;

        $educationalBackground = [];
        if ($jobSeeker->educational_attainment) {
            $educationalBackground[] = [
                'level' => $jobSeeker->educational_attainment,
                'school' => $jobSeeker->school_name ?? $jobSeeker->address ?? '',
                'year' => $jobSeeker->year_graduated ?? '',
            ];
        }

        $workExperience = [];
        if ($jobSeeker->occupation || $jobSeeker->employer_company) {
            $workExperience[] = [
                'position' => $jobSeeker->occupation ?? '',
                'company' => $jobSeeker->employer_company ?? '',
                'years' => $jobSeeker->work_experience_years ? $jobSeeker->work_experience_years . ' year(s)' : '',
            ];
        }

        $skills = [];
        if ($jobSeeker->skills) {
            $skills = is_array($jobSeeker->skills) ? $jobSeeker->skills : explode(',', $jobSeeker->skills);
            $skills = array_map('trim', array_filter($skills));
        }

        $certifications = [];
        if ($jobSeeker->tesda_nc_certificates) {
            $certifications = explode("\n", str_replace([',', ';'], "\n", $jobSeeker->tesda_nc_certificates));
            $certifications = array_map('trim', array_filter($certifications));
        }

        $trainings = [];
        if ($jobSeeker->other_trainings) {
            $trainings = explode("\n", str_replace([',', ';'], "\n", $jobSeeker->other_trainings));
            $trainings = array_map('trim', array_filter($trainings));
        }

        $licenses = [];
        if ($jobSeeker->professional_licenses) {
            $licenses = explode("\n", str_replace([',', ';'], "\n", $jobSeeker->professional_licenses));
            $licenses = array_map('trim', array_filter($licenses));
        }

        $profilePhoto = !empty($jobSeeker->photo_url) ? $jobSeeker->photo_url : null;

        $fullName = trim(
            ($jobSeeker->first_name ?? '') . ' '
            . ($jobSeeker->middle_name ? $jobSeeker->middle_name . ' ' : '')
            . ($jobSeeker->last_name ?? '')
        );

        return [
            'first_name' => $jobSeeker->first_name ?? '',
            'middle_name' => $jobSeeker->middle_name ?? '',
            'last_name' => $jobSeeker->last_name ?? '',
            'full_name' => $fullName,
            'address' => $jobSeeker->address ?? '',
            'contact_number' => $jobSeeker->contact_number ?? '',
            'email' => $jobSeeker->email ?? ($user?->email ?? ''),
            'birthdate' => $jobSeeker->birthdate ? $jobSeeker->birthdate->format('F d, Y') : '',
            'age' => $jobSeeker->age ?? '',
            'civil_status' => $jobSeeker->civil_status ?? '',
            'sex' => $jobSeeker->sex ?? '',
            'profile_photo' => $profilePhoto,
            'career_objective' => $jobSeeker->preferred_job
                ? 'Seeking a position as ' . $jobSeeker->preferred_job . ' where I can utilize my skills and experience to contribute to organizational growth.'
                : '',
            'educational_background' => $educationalBackground,
            'work_experience' => $workExperience,
            'skills' => $skills,
            'certifications' => $certifications,
            'trainings' => $trainings,
            'licenses' => $licenses,
            'references' => [],
            'barangay' => $jobSeeker->barangay?->barangay_name ?? '',
            'municipality' => 'Opol, Misamis Oriental',
            'generated_at' => now()->format('F d, Y'),
        ];
    }

    public function autoGenerateResume(JobSeeker $jobSeeker): ?Resume
    {
        if (!$jobSeeker->is_fully_registered) {
            return null;
        }

        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = $jobSeeker->user;
        }
        if (!$admin) {
            return null;
        }

        return $this->generateResume($jobSeeker, $admin);
    }

    public function generateResume(JobSeeker $jobSeeker, User $admin, ?string $template = null, ?array $customContent = null): Resume
    {
        $this->assertValidForGeneration($jobSeeker);

        $template = $template ?? $jobSeeker->preferred_template ?? 'modern-professional';
        $data = $customContent ?? $this->buildResumeData($jobSeeker);

        $view = $this->viewFor($template);

        $pdf = Pdf::loadView($view, ['data' => $data]);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'defaultFont' => 'sans-serif',
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true,
        ]);

        $resumeId = $this->generateResumeId();
        $filename = 'resumes/' . $resumeId . '.pdf';
        Storage::disk('public')->put($filename, $pdf->output());

        $resume = Resume::updateOrCreate(
            ['job_seeker_id' => $jobSeeker->id],
            [
                'resume_id' => $resumeId,
                'template' => $template,
                'content' => $data,
                'status' => Resume::STATUS_GENERATED,
                'generated_by' => $admin->id,
                'generated_at' => now(),
                'file_path' => $filename,
            ]
        );

        ActivityLog::log(
            'generated',
            'resume',
            "Resume {$resumeId} generated for {$jobSeeker->full_name}",
            $resume,
            ['template' => $template, 'job_seeker_id' => $jobSeeker->id],
            $admin->id,
        );

        return $resume;
    }

    public function regenerateResume(Resume $resume, User $admin, ?string $template = null, ?array $customContent = null): Resume
    {
        $jobSeeker = $resume->jobSeeker;
        $this->assertValidForGeneration($jobSeeker);

        $template = $template ?? $resume->template;
        $data = $customContent ?? $this->buildResumeData($jobSeeker);

        $view = $this->viewFor($template);

        $pdf = Pdf::loadView($view, ['data' => $data]);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'defaultFont' => 'sans-serif',
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true,
        ]);

        $filename = 'resumes/' . $resume->resume_id . '.pdf';
        Storage::disk('public')->put($filename, $pdf->output());

        $newStatus = $resume->status === Resume::STATUS_DOWNLOADED
            ? Resume::STATUS_UPDATED
            : Resume::STATUS_GENERATED;

        $resume->update([
            'template' => $template,
            'content' => $data,
            'status' => $newStatus,
            'generated_by' => $admin->id,
            'generated_at' => now(),
            'file_path' => $filename,
        ]);

        ActivityLog::log(
            'regenerated',
            'resume',
            "Resume {$resume->resume_id} regenerated for {$jobSeeker->full_name}",
            $resume,
            ['template' => $template, 'previous_status' => $resume->getOriginal('status')],
            $admin->id,
        );

        return $resume;
    }

    public function markAsDownloaded(Resume $resume): void
    {
        $resume->markAsDownloaded();

        ActivityLog::log(
            'downloaded',
            'resume',
            "Resume {$resume->resume_id} downloaded",
            $resume,
            ['template' => $resume->template, 'download_count' => $resume->download_count],
        );
    }

    public function generatePreviewHtml(JobSeeker $jobSeeker, string $template): string
    {
        $data = $this->buildResumeData($jobSeeker);
        $view = $this->viewFor($template);

        $pdf = Pdf::loadView($view, ['data' => $data]);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'defaultFont' => 'sans-serif',
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true,
        ]);

        return $pdf->output();
    }
}
