<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Resume</title>
<style>
    @page { margin: 0; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #333; line-height: 1.6; margin: 0; padding: 0; }
    .page { padding: 50px 60px; }
    .header { margin-bottom: 25px; }
    .header h1 { font-size: 20pt; font-weight: 300; margin: 0; color: #1e293b; letter-spacing: 3px; text-transform: uppercase; }
    .header .divider { height: 1px; background: #e2e8f0; margin: 12px 0; }
    .header .contact { font-size: 8.5pt; color: #94a3b8; }
    .header .contact span { margin-right: 12px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 8px; }
    .section-content { font-size: 9.5pt; }
    .info-line { display: flex; padding: 2px 0; font-size: 9pt; }
    .info-line strong { width: 120px; color: #64748b; font-weight: 600; }
    .item { margin-bottom: 8px; }
    .item-title { font-weight: 600; font-size: 10pt; color: #1e293b; }
    .item-sub { font-size: 9pt; color: #64748b; }
    .skill-item { display: inline; font-size: 9pt; }
    .skill-item:after { content: ", "; }
    .skill-item:last-child:after { content: ""; }
    .list-item { font-size: 9pt; padding: 1px 0; color: #475569; }
    .list-item:before { content: "— "; color: #cbd5e1; }
</style></head>
<body>
    <div class="page">
        <div class="header">
            <h1>{{ $data['full_name'] }}</h1>
            <div class="divider"></div>
            <div class="contact">
                <span>{{ $data['email'] }}</span>
                <span>{{ $data['contact_number'] }}</span>
                <span>{{ $data['address'] }}, {{ $data['barangay'] }}, {{ $data['municipality'] }}</span>
            </div>
        </div>
        @if($data['career_objective'])
        <div class="section">
            <div class="section-title">Professional Objective</div>
            <div class="section-content" style="color:#475569;">{{ $data['career_objective'] }}</div>
        </div>
        @endif
        <div class="section">
            <div class="section-title">Personal Information</div>
            <div class="section-content">
                <div class="info-line"><strong>Date of Birth</strong> {{ $data['birthdate'] }}</div>
                <div class="info-line"><strong>Age</strong> {{ $data['age'] }}</div>
                <div class="info-line"><strong>Civil Status</strong> {{ $data['civil_status'] }}</div>
                <div class="info-line"><strong>Sex</strong> {{ $data['sex'] }}</div>
            </div>
        </div>
        @if(!empty($data['educational_background']))
        <div class="section">
            <div class="section-title">Educational Background</div>
            <div class="section-content">
                @foreach($data['educational_background'] as $edu)
                <div class="item"><div class="item-title">{{ $edu['level'] }}</div><div class="item-sub">{{ $edu['school'] }}</div></div>
                @endforeach
            </div>
        </div>
        @endif
        @if(!empty($data['work_experience']))
        <div class="section">
            <div class="section-title">Work Experience</div>
            <div class="section-content">
                @foreach($data['work_experience'] as $exp)
                <div class="item"><div class="item-title">{{ $exp['position'] }}</div><div class="item-sub">{{ $exp['company'] }} @if($exp['years']) — {{ $exp['years'] }} @endif</div></div>
                @endforeach
            </div>
        </div>
        @endif
        @if(!empty($data['skills']))
        <div class="section">
            <div class="section-title">Skills</div>
            <div class="section-content">@foreach($data['skills'] as $s)<span class="skill-item">{{ $s }}</span>@endforeach</div>
        </div>
        @endif
        @if(!empty($data['certifications']))
        <div class="section">
            <div class="section-title">Certifications</div>
            <div class="section-content">@foreach($data['certifications'] as $cert)<div class="list-item">{{ $cert }}</div>@endforeach</div>
        </div>
        @endif
        @if(!empty($data['trainings']))
        <div class="section">
            <div class="section-title">Trainings & Seminars</div>
            <div class="section-content">@foreach($data['trainings'] as $t)<div class="list-item">{{ $t }}</div>@endforeach</div>
        </div>
        @endif
    </div>
</body>
</html>
