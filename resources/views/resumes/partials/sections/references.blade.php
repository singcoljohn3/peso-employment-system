@if(!empty($data['references']))
<div class="section" data-section="references">
    <div class="section-title">References</div>
    @foreach($data['references'] as $reference)
    <div class="item">
        <div class="item-title">{{ $reference['name'] }}</div>
        <div class="item-sub">{{ $reference['position'] }} @if($reference['contact']) | {{ $reference['contact'] }} @endif</div>
    </div>
    @endforeach
</div>
@endif
