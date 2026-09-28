@if(!empty($data['trainings']))
<div class="section" data-section="training">
    <div class="section-title">Trainings &amp; Seminars</div>
    <div class="section-content">@foreach($data['trainings'] as $t)<div class="training-item">{{ $t }}</div>@endforeach</div>
</div>
@endif
