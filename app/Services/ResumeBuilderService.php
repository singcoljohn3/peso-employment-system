<?php

namespace App\Services;

use App\Models\JobSeeker;
use App\Models\MemberResume;
use Barryvdh\DomPDF\Facade\Pdf;

/**
 * Builds and renders agency member resumes.
 *
 * Design notes:
 * - Content is layered on top of the member's real job_seeker profile data, so a
 *   member with no saved customisations still gets a fully populated resume from
 *   their existing information (never hardcoded sample data).
 * - Rendering reuses the SAME blade templates as the Job Seeker app, so preview
 *   and the exported PDF are pixel-identical.
 * - Design customisation is applied as an injected CSS layer rather than by
 *   duplicating each of the 10 templates, so new templates keep working.
 */
class ResumeBuilderService
{
    public const SECTION_KEYS = [
        'professional_summary',
        'education',
        'experience',
        'skills',
        'certifications',
        'training',
        'projects',
        'licenses',
        'references',
        'additional_information',
    ];

    public const SECTION_LABELS = [
        'professional_summary' => 'Professional Summary',
        'education' => 'Educational Background',
        'experience' => 'Work Experience',
        'skills' => 'Skills',
        'certifications' => 'Certifications',
        'training' => 'Training & Seminars',
        'projects' => 'Projects',
        'licenses' => 'Professional Licenses',
        'references' => 'References',
        'additional_information' => 'Other Relevant Information',
    ];

    public const FONT_OPTIONS = [
        'sans-serif' => 'Sans Serif',
        'serif' => 'Serif',
        'mono' => 'Monospace',
    ];

    public const ACCENT_COLORS = [
        '#2563eb' => 'Blue',
        '#0f3b5e' => 'Navy',
        '#1e293b' => 'Slate',
        '#4f46e5' => 'Indigo',
        '#7c3aed' => 'Violet',
        '#0f766e' => 'Teal',
        '#b45309' => 'Amber',
        '#9f1239' => 'Crimson',
        '#166534' => 'Green',
        '#1a1a2e' => 'Midnight',
    ];

    public const FONT_SIZES = [
        'small' => 'Small',
        'medium' => 'Medium',
        'large' => 'Large',
    ];

    public const FONT_SCALE = [
        'small' => '0.92em',
        'medium' => '1em',
        'large' => '1.1em',
    ];

    public const LINE_SPACINGS = [
        'compact' => '1.3',
        'normal' => '1.5',
        'relaxed' => '1.7',
    ];

    /**
     * Content that a member may edit, seeded from their real profile.
     */
    public function buildDefaultContent(JobSeeker $jobSeeker): array
    {
        $jobSeeker->loadMissing(['user', 'barangay']);

        $base = app(ResumeService::class)->buildResumeData($jobSeeker);

        $fullName = trim(
            ($jobSeeker->first_name ?? '') . ' '
            . ($jobSeeker->middle_name ? $jobSeeker->middle_name . ' ' : '')
            . ($jobSeeker->last_name ?? '')
        );

        return [
            'full_name' => $fullName,
            'professional_title' => $jobSeeker->preferred_job ?? $jobSeeker->occupation ?? '',
            'email' => $base['email'],
            'contact_number' => $base['contact_number'],
            'address' => $base['address'],
            'barangay' => $base['barangay'],
            'birthdate' => $base['birthdate'],
            'civil_status' => $base['civil_status'],
            'sex' => $base['sex'],
            'professional_summary' => $base['career_objective'],
            'educational_background' => $this->seedEducation($jobSeeker),
            'work_experience' => $this->seedExperience($jobSeeker),
            'skills' => $this->seedSkills($jobSeeker),
            'certifications' => $base['certifications'],
            'training' => $base['trainings'],
            'projects' => [],
            'licenses' => $base['licenses'],
            'references' => [],
            'additional_information' => '',
        ];
    }

