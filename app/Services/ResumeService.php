<?php

namespace App\Services;

use App\Models\JobSeeker;
use App\Models\Resume;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResumeService
{
    public const TEMPLATES = [
        'modern-professional' => 'Modern Professional',
        'simple-classic' => 'Simple Classic',
        'ats-friendly' => 'ATS-Friendly',
        'creative' => 'Creative',
        'minimalist' => 'Minimalist',
    ];

    public function buildResumeData(JobSeeker $jobSeeker): array
    {
        $user = $jobSeeker->user;

        $educationalBackground = [];
        if ($jobSeeker->educational_attainment) {
            $educationalBackground[] = [
                'level' => $jobSeeker->educational_attainment,
                'school' => $jobSeeker->address ?? 'N/A',
                'year' => '',
            ];
        }

        $workExperience = [];
        if ($jobSeeker->occupation || $jobSeeker->employer_company) {
            $workExperience[] = [
                'position' => $jobSeeker->occupation ?? 'N/A',
                'company' => $jobSeeker->employer_company ?? 'N/A',
                'years' => $jobSeeker->work_experience_years ? $jobSeeker->work_experience_years . ' year(s)' : '',
            ];
        }

        $skills = [];
        if ($jobSeeker->skills) {
            $skills = is_array($jobSeeker->skills) ? $jobSeeker->skills : explode(',', $jobSeeker->skills);
            $skills = array_map('trim', $skills);
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

        return [
            'first_name' => $jobSeeker->first_name ?? '',
            'middle_name' => $jobSeeker->middle_name ?? '',
            'last_name' => $jobSeeker->last_name ?? '',
            'full_name' => trim(($jobSeeker->first_name ?? '') . ' ' . ($jobSeeker->middle_name ? $jobSeeker->middle_name . ' ' : '') . ($jobSeeker->last_name ?? '')),
            'address' => $jobSeeker->address ?? '',
            'contact_number' => $jobSeeker->contact_number ?? '',
            'email' => $jobSeeker->email ?? ($user?->email ?? ''),
            'birthdate' => $jobSeeker->birthdate ? $jobSeeker->birthdate->format('F d, Y') : '',
            'age' => $jobSeeker->age ?? '',
            'civil_status' => $jobSeeker->civil_status ?? '',
            'sex' => $jobSeeker->sex ?? '',
            'profile_photo' => $user?->profile_photo_path ?? null,
            'career_objective' => $jobSeeker->preferred_job
                ? 'Seeking a position as ' . $jobSeeker->preferred_job . ' where I can utilize my skills and experience to contribute to organizational growth.'
                : '',
            'educational_background' => $educationalBackground,
            'work_experience' => $workExperience,
            'skills' => $skills,
            'certifications' => $certifications,
            'trainings' => $trainings,
            'barangay' => $jobSeeker->barangay?->barangay_name ?? '',
            'municipality' => 'Opol, Misamis Oriental',
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

    public function generateResume(JobSeeker $jobSeeker, User $admin, ?array $customContent = null): Resume
    {
        $template = $jobSeeker->preferred_template ?? 'modern-professional';
        $data = $customContent ?? $this->buildResumeData($jobSeeker);

        $view = 'resumes.templates.' . $template;

        $pdf = Pdf::loadView($view, ['data' => $data]);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'defaultFont' => 'sans-serif',
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true,
        ]);

        $resumeId = 'RSM-' . date('Y') . '-' . str_pad(Resume::whereYear('created_at', date('Y'))->count() + 1, 4, '0', STR_PAD_LEFT);

        $filename = 'resumes/' . $resumeId . '.pdf';
        Storage::disk('public')->put($filename, $pdf->output());

        $resume = Resume::updateOrCreate(
            ['job_seeker_id' => $jobSeeker->id],
            [
                'resume_id' => $resumeId,
                'template' => $template,
                'content' => $data,
                'status' => 'ready_for_download',
                'generated_by' => $admin->id,
                'generated_at' => now(),
                'file_path' => $filename,
            ]
        );

        return $resume;
    }

    public function regenerateResume(Resume $resume, User $admin, ?array $customContent = null): Resume
    {
        $jobSeeker = $resume->jobSeeker;
        $data = $customContent ?? $this->buildResumeData($jobSeeker);

        $view = 'resumes.templates.' . $jobSeeker->preferred_template;

        $pdf = Pdf::loadView($view, ['data' => $data]);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'defaultFont' => 'sans-serif',
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true,
        ]);

        $filename = 'resumes/' . $resume->resume_id . '.pdf';
        Storage::disk('public')->put($filename, $pdf->output());

        $resume->update([
            'template' => $jobSeeker->preferred_template,
            'content' => $data,
            'status' => 'ready_for_download',
            'generated_by' => $admin->id,
            'generated_at' => now(),
            'file_path' => $filename,
        ]);

        return $resume;
    }
}
