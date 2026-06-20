<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Report - {{ $establishment->company_name }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; color: #333; }
        h1 { color: #1e40af; font-size: 20px; margin-bottom: 5px; }
        h2 { color: #1e40af; font-size: 16px; border-bottom: 2px solid #1e40af; padding-bottom: 5px; margin-top: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header p { color: #666; margin: 2px 0; }
        .stats { width: 100%; margin: 15px 0; }
        .stats td { padding: 8px 12px; border: 1px solid #ddd; text-align: center; font-size: 14px; }
        .stats td.label { background: #f8fafc; font-weight: bold; color: #555; }
        table.jobs { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.jobs th { background: #1e40af; color: white; padding: 8px 12px; text-align: left; }
        table.jobs td { padding: 6px 12px; border: 1px solid #ddd; }
        table.jobs tr:nth-child(even) { background: #f8fafc; }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 10px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; }
        .badge-open { background: #d1fae5; color: #065f46; }
        .badge-hiring { background: #dbeafe; color: #1e40af; }
        .badge-closed { background: #fee2e2; color: #991b1b; }
        .badge-filled { background: #f3e8ff; color: #6b21a8; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $establishment->company_name }}</h1>
        <p>{{ $establishment->contact_person }} | {{ $establishment->email }} | {{ $establishment->contact_number }}</p>
        <p>{{ $establishment->barangay->barangay_name ?? 'N/A' }}</p>
        <p style="margin-top:5px;"><strong>Report Generated:</strong> {{ $generated_at }}</p>
    </div>

    <h2>Overview</h2>
    <table class="stats">
        <tr>
            <td class="label">Total Jobs</td>
            <td>{{ $statistics['total_jobs'] }}</td>
            <td class="label">Total Applications</td>
            <td>{{ $statistics['total_applications'] }}</td>
        </tr>
        <tr>
            <td class="label">Hired</td>
            <td>{{ $statistics['hired'] }}</td>
            <td class="label">Rejected</td>
            <td>{{ $statistics['rejected'] }}</td>
        </tr>
    </table>

    <h2>Monthly Applications (Last 12 Months)</h2>
    <table class="jobs">
        <thead>
            <tr>
                <th>Month</th>
                <th>Applications</th>
            </tr>
        </thead>
        <tbody>
            @forelse($monthlyApplications as $item)
            <tr>
                <td>{{ $item->month }}</td>
                <td>{{ $item->count }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="2" style="text-align:center;color:#999;">No data available</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <h2>Job Performance</h2>
    <table class="jobs">
        <thead>
            <tr>
                <th>Job Title</th>
                <th>Type</th>
                <th>Applicants</th>
                <th>Status</th>
                <th>Posted</th>
            </tr>
        </thead>
        <tbody>
            @forelse($jobs as $job)
            <tr>
                <td><strong>{{ $job->job_title }}</strong></td>
                <td>{{ $job->employment_type }}</td>
                <td>{{ $job->applications_count }}</td>
                <td>
                    <span class="badge badge-{{ strtolower($job->hiring_status) }}">
                        {{ $job->hiring_status }}
                    </span>
                </td>
                <td>{{ $job->created_at->format('Y-m-d') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="5" style="text-align:center;color:#999;">No jobs posted yet</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>PESO Job Portal - Establishment Report</p>
    </div>
</body>
</html>