    private function seedEducation(JobSeeker $jobSeeker): array
    {
        if (! $jobSeeker->educational_attainment) {
            return [];
        }

        return [[
            'level' => $jobSeeker->educational_attainment,
            'school' => '',
            'year' => '',
        ]];
    }

    private function seedExperience(JobSeeker $jobSeeker): array
    {
        $remarks = trim((string) $jobSeeker->remarks);

        // The agency member form stores free-text work history in `remarks`.
        // Split it into discrete entries on blank lines so each becomes its own row.
        $entries = $remarks !== ''
            ? preg_split('/\n\s*\n/', $remarks)
            : [];

        $entries = array_values(array_filter(array_map('trim', $entries), fn ($v) => $v !== ''));

        if (! empty($entries)) {
            return array_map(fn ($entry) => [
                'position' => $entry,
                'company' => '',
                'years' => '',
            ], $entries);
        }

        if (! $jobSeeker->occupation && ! $jobSeeker->employer_company) {
            return [];
        }

        return [[
            'position' => $jobSeeker->occupation ?? '',
            'company' => $jobSeeker->employer_company ?? '',
            'years' => $jobSeeker->work_experience_years
                ? $jobSeeker->work_experience_years . ' year(s)'
                : '',
        ]];
    }

    private function seedSkills(JobSeeker $jobSeeker): array
    {
        // Prefer the skills pivot, but fall back to the legacy JSON column.
        $pivotSkills = $jobSeeker->relationLoaded('skills')
            ? $jobSeeker->skills
            : $jobSeeker->skills()->pluck('skill_name');

        $pivotSkills = collect($pivotSkills)->map(fn ($s) => $s->skill_name ?? $s)
            ->filter()
            ->map('trim')
            ->values()
            ->all();

        if (! empty($pivotSkills)) {
            return array_values(array_unique($pivotSkills));
        }

        $json = $jobSeeker->skills;

        if (is_string($json)) {
            $json = explode(',', $json);
        }

        return array_values(array_filter(array_map('trim', (array) $json)));
    }

    public function defaultDesignOptions(): array
    {
        return [
            'accent_color' => '#2563eb',
            'font_family' => 'sans-serif',
            'font_size' => 'medium',
            'line_spacing' => 'normal',
            'section_order' => self::SECTION_KEYS,
            'hidden_sections' => [],
        ];
    }

    public function normaliseDesignOptions(?array $design): array
    {
        $defaults = $this->defaultDesignOptions();

        if (! $design) {
            return $defaults;
        }

        $accent = $design['accent_color'] ?? $defaults['accent_color'];
        if (! preg_match('/^#[0-9a-fA-F]{6}$/', (string) $accent)) {
            $accent = $defaults['accent_color'];
        }

        $fontFamily = $design['font_family'] ?? $defaults['font_family'];
        if (! array_key_exists($fontFamily, self::FONT_OPTIONS)) {
            $fontFamily = $defaults['font_family'];
        }

        $fontSize = $design['font_size'] ?? $defaults['font_size'];
        if (! array_key_exists($fontSize, self::FONT_SIZES)) {
            $fontSize = $defaults['font_size'];
        }

        $lineSpacing = $design['line_spacing'] ?? $defaults['line_spacing'];
        if (! array_key_exists($lineSpacing, self::LINE_SPACINGS)) {
            $lineSpacing = $defaults['line_spacing'];
        }

        $order = is_array($design['section_order'] ?? null)
            ? array_values($design['section_order'])
            : $defaults['section_order'];

        // Append any sections that are missing from a partial saved order.
        foreach (self::SECTION_KEYS as $key) {
            if (! in_array($key, $order, true)) {
                $order[] = $key;
            }
        }

        $hidden = is_array($design['hidden_sections'] ?? null)
            ? array_values(array_intersect($design['hidden_sections'], self::SECTION_KEYS))
            : [];

        return [
            'accent_color' => $accent,
            'font_family' => $fontFamily,
            'font_size' => $fontSize,
            'line_spacing' => $lineSpacing,
            'section_order' => $order,
            'hidden_sections' => $hidden,
        ];
    }

