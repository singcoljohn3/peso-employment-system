@if(!empty($data['educational_background']))
<div class="section" data-section="education">
    <div class="section-title">Educational Background</div>
    @foreach($data['educational_background'] as $edu)
    <div class="item">
        <div class="item-title">{{ $edu['level'] }}</div>
        <div class="item-sub">{{ $edu['school'] }} @if($edu['year']) | {{ $edu['year'] }} @endif</div>
    </div>
    @endforeach
</div>
@endif
