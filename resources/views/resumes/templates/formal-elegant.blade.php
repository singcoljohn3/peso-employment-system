<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Resume - Formal Elegant</title>
<style>
    @page { margin: 0; }
    body { font-family: 'DejaVu Serif', 'DejaVu Sans', serif; font-size: 10pt; color: #2d2d2d; line-height: 1.6; margin: 0; padding: 0; }
    .header { background: #f8f5f0; padding: 35px 45px 20px; border-bottom: 3px solid #8b5e3c; }
    .header h1 { margin: 0; font-size: 20pt; font-weight: 700; color: #5c3a1e; letter-spacing: 0.5px; }
    .header .subtitle { font-size: 10pt; color: #8b5e3c; font-style: italic; margin-top: 4px; }
    .header .contact { font-size: 8.5pt; color: #666; margin-top: 8px; }
    .header .contact span { margin-right: 12px; }
    .body { padding: 20px 45px; }
    .section { margin-bottom: 18px; }
    .section-title { font-size: 11pt; font-weight: 700; color: #5c3a1e; border-bottom: 1px solid #d4c5a9; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px; }
    .skill-item { display: inline-block; background: #f8f5f0; color: #5c3a1e; padding: 2px 8px; font-size: 8pt; margin: 1px 2px; border: 1px solid #d4c5a9; border-radius: 3px; }
    .item { margin-bottom: 8px; }
    .item-title { font-weight: 700; font-size: 10pt; color: #2d2d2d; }
    .item-sub { font-size: 8.5pt; color: #666; font-style: italic; }
    .cert-item, .training-item { padding: 2px 0; font-size: 8.5pt; }
    .cert-item:before, .training-item:before { content: "✦"; color: #8b5e3c; margin-right: 6px; }
    .ref-item { margin-bottom: 5px; font-size: 8.5pt; }
    table { width: 100%; font-size: 8.5pt; }
    td { padding: 2px 0; }
</style></head>
<body>
    <div class="header">
        @if(!empty($data['profile_photo']))
        <img src="{{ asset('storage/' . $data['profile_photo']) }}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid #8b5e3c;float:right;margin-left:15px;" alt="Profile">
        @endif
        <h1>{{ $data['full_name'] }}</h1>
        @if(!empty($data['professional_title']))
        <div class="subtitle">{{ $data['professional_title'] }}</div>
        @elseif(!empty($data['career_objective']))
        <div class="subtitle">{{ $data['career_objective'] }}</div>
        @endif
        <div class="contact">
            <span>✉ {{ $data['email'] }}</span>
            <span>✆ {{ $data['contact_number'] }}</span>
            <span>⌂ {{ $data['address'] }}, {{ $data['barangay'] }}, {{ $data['municipality'] }}</span>
        </div>
    </div>
    <div class="body">
        <div class="section">
            <div class="section-title">Personal Information</div>
            <table>
                <tr><td style="width:50%;"><strong>Date of Birth:</strong> {{ $data['birthdate'] }}</td><td><strong>Age:</strong> {{ $data['age'] }}</td></tr>
                <tr><td><strong>Civil Status:</strong> {{ $data['civil_status'] }}</td><td><strong>Sex:</strong> {{ $data['sex'] }}</td></tr>
            </table>
        </div>
        @php
            $resumeSections = $sections ?? view('resumes.partials.sections-fallback', ['data' => $data])->render();
        @endphp
        {!! $resumeSections !!}
        <div style="text-align:center;font-size:7pt;color:#999;margin-top:20px;border-top:1px solid #d4c5a9;padding-top:8px;">
            Generated: {{ $data['generated_at'] }} | PESO Employment System
        </div>
    </div>
</body>
</html>
