<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Resume</title>
<style>
    @page { margin: 0; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #333; line-height: 1.5; margin: 0; padding: 0; }
    .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 35px 40px 25px; }
    .header h1 { margin: 0; font-size: 24pt; font-weight: 700; }
    .header .subtitle { font-size: 11pt; opacity: 0.9; margin-top: 4px; }
    .header .contact { font-size: 9pt; opacity: 0.85; margin-top: 8px; }
    .header .contact span { margin-right: 15px; }
    .body { padding: 25px 40px; }
    .section { margin-bottom: 18px; }
    .section-title { font-size: 12pt; font-weight: 700; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .skill-item { display: inline-block; background: #dbeafe; color: #1e40af; padding: 3px 10px; border-radius: 12px; font-size: 8.5pt; margin: 2px 3px; }
    .item { margin-bottom: 8px; }
    .item-title { font-weight: 700; font-size: 10.5pt; color: #1e293b; }
    .item-sub { font-size: 9pt; color: #64748b; }
    .cert-item, .training-item { padding: 3px 0; font-size: 9pt; }
    .cert-item:before, .training-item:before { content: "▸"; color: #2563eb; margin-right: 6px; }
    .ref-item { margin-bottom: 6px; font-size: 9pt; }
</style></head>
<body>
    <div class="header">
        <h1>{{ $data['full_name'] }}</h1>
        <div class="subtitle">{{ $data['career_objective'] }}</div>
        <div class="contact">
            <span>📧 {{ $data['email'] }}</span>
            <span>📞 {{ $data['contact_number'] }}</span>
            <span>📍 {{ $data['address'] }}, {{ $data['barangay'] }}, {{ $data['municipality'] }}</span>
        </div>
    </div>
    <div class="body">
        <div class="section">
            <div class="section-title">Personal Information</div>
            <table style="width:100%;font-size:9pt;"><tr>
                <td style="width:50%;"><strong>Date of Birth:</strong> {{ $data['birthdate'] }}</td>
                <td><strong>Age:</strong> {{ $data['age'] }}</td>
            </tr><tr>
                <td><strong>Civil Status:</strong> {{ $data['civil_status'] }}</td>
                <td><strong>Sex:</strong> {{ $data['sex'] }}</td>
            </tr></table>
        </div>
        @if(!empty($data['educational_background']))
        <div class="section">
            <div class="section-title">Educational Background</div>
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
            <div class="section-title">Work Experience</div>
            @foreach($data['work_experience'] as $exp)
            <div class="item">
                <div class="item-title">{{ $exp['position'] }}</div>
                <div class="item-sub">{{ $exp['company'] }} @if($exp['years']) | {{ $exp['years'] }} @endif</div>
            </div>
            @endforeach
        </div>
        @endif
        @if(!empty($data['skills']))
        <div class="section">
            <div class="section-title">Skills</div>
            <div>@foreach($data['skills'] as $s)<span class="skill-item">{{ $s }}</span> @endforeach</div>
        </div>
        @endif
        @if(!empty($data['certifications']))
        <div class="section">
            <div class="section-title">Certifications</div>
            @foreach($data['certifications'] as $cert)<div class="cert-item">{{ $cert }}</div>@endforeach
        </div>
        @endif
        @if(!empty($data['trainings']))
        <div class="section">
            <div class="section-title">Trainings & Seminars</div>
            @foreach($data['trainings'] as $t)<div class="training-item">{{ $t }}</div>@endforeach
        </div>
        @endif
    </div>
</body>
</html>
