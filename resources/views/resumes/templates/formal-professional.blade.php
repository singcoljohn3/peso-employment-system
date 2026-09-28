<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Resume - Formal Professional</title>
<style>
    @page { margin: 0; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #333; line-height: 1.5; margin: 0; padding: 0; }
    .header { background: #0f3b5e; color: white; padding: 30px 40px 20px; }
    .header h1 { margin: 0; font-size: 20pt; font-weight: 700; }
    .header .subtitle { font-size: 10pt; color: #90caf9; margin-top: 4px; }
    .header .contact { font-size: 8.5pt; color: #b0c4de; margin-top: 8px; }
    .header .contact span { margin-right: 12px; }
    .body { padding: 20px 40px; }
    .section { margin-bottom: 16px; }
    .section-title { font-size: 11pt; font-weight: 700; color: #0f3b5e; border-bottom: 2px solid #0f3b5e; padding-bottom: 3px; margin-bottom: 8px; }
    .skill-item { display: inline-block; background: #e3f2fd; color: #0f3b5e; padding: 2px 8px; font-size: 8pt; margin: 1px 2px; border-radius: 3px; }
    .item { margin-bottom: 6px; }
    .item-title { font-weight: 700; font-size: 10pt; color: #1a3a4a; }
    .item-sub { font-size: 8.5pt; color: #666; }
    .cert-item, .training-item { padding: 2px 0; font-size: 8.5pt; }
    .cert-item:before, .training-item:before { content: "•"; color: #0f3b5e; margin-right: 6px; }
    .ref-item { margin-bottom: 5px; font-size: 8.5pt; }
    table { width: 100%; font-size: 8.5pt; }
    td { padding: 2px 0; }
</style></head>
<body>
    <div class="header">
        @if(!empty($data['profile_photo']))
        <img src="{{ asset('storage/' . $data['profile_photo']) }}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.8);float:right;margin-left:15px;" alt="Profile">
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
        {!! $sections ?? '' !!}
        <div style="text-align:center;font-size:7pt;color:#999;margin-top:20px;border-top:1px solid #e0e0e0;padding-top:8px;">
            Generated: {{ $data['generated_at'] }} | PESO Employment System
        </div>
    </div>
</body>
</html>
