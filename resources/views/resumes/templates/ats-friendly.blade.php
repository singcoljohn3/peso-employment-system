<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Resume</title>
<style>
    @page { margin: 0; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #000; line-height: 1.4; margin: 0; padding: 0; }
    .page { padding: 35px 40px; }
    .header { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 18px; }
    .header h1 { margin: 0; font-size: 18pt; font-weight: 700; }
    .header .contact { font-size: 9pt; color: #333; margin-top: 4px; }
    .section { margin-bottom: 14px; }
    .section-title { font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    table { width: 100%; font-size: 9pt; border-collapse: collapse; }
    td { padding: 2px 0; vertical-align: top; }
    .label { font-weight: 700; width: 130px; }
    .item { margin-bottom: 6px; }
    .item-title { font-weight: 700; font-size: 9.5pt; }
    .item-sub { font-size: 9pt; color: #333; }
    .skill-item { font-size: 9pt; }
    .list-item { font-size: 9pt; padding: 1px 0; }
</style></head>
<body>
    <div class="page">
        <div class="header">
            <h1>{{ strtoupper($data['full_name']) }}</h1>
            <div class="contact">{{ $data['email'] }} | {{ $data['contact_number'] }} | {{ $data['address'] }}, {{ $data['barangay'] }}, {{ $data['municipality'] }}</div>
        </div>
        <div class="section">
            <div class="section-title">Objective</div>
            <p style="font-size:9pt;margin:0;">{{ $data['career_objective'] }}</p>
        </div>
        <div class="section">
            <div class="section-title">Personal Information</div>
            <table><tr><td class="label">Date of Birth:</td><td>{{ $data['birthdate'] }}</td><td class="label">Age:</td><td>{{ $data['age'] }}</td></tr>
            <tr><td class="label">Civil Status:</td><td>{{ $data['civil_status'] }}</td><td class="label">Sex:</td><td>{{ $data['sex'] }}</td></tr></table>
        </div>
        @if(!empty($data['educational_background']))
        <div class="section">
            <div class="section-title">Educational Background</div>
            @foreach($data['educational_background'] as $edu)
            <div class="item"><div class="item-title">{{ $edu['level'] }}</div><div class="item-sub">{{ $edu['school'] }}</div></div>
            @endforeach
        </div>
        @endif
        @if(!empty($data['work_experience']))
        <div class="section">
            <div class="section-title">Work Experience</div>
            @foreach($data['work_experience'] as $exp)
            <div class="item"><div class="item-title">{{ $exp['position'] }} @if($exp['company']) - {{ $exp['company'] }} @endif</div><div class="item-sub">{{ $exp['years'] }}</div></div>
            @endforeach
        </div>
        @endif
        @if(!empty($data['skills']))
        <div class="section">
            <div class="section-title">Skills</div>
            <p style="font-size:9pt;margin:0;">{{ implode(', ', $data['skills']) }}</p>
        </div>
        @endif
        @if(!empty($data['certifications']))
        <div class="section">
            <div class="section-title">Certifications</div>
            @foreach($data['certifications'] as $cert)<div class="list-item">- {{ $cert }}</div>@endforeach
        </div>
        @endif
        @if(!empty($data['trainings']))
        <div class="section">
            <div class="section-title">Trainings & Seminars</div>
            @foreach($data['trainings'] as $t)<div class="list-item">- {{ $t }}</div>@endforeach
        </div>
        @endif
    </div>
</body>
</html>
