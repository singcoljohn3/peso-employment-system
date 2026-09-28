<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>PESO Report</title>
<style>
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #333; }
    .header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #2563eb; }
    .header h1 { color: #1e293b; margin: 0; }
    .header p { color: #64748b; font-size: 9pt; margin: 5px 0 0; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 12pt; font-weight: 700; color: #2563eb; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; }
    .stats-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; }
    .stat-box { border: 1px solid #e2e8f0; padding: 10px; flex: 1; min-width: 120px; text-align: center; }
    .stat-box .value { font-size: 18pt; font-weight: 700; color: #2563eb; }
    .stat-box .label { font-size: 8pt; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #e2e8f0; padding: 6px; text-align: left; font-size: 9pt; }
    th { background: #f1f5f9; font-weight: 700; }
    .footer { text-align: center; font-size: 7pt; color: #999; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
</style></head>
<body>
    <div class="header">
        <h1>PESO Employment Report</h1>
        <p>Municipality of Opol, Misamis Oriental | Generated: {{ $generated_at ?? now()->format('Y-m-d H:i:s') }}</p>
    </div>
    @if(isset($statistics))
    <div class="section">
        <div class="section-title">Overview</div>
        <div class="stats-grid">
            <div class="stat-box">
                <div class="value">{{ $statistics['total_job_seekers'] ?? $statistics->total_job_seekers ?? 0 }}</div>
                <div class="label">Job Seekers</div>
            </div>
            <div class="stat-box">
                <div class="value">{{ $statistics['active_employers'] ?? $statistics->active_employers ?? 0 }}</div>
                <div class="label">Active Employers</div>
            </div>
            <div class="stat-box">
                <div class="value">{{ $statistics['job_vacancies'] ?? $statistics->job_vacancies ?? 0 }}</div>
                <div class="label">Job Vacancies</div>
            </div>
            <div class="stat-box">
                <div class="value">{{ $statistics['new_applications'] ?? $statistics->new_applications ?? 0 }}</div>
                <div class="label">New Applications</div>
            </div>
        </div>
    </div>
    @endif
    @if(isset($monthlyApplications))
    <div class="section">
        <div class="section-title">Monthly Applications</div>
        <table>
            <thead><tr><th>Month</th><th>Applications</th></tr></thead>
            <tbody>
            @foreach($monthlyApplications as $item)
                <tr><td>{{ $item->month ?? $item['month'] }}</td><td>{{ $item->count ?? $item['count'] }}</td></tr>
            @endforeach
            </tbody>
        </table>
    </div>
    @endif
    <div class="footer">
        <p>PESO Employment System &copy; {{ date('Y') }}. All rights reserved.</p>
    </div>
</body>
</html>
