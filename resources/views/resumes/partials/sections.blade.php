{{--
    Renders resume body sections in the member's chosen order, skipping hidden ones.

    Context:
      $data      array  shaped resume payload
      $order     array  ordered section keys
      $hidden    array  hidden section keys
--}}
@php
    $sectionViews = [
        'professional_summary' => 'resumes.partials.sections.professional-summary',
        'education' => 'resumes.partials.sections.education',
        'experience' => 'resumes.partials.sections.experience',
        'skills' => 'resumes.partials.sections.skills',
        'certifications' => 'resumes.partials.sections.certifications',
        'training' => 'resumes.partials.sections.training',
        'projects' => 'resumes.partials.sections.projects',
        'licenses' => 'resumes.partials.sections.licenses',
        'references' => 'resumes.partials.sections.references',
        'additional_information' => 'resumes.partials.sections.additional-information',
    ];
@endphp

@foreach($order as $sectionKey)
    @if(isset($sectionViews[$sectionKey]) && !in_array($sectionKey, $hidden, true))
        @include($sectionViews[$sectionKey], ['data' => $data])
    @endif
@endforeach
