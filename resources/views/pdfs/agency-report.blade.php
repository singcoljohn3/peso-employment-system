<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Agency Report</title>
<style>
    @page { margin: 20mm 15mm 25mm 15mm; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 9pt; color: #1e293b; line-height: 1.5; }
    .page-break { page-break-before: always; }

    .report-header { text-align: center; margin-bottom: 15px; padding-bottom: 12px; border-bottom: 3px solid #0f766e; }
    .header-text .agency-name { font-size: 15pt; font-weight: 800; color: #0f766e; text-transform: uppercase; letter-spacing: 1px; }
    .header-text .report-title { font-size: 12pt; font-weight: 700; color: #1e293b; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
    .header-meta { font-size: 7.5pt; color: #64748b; margin-top: 6px; }

    .section-title { font-size: 11pt; font-weight: 700; color: #ffffff; background: #0f766e; padding: 6px 12px; border-radius: 4px; margin: 15px 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }

    .stats-grid { width: 100%; border-collapse: collapse; margin: 8px 0; }
    .stats-grid td { width: 25%; padding: 8px 10px; text-align: center; border: 1px solid #ccfbf1; }
    .stat-value { font-size: 14pt; font-weight: 800; color: #0f766e; display: block; line-height: 1.2; }
    .stat-label { font-size: 6.5pt; color: #475569; text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-top: 2px; }
    .stat-box-amber .stat-value { color: #d97706; }
    .stat-box-red .stat-value { color: #dc2626; }
    .stat-box-green .stat-value { color: #059669; }
    .stat-box-blue .stat-value { color: #2563eb; }

    table.data-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 8pt; }
    table.data-table thead th { background: #0f766e; color: #ffffff; padding: 6px 8px; text-align: left; font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.3px; }
    table.data-table tbody td { padding: 5px 8px; border: 1px solid #e2e8f0; }
    table.data-table tbody tr:nth-child(even) { background: #f8fafc; }

    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 7pt; font-weight: 600; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-hired { background: #d1fae5; color: #065f46; }
    .badge-rejected { background: #fee2e2; color: #991b1b; }
    .badge-interview { background: #e0e7ff; color: #3730a3; }

    .report-footer { position: fixed; bottom: -20mm; left: 15mm; right: 15mm; text-align: center; font-size: 7pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 5px; }
    .signature-row { display: flex; justify-content: flex-end; margin-top: 10px; }
    .signature-box { text-align: center; width: 40%; }
    .signature-line { margin-top: 45px; border-top: 1px solid #1e293b; padding-top: 5px; font-size: 8pt; font-weight: 600; color: #1e293b; }
    .signature-label { font-size: 7pt; color: #64748b; }
</style>
</head>
<body>

<div class="report-header">
    <div class="header-text">
        <div class="agency-name">{{ $agency->agency_name ?? 'Agency' }}</div>
        <div class="report-title">Employment Report</div>
        <div class="header-meta">
            Generated: {{ $generated_at }} &nbsp;|&nbsp; Prepared by: {{ $prepared_by }}
        </div>
    </div>
</div>

<div class="section-title">Summary Statistics</div>
<table class="stats-grid">
    <tr>
        <td><span class="stat-value">{{ $statistics['total_jobs'] }}</span><span class="stat-label">Total Jobs</span></td>
        <td class="stat-box-green"><span class="stat-value">{{ $statistics['active_jobs'] }}</span><span class="stat-label">Active Jobs</span></td>
        <td class="stat-box-red"><span class="stat-value">{{ $statistics['closed_jobs'] }}</span><span class="stat-label">Closed Jobs</span></td>
        <td class="stat-box-blue"><span class="stat-value">{{ $statistics['total_applications'] }}</span><span class="stat-label">Applications</span></td>
    </tr>
    <tr>
        <td class="stat-box-amber"><span class="stat-value">{{ $statistics['pending'] }}</span><span class="stat-label">Pending</span></td>
        <td class="stat-box-blue"><span class="stat-value">{{ $statistics['for_review'] }}</span><span class="stat-label">Under Review</span></td>
        <td class="stat-box-green"><span class="stat-value">{{ $statistics['for_interview'] }}</span><span class="stat-label">Interview</span></td>
        <td class="stat-box-green"><span class="stat-value">{{ $statistics['hired'] }}</span><span class="stat-label">Hired</span></td>
    </tr>
    <tr>
        <td class="stat-box-red"><span class="stat-value">{{ $statistics['rejected'] }}</span><span class="stat-label">Rejected</span></td>
        <td><span class="stat-value">{{ $statistics['fill_rate'] }}%</span><span class="stat-label">Fill Rate</span></td>
        <td><span class="stat-value">{{ $statistics['success_rate'] }}%</span><span class="stat-label">Success Rate</span></td>
        <td></td>
    </tr>
</table>

<div class="section-title">Job Seeker / Member Records</div>
<table class="data-table">
    <thead>
        <tr>
            <th>Applicant Name</th>
            <th>Email</th>
            <th>Contact Number</th>
            <th>Barangay</th>
            <th>Position</th>
            <th>Status</th>
            <th>Applied Date</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($members as $member)
            <tr>
                <td>{{ $member['name'] }}</td>
                <td>{{ $member['email'] }}</td>
                <td>{{ $member['contact_number'] }}</td>
                <td>{{ $member['barangay'] }}</td>
                <td>{{ $member['job_title'] }}</td>
                <td>
                    @php
                        $statusClass = strtolower($member['status']);
                        $badgeClass = in_array($statusClass, ['pending', 'for review']) ? 'badge-pending' : (\Str::contains($statusClass, 'interview') ? 'badge-interview' : ($statusClass === 'hired' ? 'badge-hired' : ($statusClass === 'rejected' ? 'badge-rejected' : 'badge-pending')));
                    @endphp
                    <span class="badge {{ $badgeClass }}">{{ $member['status'] }}</span>
                </td>
                <td>{{ $member['applied_date'] }}</td>
            </tr>
        @empty
            <tr><td colspan="7" style="text-align:center;padding:10px;">No member records found.</td></tr>
        @endforelse
    </tbody>
</table>

@if (count($jobPerformance) > 0)
    <div class="section-title">Job Vacancy Performance</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Job Title</th>
                <th>Vacancies</th>
                <th>Applicants</th>
                <th>Hired</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($jobPerformance as $job)
                <tr>
                    <td>{{ $job['title'] }}</td>
                    <td>{{ $job['vacancies'] ?? '—' }}</td>
                    <td>{{ $job['applicants'] }}</td>
                    <td>{{ $job['hired'] }}</td>
                    <td>{{ $job['status'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endif

<div class="signature-row">
    <div class="signature-box">
        <div class="signature-line">{{ $prepared_by }}</div>
        <div class="signature-label">Prepared By</div>
    </div>
</div>

<div class="report-footer">
    Agency Employment Report generated on {{ $generated_at }}
</div>

</body>
</html>