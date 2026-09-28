{{--
    Default body sections for callers that render a template with `data` only
    (the Job Seeker / Admin / Establishment flows). Maps the legacy
    `career_objective` key onto the shared `professional_summary` section.

    Context:
      $data     array  shaped resume payload
      $exclude  array  optional section keys to skip (e.g. sidebar-only skills)
--}}
@php
    $fallbackData = $data;

    if (empty($fallbackData['professional_summary'] ?? null) && !empty($fallbackData['career_objective'] ?? null)) {
        $fallbackData['professional_summary'] = $fallbackData['career_objective'];
    }

    $excluded = $exclude ?? [];

    $order = \App\Services\ResumeBuilderService::SECTION_KEYS;
    $order = array_values(array_diff($order, $excluded));

    $hidden = array_values($excluded);
@endphp

{!! view('resumes.partials.sections', [
    'data' => $fallbackData,
    'order' => $order,
    'hidden' => $hidden,
])->render() !!}