    /**
     * Resolve the saved record for a member, or null when nothing is saved yet.
     */
    public function findRecord(JobSeeker $jobSeeker): ?MemberResume
    {
        return MemberResume::where('job_seeker_id', $jobSeeker->id)->first();
    }

    /**
     * Effective template: saved member choice, then the job seeker preference.
     */
    public function resolveTemplate(JobSeeker $jobSeeker, ?string $override = null): string
    {
        $template = $override
            ?: $this->findRecord($jobSeeker)?->template
            ?: $jobSeeker->preferred_template
            ?: 'modern-professional';

        if (isset(ResumeService::TEMPLATE_ALIASES[$template])) {
            $template = ResumeService::TEMPLATE_ALIASES[$template];
        }

        return array_key_exists($template, ResumeService::TEMPLATES)
            ? $template
            : 'modern-professional';
    }

    /**
     * Merge saved content over the member's live profile defaults so that
     * fields the member has never edited still reflect their real information.
     */
    public function buildContent(JobSeeker $jobSeeker, ?array $override = null): array
    {
        $defaults = $this->buildDefaultContent($jobSeeker);
        $saved = $override ?? $this->findRecord($jobSeeker)?->content;

        if (! is_array($saved) || empty($saved)) {
            return $defaults;
        }

        $merged = $defaults;

        foreach ($defaults as $key => $defaultValue) {
            if (! array_key_exists($key, $saved)) {
                continue;
            }

            $value = $saved[$key];

            // List sections: an explicitly saved empty array means "removed by
            // the member", so respect it rather than falling back to defaults.
            if (is_array($defaultValue)) {
                $merged[$key] = is_array($value) ? $value : [];
            } else {
                $merged[$key] = $value === null ? $defaultValue : (string) $value;
            }
        }

        return $merged;
    }

    /**
     * Shape content into the array shape the blade templates expect.
     */
    public function shapeForTemplate(JobSeeker $jobSeeker, array $content, ?string $template = null): array
    {
        $base = app(ResumeService::class)->buildResumeData($jobSeeker);

        $photo = $base['profile_photo'];

        return [
            'first_name' => $jobSeeker->first_name ?? '',
            'middle_name' => $jobSeeker->middle_name ?? '',
            'last_name' => $jobSeeker->last_name ?? '',
            'full_name' => $content['full_name'] ?? $base['full_name'],
            'professional_title' => $content['professional_title'] ?? '',
            'email' => $content['email'] ?? '',
            'contact_number' => $content['contact_number'] ?? '',
            'address' => $content['address'] ?? '',
            'barangay' => $content['barangay'] ?? $base['barangay'],
            'municipality' => $base['municipality'],
            'birthdate' => $content['birthdate'] ?? '',
            'age' => $base['age'],
            'civil_status' => $content['civil_status'] ?? '',
            'sex' => $content['sex'] ?? '',
            'profile_photo' => $photo,
            'career_objective' => $content['professional_title'] ?? '',
            'professional_summary' => $content['professional_summary'] ?? '',
            'educational_background' => $this->normaliseList($content['educational_background'] ?? [], ['level', 'school', 'year']),
            'work_experience' => $this->normaliseList($content['work_experience'] ?? [], ['position', 'company', 'years']),
            'skills' => $this->normaliseStrings($content['skills'] ?? []),
            'certifications' => $this->normaliseStrings($content['certifications'] ?? []),
            'trainings' => $this->normaliseStrings($content['training'] ?? $content['trainings'] ?? []),
            'licenses' => $this->normaliseStrings($content['licenses'] ?? []),
            'projects' => $this->normaliseList($content['projects'] ?? [], ['name', 'description']),
            'references' => $this->normaliseList($content['references'] ?? [], ['name', 'position', 'contact']),
            'additional_information' => $content['additional_information'] ?? '',
            'generated_at' => now()->format('F d, Y'),
        ];
    }

