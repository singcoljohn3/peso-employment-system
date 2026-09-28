<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Resume - Formal Executive</title>
<style>
    @page { margin: 0; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #1a1a2e; line-height: 1.5; margin: 0; padding: 0; }
    .sidebar { position: fixed; top: 0; left: 0; width: 200px; height: 100%; background: #1a1a2e; color: #e0e0e0; padding: 30px 20px; }
    .sidebar h1 { font-size: 14pt; font-weight: 700; color: white; margin: 0 0 5px; }
    .sidebar .subtitle { font-size: 8pt; color: #a0a0b0; margin-bottom: 15px; }
    .sidebar .contact { font-size: 7.5pt; }
    .sidebar .contact div { margin-bottom: 6px; }
    .sidebar .section-title { font-size: 8pt; font-weight: 700; color: #e0a800; text-transform: uppercase; letter-spacing: 1.5px; margin: 15px 0 8px; border-bottom: 1px solid #333; padding-bottom: 3px; }
    .sidebar .skill-item { display: block; font-size: 7.5pt; padding: 2px 0; color: #c0c0d0; }
    .main-content { margin-left: 220px; padding: 30px 35px; }
    .section { margin-bottom: 18px; }
    .section-title { font-size: 11pt; font-weight: 700; color: #1a1a2e; border-bottom: 2px solid #e0a800; padding-bottom: 3px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .item { margin-bottom: 8px; }
    .item-title { font-weight: 700; font-size: 10pt; color: #1a1a2e; }
    .item-sub { font-size: 8.5pt; color: #555; }
    .cert-item, .training-item { padding: 2px 0; font-size: 8.5pt; }
    .cert-item:before, .training-item:before { content: "►"; color: #e0a800; margin-right: 6px; }
    table { width: 100%; font-size: 8.5pt; }
    td { padding: 2px 0; }
</style></head>
<body>
    <div class="sidebar">
        @if(!empty($data['profile_photo']))
        <div style="text-align:center;margin-bottom:15px;">
            <img src="{{ asset('storage/' . $data['profile_photo']) }}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #e0a800;" alt="Profile">
        </div>
        @endif
        <h1>{{ $data['full_name'] }}</h1>
        <div class="subtitle">{{ $data['career_objective'] }}</div>
        <div class="contact">
            <div>✉ {{ $data['email'] }}</div>
            <div>✆ {{ $data['contact_number'] }}</div>
            <div>⌂ {{ $data['address'] }}</div>
            <div>📍 {{ $data['barangay'] }}, {{ $data['municipality'] }}</div>
        </div>
        <div class="section-title">Personal Info</div>
        <div style="font-size:7.5pt;">Birth: {{ $data['birthdate'] }}<br>Age: {{ $data['age'] }}<br>{{ $data['civil_status'] }} | {{ $data['sex'] }}</div>
        @if(!empty($data['skills']))
        <div class="section-title">Skills</div>
        @foreach($data['skills'] as $skill) <div class="skill-item">▸ {{ $skill }}</div> @endforeach
        @endif
    </div>
    <div class="main-content">
        {!! $sections ?? '' !!}
        <div style="text-align:center;font-size:7pt;color:#999;margin-top:20px;border-top:1px solid #ddd;padding-top:8px;">
            Generated: {{ $data['generated_at'] }} | PESO Employment System
        </div>
    </div>
</body>
</html>
