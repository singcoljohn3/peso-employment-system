@if(!empty($data['certifications']))
<div class="section" data-section="certifications">
    <div class="section-title">Certifications</div>
    <div class="section-content">@foreach($data['certifications'] as $cert)<div class="cert-item">{{ $cert }}</div>@endforeach</div>
</div>
@endif
