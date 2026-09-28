@if(!empty($data['skills']))
<div class="section" data-section="skills">
    <div class="section-title">Skills</div>
    <div class="section-content">@foreach($data['skills'] as $s)<span class="skill-item">{{ $s }}</span>@endforeach</div>
</div>
@endif
