@if(!empty($data['licenses']))
<div class="section" data-section="licenses">
    <div class="section-title">Professional Licenses</div>
    <div class="section-content">@foreach($data['licenses'] as $license)<div class="cert-item">{{ $license }}</div>@endforeach</div>
</div>
@endif
