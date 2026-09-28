<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>PESO Employment Report</title>
<style>
    @page { margin: 20mm 15mm 25mm 15mm; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 9pt; color: #1e293b; line-height: 1.5; }
    .page-break { page-break-before: always; }

    .report-header { text-align: center; margin-bottom: 15px; padding-bottom: 12px; border-bottom: 3px solid #1e40af; }
    .header-logos { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .header-logos img { height: 60px; }
    .header-text { text-align: center; }
    .header-text .rep { font-size: 11pt; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; }
    .header-text .province { font-size: 13pt; font-weight: 700; color: #1e40af; text-transform: uppercase; }
    .header-text .municipality { font-size: 15pt; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 2px; }
    .header-text .office { font-size: 10pt; font-weight: 600; color: #2563eb; margin-top: 2px; }
    .header-text .report-title { font-size: 13pt; font-weight: 800; color: #1e293b; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
    .header-meta { font-size: 7.5pt; color: #64748b; margin-top: 5px; }
    .header-meta table { width: 100%; border-collapse: collapse; }
    .header-meta td { padding: 2px 8px; text-align: center; border: none; }

    .section-title { font-size: 11pt; font-weight: 700; color: #ffffff; background: #1e40af; padding: 6px 12px; border-radius: 4px; margin: 15px 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }

    .stats-grid { width: 100%; border-collapse: collapse; margin: 8px 0; }
    .stats-grid td { width: 33.33%; padding: 8px 10px; text-align: center; border: 1px solid #dbeafe; }
    .stat-value { font-size: 16pt; font-weight: 800; color: #1e40af; display: block; line-height: 1.2; }
    .stat-label { font-size: 6.5pt; color: #475569; text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-top: 2px; }
    .stat-box-emerald .stat-value { color: #059669; }
    .stat-box-amber .stat-value { color: #d97706; }
    .stat-box-red .stat-value { color: #dc2626; }
    .stat-box-blue .stat-value { color: #2563eb; }
    .stat-box-violet .stat-value { color: #7c3aed; }
    .stat-box-purple .stat-value { color: #7c3aed; }

    table.data-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 8pt; }
    table.data-table thead th { background: #1e40af; color: #ffffff; padding: 6px 8px; text-align: left; font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.3px; }
    table.data-table tbody td { padding: 5px 8px; border: 1px solid #e2e8f0; }
    table.data-table tbody tr:nth-child(even) { background: #f8fafc; }

    .status-grid { width: 100%; border-collapse: separate; border-spacing: 4px; margin: 10px 0; }
    .status-cell { padding: 10px; text-align: center; border-radius: 6px; }
    .status-cell .count { font-size: 18pt; font-weight: 800; display: block; }
    .status-cell .label { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.3px; }
    .status-amber { background: #fef3c7; color: #92400e; }
    .status-violet { background: #e0e7ff; color: #3730a3; }
    .status-red { background: #fee2e2; color: #991b1b; }
    .status-emerald { background: #d1fae5; color: #065f46; }

    table.monthly-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 7.5pt; }
    table.monthly-table thead th { background: #1e40af; color: #fff; padding: 5px 6px; text-align: center; font-weight: 700; font-size: 7pt; }
    table.monthly-table tbody td { padding: 4px 6px; border: 1px solid #e2e8f0; text-align: center; }
    table.monthly-table tbody tr:nth-child(even) { background: #f8fafc; }

    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 7pt; font-weight: 600; }
    .badge-hired { background: #d1fae5; color: #065f46; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-rejected { background: #fee2e2; color: #991b1b; }

    .report-footer { position: fixed; bottom: -20mm; left: 15mm; right: 15mm; text-align: center; font-size: 7pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 5px; }
    .signature-area { margin-top: 30px; }
    .signature-row { display: flex; justify-content: space-between; margin-top: 10px; }
    .signature-box { text-align: center; width: 40%; }
    .signature-line { margin-top: 35px; border-top: 1px solid #1e293b; padding-top: 5px; font-size: 8pt; font-weight: 600; color: #1e293b; }
    .signature-label { font-size: 7pt; color: #64748b; }
    .confidential { text-align: center; margin-top: 10px; padding: 5px; border: 1px dashed #dc2626; color: #dc2626; font-size: 7pt; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
</style>
</head>
<body>

<script type="text/php">
if (isset($pdf)) {
    $pdf->page_text(72, 770, 'Page {PAGE_NUM} of {PAGE_COUNT}', null, 8, array(148, 163, 184));
}
</script>

<div class="report-header">
    <div class="header-logos">
        <img src="{{ public_path('logo-peso.png') }}" alt="Municipality Logo" />
        <div class="header-text">
            <div class="rep">Republic of the Philippines</div>
            <div class="province">Province of {{ $municipalityData['province'] ?? 'Misamis Oriental' }}</div>
            <div class="municipality">Municipality of {{ $municipalityData['municipality'] ?? 'Opol' }}</div>
            <div class="office">Public Employment Service Office (PESO)</div>
            <div class="report-title">Employment Management System Report</div>
        </div>
        <img src="{{ public_path('logo-peso.png') }}" alt="PESO Logo" />
    </div>
    <div class="header-meta">
        <table>
            <tr>
                <td><strong>Generated On:</strong> {{ $generated_at }}</td>
                <td><strong>Prepared By:</strong> {{ $prepared_by }}</td>
                <td><strong>Date Range:</strong> {{ $date_range }}</td>
            </tr>
        </table>
    </div>
</div>

<!-- Summary Statistics -->
<div class="section-title">Summary Statistics</div>
<table class="stats-grid">
    <tr>
        <td class="stat-box-blue"><span class="stat-value">{{ number_format($statistics['total_job_seekers']) }}</span><span class="stat-label">Registered Job Seekers</span></td>
        <td class="stat-box-violet"><span class="stat-value">{{ number_format($statistics['active_hiring_establishments'] ?? $statistics['active_establishments'] ?? 0) }}</span><span class="stat-label">Active Establishments</span></td>
        <td class="stat-box-amber"><span class="stat-value">{{ number_format($statistics['total_job_vacancies']) }}</span><span class="stat-label">Total Job Vacancies</span></td>
    </tr>
    <tr>
        <td class="stat-box-blue"><span class="stat-value">{{ number_format($statistics['total_applications']) }}</span><span class="stat-label">Total Applications</span></td>
        <td class="stat-box-emerald"><span class="stat-value">{{ number_format($statistics['hired_count'] ?? $statistics['hired'] ?? 0) }}</span><span class="stat-label">Hired Applicants</span></td>
        <td class="stat-box-amber"><span class="stat-value">{{ number_format($statistics['pending_applications'] ?? $statistics['pending'] ?? 0) }}</span><span class="stat-label">Pending Applications</span></td>
    </tr>
    <tr>
        <td class="stat-box-red"><span class="stat-value">{{ number_format($statistics['rejected_applicants'] ?? $statistics['rejected'] ?? 0) }}</span><span class="stat-label">Rejected Applications</span></td>
        <td class="stat-box-purple"><span class="stat-value">{{ number_format($additional['total_resumes'] ?? 0) }}</span><span class="stat-label">Generated Resumes</span></td>
        <td class="stat-box-emerald"><span class="stat-value">{{ $statistics['hiring_rate'] ?? 0 }}%</span><span class="stat-label">Hiring Rate</span></td>
    </tr>
</table>

<!-- Hiring Status Distribution -->
<div class="section-title">Hiring Status Distribution</div>
<table class="status-grid">
    <tr>
        @php
            $statusColors = ['Pending' => 'amber', 'Approved' => 'violet', 'Rejected' => 'red', 'Hired' => 'emerald'];
        @endphp
        @foreach($hiring_distribution as $status)
        <td class="status-cell status-{{ $statusColors[ucfirst($status->status ?? $status['status'] ?? '')] ?? 'amber' }}">
            <span class="count">{{ number_format($status->count ?? $status['count'] ?? 0) }}</span>
            <span class="label">{{ ucfirst($status->status ?? $status['status'] ?? 'Unknown') }}</span>
        </td>
        @endforeach
    </tr>
</table>

<!-- Applicants by Barangay -->
<div class="section-title">Applicants by Barangay</div>
<table class="monthly-table">
    <thead>
        <tr><th style="text-align:left;">Barangay</th><th>Registered Job Seekers</th></tr>
    </thead>
    <tbody>
        @forelse($barangay_chart_data as $b)
        <tr>
            <td style="text-align:left;"><strong>{{ $b['barangay'] }}</strong></td>
            <td>{{ number_format($b['applicants']) }}</td>
        </tr>
        @empty
        <tr><td colspan="2" style="text-align:center;color:#94a3b8;">No barangay data available</td></tr>
        @endforelse
    </tbody>
</table>

<!-- Detailed Applicant Information -->
@if(!empty($detailed_applicants) && count($detailed_applicants) > 0)
<div class="section-title">Detailed Applicant Information</div>
<table class="data-table">
    <thead>
        <tr>
            <th>#</th>
            <th>Applicant Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Barangay</th>
            <th>Application Status</th>
            <th>Date Applied</th>
        </tr>
    </thead>
    <tbody>
        @foreach($detailed_applicants as $i => $app)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td><strong>{{ $app['applicant_name'] }}</strong></td>
            <td>{{ $app['age'] ?? 'N/A' }}</td>
            <td>{{ $app['gender'] }}</td>
            <td>{{ $app['barangay'] }}</td>
            <td>
                @php
                    $statusClass = match(strtolower($app['application_status'])) {
                        'hired' => 'badge-hired',
                        'pending' => 'badge-pending',
                        'rejected' => 'badge-rejected',
                        default => '',
                    };
                @endphp
                <span class="badge {{ $statusClass }}">{{ $app['application_status'] }}</span>
            </td>
            <td>{{ $app['date_applied'] }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

<!-- Top Hiring Establishments -->
<div class="section-title">Top Hiring Establishments</div>
<table class="data-table">
    <thead>
        <tr>
            <th>#</th>
            <th>Company Name</th>
            <th>Industry</th>
            <th>Total Job Vacancies</th>
            <th>Total Hired</th>
        </tr>
    </thead>
    <tbody>
        @forelse($top_establishments as $i => $est)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td><strong>{{ $est->company_name ?? $est['company_name'] ?? 'N/A' }}</strong></td>
            <td>{{ $est->industry_category ?? $est['industry'] ?? 'N/A' }}</td>
            <td style="text-align:center;">{{ $est->total_jobs ?? $est['total_job_vacancies'] ?? $est->total_job_vacancies ?? 0 }}</td>
            <td style="text-align:center;">{{ $est->hired_count ?? $est['total_hired'] ?? 0 }}</td>
        </tr>
        @empty
        <tr><td colspan="5" style="text-align:center;color:#94a3b8;">No data available</td></tr>
        @endforelse
    </tbody>
</table>

<!-- Monthly Hired Applicants -->
<div class="page-break"></div>

<div class="report-header" style="margin-bottom:10px;padding-bottom:8px;">
    <div class="header-logos">
        <img src="{{ public_path('logo-peso.png') }}" alt="Municipality Logo" style="height:40px;" />
        <div class="header-text">
            <div class="rep" style="font-size:9pt;">Republic of the Philippines</div>
            <div class="province" style="font-size:11pt;">Province of {{ $municipalityData['province'] ?? 'Misamis Oriental' }}</div>
            <div class="municipality" style="font-size:12pt;">Municipality of {{ $municipalityData['municipality'] ?? 'Opol' }}</div>
            <div class="report-title" style="font-size:11pt;">Employment Report (Continuation)</div>
        </div>
        <img src="{{ public_path('logo-peso.png') }}" alt="PESO Logo" style="height:40px;" />
    </div>
</div>

<div class="section-title">Monthly Hired Applicants ({{ $year }})</div>
<table class="monthly-table">
    <thead>
        <tr><th>Month</th><th>Hired Count</th></tr>
    </thead>
    <tbody>
        @php $months = ['January','February','March','April','May','June','July','August','September','October','November','December']; @endphp
        @foreach($monthly_hired as $m)
        <tr>
            <td><strong>{{ $m['month_name'] ?? $m['month'] ?? '' }}</strong></td>
            <td>{{ number_format($m['count'] ?? 0) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<!-- Most In-Demand Jobs -->
<div class="section-title">Most In-Demand Jobs</div>
<table class="data-table">
    <thead>
        <tr>
            <th>#</th>
            <th>Job Title</th>
            <th>Establishment</th>
            <th>Applicants</th>
            <th>Hired</th>
        </tr>
    </thead>
    <tbody>
        @forelse($top_jobs as $i => $job)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td><strong>{{ $job->job_title ?? $job['job_title'] ?? 'N/A' }}</strong></td>
            <td>{{ $job->establishment->company_name ?? $job['establishment'] ?? 'N/A' }}</td>
            <td style="text-align:center;">{{ $job->applications_count ?? $job['applicants_count'] ?? 0 }}</td>
            <td style="text-align:center;"><span class="badge badge-hired">{{ $job->hired_count ?? $job['hired_count'] ?? 0 }}</span></td>
        </tr>
        @empty
        <tr><td colspan="5" style="text-align:center;color:#94a3b8;">No data available</td></tr>
        @endforelse
    </tbody>
</table>

<div class="report-footer">
    <span class="system-info">PESO Employment Management System — Generated automatically on {{ $generated_at }}</span>
</div>

<div class="confidential">This document is confidential and intended only for authorized PESO personnel.</div>

<div class="signature-area">
    <div class="signature-row">
        <div class="signature-box">
            <div class="signature-line">{{ $prepared_by }}</div>
            <div class="signature-label">Administrator / Prepared By</div>
        </div>
        <div class="signature-box">
            <div class="signature-line">PESO Officer</div>
            <div class="signature-label">PESO Officer / Reviewed By</div>
        </div>
    </div>
</div>

</body>
</html>
