@if(!empty($data['projects']))
<div class="section" data-section="projects">
    <div class="section-title">Projects</div>
    @foreach($data['projects'] as $project)
    <div class="item">
        <div class="item-title">{{ $project['name'] }}</div>
        @if($project['description'])
        <div class="item-sub">{{ $project['description'] }}</div>
        @endif
    </div>
    @endforeach
</div>
@endif