    private function normaliseList($value, array $keys): array
    {
        if (! is_array($value)) {
            return [];
        }

        $rows = [];

        foreach ($value as $row) {
            if (is_string($row)) {
                // Tolerate simple string entries (e.g. one-line skill-like rows).
                $row = trim($row);

                if ($row === '') {
                    continue;
                }

                $mapped = array_fill_keys($keys, '');
                $mapped[$keys[0]] = $row;
                $row = $mapped;
            }

            if (! is_array($row)) {
                continue;
            }

            $normalised = [];
            foreach ($keys as $key) {
                $normalised[$key] = isset($row[$key]) && ! is_array($row[$key])
                    ? trim((string) $row[$key])
                    : '';
            }

            if (implode('', $normalised) === '') {
                continue;
            }

            $rows[] = $normalised;
        }

        return $rows;
    }

    private function normaliseStrings($value): array
    {
        if (is_string($value)) {
            $value = preg_split('/[\n,;]+/', $value);
        }

        if (! is_array($value)) {
            return [];
        }

        $out = [];

        foreach ($value as $item) {
            $item = trim((string) $item);
            if ($item !== '' && ! in_array($item, $out, true)) {
                $out[] = $item;
            }
        }

        return $out;
    }

    public function renderHtml(
        JobSeeker $jobSeeker,
        ?string $template = null,
        ?array $content = null,
        ?array $design = null
    ): string {
        $template = $this->resolveTemplate($jobSeeker, $template);
        $design = $this->normaliseDesignOptions($design);
        $content = $this->buildContent($jobSeeker, $content);

        $data = $this->shapeForTemplate($jobSeeker, $content, $template);

        $sections = view('resumes.partials.sections', [
            'data' => $data,
            'order' => $design['section_order'],
            'hidden' => $design['hidden_sections'],
        ])->render();

        $html = view(app(ResumeService::class)->viewFor($template), [
            'data' => $data,
            'design' => $design,
            'sections' => $sections,
        ])->render();

        return $this->injectDesign($html, $design);
    }

    /**
     * Append the design override stylesheet just before </head>.
     */
    private function injectDesign(string $html, array $design): string
    {
        $css = view('resumes.partials.design', ['design' => $design])->render();

        $style = "<style id=\"resume-design-overrides\">\n" . $css . "\n</style>";

        if (stripos($html, '</head>') !== false) {
            return preg_replace('/<\/head>/i', $style . '</head>', $html, 1);
        }

        return $style . $html;
    }

    public function renderPdf(
        JobSeeker $jobSeeker,
        ?string $template = null,
        ?array $content = null,
        ?array $design = null
    ) {
        $html = $this->renderHtml($jobSeeker, $template, $content, $design);

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'defaultFont' => 'sans-serif',
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true,
        ]);

        return $pdf;
    }

    public function persist(
        JobSeeker $jobSeeker,
        int $agencyId,
        ?int $savedBy,
        string $template,
        array $content,
        array $design
    ): MemberResume {
        if (isset(ResumeService::TEMPLATE_ALIASES[$template])) {
            $template = ResumeService::TEMPLATE_ALIASES[$template];
        }

        $template = array_key_exists($template, ResumeService::TEMPLATES)
            ? $template
            : 'modern-professional';

        $record = MemberResume::firstOrNew(['job_seeker_id' => $jobSeeker->id]);

        $record->fill([
            'agency_id' => $agencyId,
            'template' => $template,
            'content' => $content,
            'design_options' => $this->normaliseDesignOptions($design),
            'saved_by' => $savedBy,
        ])->save();

        // Keep the member's own preferred template in sync so the Job Seeker
        // app reflects the design the agency chose for them.
        if ($jobSeeker->preferred_template !== $template) {
            $jobSeeker->forceFill(['preferred_template' => $template])->saveQuietly();
        }

        return $record;
    }
}
