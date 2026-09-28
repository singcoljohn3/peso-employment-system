<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Resume - Traditional</title>
<style>
    @page { margin: 0; }
    body { font-family: 'DejaVu Serif', 'DejaVu Sans', serif; font-size: 10pt; color: #2c2c2c; line-height: 1.6; margin: 0; padding: 0; }
    .header { border-bottom: 2px double #2c2c2c; padding: 25px 40px 15px; text-align: center; }
    .header h1 { margin: 0; font-size: 18pt; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    .header .subtitle { font-size: 9pt; color: #555; margin-top: 4px; }
    .header .contact { font-size: 8pt; color: #555; margin-top: 6px; }
    .header .contact span { margin: 0 8px; }
    .body { padding: 15px 40px; }
    .section { margin-bottom: 14px; }
    .section-title { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #2c2c2c; padding-bottom: 2px; margin-bottom: 8px; }
    .skill-item { display: inline-block; padding: 1px 6px; font-size: 8pt; margin: 1px 2px; border: 1px solid #ccc; }
    .item { margin-bottom: 6px; padding-left: 10px; }
    .item-title { font-weight: 700; font-size: 9.5pt; }
    .item-sub { font-size: 8.5pt; color: #555; }
    .cert-item, .training-item { padding: 2px 0; font-size: 8.5pt; padding-left: 10px; }
    .cert-item:before, .training-item:before { content: "-"; margin-right: 6px; }
    table { width: 100%; font-size: 8.5pt; }
    td { padding: 2px 0; }
</style></head>
<body>
    <div class="header">
        @if(!empty($data['profile_photo']))
        <div style="text-align:center;margin-bottom:10px;">
            <img src="{{ asset('storage/' . $data['profile_photo']) }}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:2px solid #2c2c2c;" alt="Profile">
        </div>
        @endif
        <h1>{{ $data['full_name'] }}</h1>
        @if(!empty($data['professional_title']))
        <div class="subtitle">{{ $data['professional_title'] }}</div>
        @elseif(!empty($data['career_objective']))
        <div class="subtitle">{{ $data['career_objective'] }}</div>
        @endif
        <div class="contact">
            <span>Email: {{ $data['email'] }}</span>
            <span>Tel: {{ $data['contact_number'] }}</span>
            <span>Address: {{ $data['address'] }}, {{ $data['barangay'] }}, {{ $data['municipality'] }}</span>
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
        <div style="text-align:center;font-size:7pt;color:#888;margin-top:20px;border-top:1px solid #ccc;padding-top:8px;">
            Generated: {{ $data['generated_at'] }} | PESO Employment System
        </div>
    </div>
</body>
</html>
