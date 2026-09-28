@if(!empty($data['work_experience']))
<div class="section" data-section="experience">
    <div class="section-title">Work Experience</div>
    @foreach($data['work_experience'] as $exp)
    <div class="item">
        <div class="item-title">{{ $exp['position'] }}</div>
        <div class="item-sub">{{ $exp['company'] }} @if($exp['years']) | {{ $exp['years'] }} @endif</div>
    </div>
    @endforeach
</div>
@endif
