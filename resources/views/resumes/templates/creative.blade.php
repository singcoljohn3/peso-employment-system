<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Resume</title>
<style>
    @page { margin: 0; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #333; line-height: 1.5; margin: 0; padding: 0; }
    .container { display: flex; min-height: 100vh; }
    .sidebar { width: 35%; background: linear-gradient(180deg, #7c3aed, #4f46e5); color: white; padding: 30px 20px; }
    .main { width: 65%; padding: 30px 25px; }
    .sidebar h1 { font-size: 20pt; font-weight: 800; margin: 0 0 4px; line-height: 1.2; }
    .sidebar .subtitle { font-size: 9pt; opacity: 0.9; margin-bottom: 15px; }
    .sidebar .contact-item { font-size: 8.5pt; margin-bottom: 6px; opacity: 0.9; }
    .sidebar .section-title { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 4px; margin: 15px 0 8px; }
    .sidebar .skill-item { display: inline-block; background: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 3px; font-size: 8pt; margin: 2px; }
    .sidebar .list-item { font-size: 8.5pt; padding: 2px 0; opacity: 0.9; }
    .sidebar .list-item:before { content: "✦"; margin-right: 5px; opacity: 0.7; }
    .main .section-title { font-size: 11pt; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid #4f46e5; padding-bottom: 4px; margin-bottom: 8px; }
    .main .section { margin-bottom: 16px; }
    .main .item { margin-bottom: 8px; }
    .main .item-title { font-weight: 700; font-size: 10pt; color: #1e293b; }
    .main .item-sub { font-size: 9pt; color: #64748b; }
    .main .info-row { font-size: 9pt; padding: 2px 0; }
    .main .info-row strong { display: inline-block; width: 100px; color: #475569; }
</style></head>
<body>
    <div class="container">
        <div class="sidebar">
            <h1>{{ $data['full_name'] }}</h1>
            <div class="subtitle">{{ $data['career_objective'] }}</div>
            <div class="contact-item">✉ {{ $data['email'] }}</div>
            <div class="contact-item">📞 {{ $data['contact_number'] }}</div>
            <div class="contact-item">📍 {{ $data['address'] }}, {{ $data['barangay'] }}</div>
            <div class="section-title">Personal</div>
            <div class="list-item">Born {{ $data['birthdate'] }}</div>
            <div class="list-item">{{ $data['age'] }} years old</div>
            <div class="list-item">{{ $data['civil_status'] }}</div>
            <div class="list-item">{{ $data['sex'] }}</div>
            @if(!empty($data['skills']))
            <div class="section-title">Skills</div>
            @foreach($data['skills'] as $s)<span class="skill-item">{{ $s }}</span> @endforeach
            @endif
            @if(!empty($data['certifications']))
            <div class="section-title">Certifications</div>
            @foreach($data['certifications'] as $cert)<div class="list-item">{{ $cert }}</div>@endforeach
            @endif
        </div>
        <div class="main">
            @if(!empty($data['educational_background']))
            <div class="section">
                <div class="section-title">Education</div>
                @foreach($data['educational_background'] as $edu)
                <div class="item"><div class="item-title">{{ $edu['level'] }}</div><div class="item-sub">{{ $edu['school'] }}</div></div>
                @endforeach
            </div>
            @endif
            @if(!empty($data['work_experience']))
            <div class="section">
                <div class="section-title">Experience</div>
                @foreach($data['work_experience'] as $exp)
                <div class="item"><div class="item-title">{{ $exp['position'] }}</div><div class="item-sub">{{ $exp['company'] }} @if($exp['years']) | {{ $exp['years'] }} @endif</div></div>
                @endforeach
            </div>
            @endif
            @if(!empty($data['trainings']))
            <div class="section">
                <div class="section-title">Trainings & Seminars</div>
                @foreach($data['trainings'] as $t)
                <div class="item" style="font-size:9pt;padding:2px 0;">▸ {{ $t }}</div>
                @endforeach
            </div>
            @endif
        </div>
    </div>
</body>
</html>
