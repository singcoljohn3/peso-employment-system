<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Resume</title>
<style>
    @page { margin: 0; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #333; line-height: 1.6; margin: 0; padding: 0; }
    .header { background: #1e293b; color: white; padding: 30px 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 22pt; font-weight: 700; letter-spacing: 2px; }
    .header .contact { font-size: 9pt; color: #94a3b8; margin-top: 6px; }
    .body { padding: 25px 40px; }
    .section { margin-bottom: 16px; }
    .section-title { font-size: 11pt; font-weight: 700; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1.5px; }
    .info-row { display: flex; font-size: 9pt; padding: 2px 0; }
    .info-label { font-weight: 700; width: 140px; color: #475569; }
    .item { margin-bottom: 8px; }
    .item-title { font-weight: 700; font-size: 10pt; }
    .item-sub { font-size: 9pt; color: #64748b; }
    .skill-tag { display: inline-block; border: 1px solid #cbd5e1; padding: 2px 10px; border-radius: 2px; font-size: 8.5pt; margin: 2px 3px; color: #334155; }
    .list-item { padding: 2px 0; font-size: 9pt; }
    .list-item:before { content: "•"; color: #475569; margin-right: 6px; }
</style></head>
<body>
    <div class="header">
        <h1>{{ strtoupper($data['full_name']) }}</h1>
        <div class="contact">{{ $data['email'] }} | {{ $data['contact_number'] }} | {{ $data['address'] }}, {{ $data['barangay'] }}, {{ $data['municipality'] }}</div>
    </div>
    <div class="body">
        @if($data['career_objective'])
        <div class="section">
            <div class="section-title">Objective</div>
            <p style="font-size:9pt;color:#475569;margin:0;">{{ $data['career_objective'] }}</p>
        </div>
        @endif
        <div class="section">
            <div class="section-title">Personal Details</div>
            <div class="info-row"><span class="info-label">Date of Birth</span><span>{{ $data['birthdate'] }}</span></div>
            <div class="info-row"><span class="info-label">Age</span><span>{{ $data['age'] }}</span></div>
            <div class="info-row"><span class="info-label">Civil Status</span><span>{{ $data['civil_status'] }}</span></div>
            <div class="info-row"><span class="info-label">Sex</span><span>{{ $data['sex'] }}</span></div>
        </div>
        @if(!empty($data['educational_background']))
        <div class="section">
            <div class="section-title">Education</div>
            @foreach($data['educational_background'] as $edu)
            <div class="item">
                <div class="item-title">{{ $edu['level'] }}</div>
                <div class="item-sub">{{ $edu['school'] }}</div>
            </div>
            @endforeach
        </div>
        @endif
        @if(!empty($data['work_experience']))
        <div class="section">
            <div class="section-title">Experience</div>
            @foreach($data['work_experience'] as $exp)
            <div class="item">
                <div class="item-title">{{ $exp['position'] }}</div>
                <div class="item-sub">{{ $exp['company'] }} @if($exp['years']) ({{ $exp['years'] }}) @endif</div>
            </div>
            @endforeach
        </div>
        @endif
        @if(!empty($data['skills']))
        <div class="section">
            <div class="section-title">Skills</div>
            @foreach($data['skills'] as $s)<span class="skill-tag">{{ $s }}</span> @endforeach
        </div>
        @endif
        @if(!empty($data['certifications']))
        <div class="section">
            <div class="section-title">Certifications</div>
            @foreach($data['certifications'] as $cert)<div class="list-item">{{ $cert }}</div>@endforeach
        </div>
        @endif
        @if(!empty($data['trainings']))
        <div class="section">
            <div class="section-title">Trainings & Seminars</div>
            @foreach($data['trainings'] as $t)<div class="list-item">{{ $t }}</div>@endforeach
        </div>
        @endif
    </div>
</body>
</html>
