<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Job Vacancies Report</title>
<style>
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 9pt; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ccc; padding: 5px; text-align: left; }
    th { background: #2563eb; color: white; }
    h1 { text-align: center; color: #1e293b; }
    .header { text-align: center; margin-bottom: 20px; }
    .footer { text-align: center; font-size: 7pt; color: #999; margin-top: 20px; }
</style></head>
<body>
    <div class="header">
        <h1>Job Vacancies Report</h1>
        <p>PESO Employment System | Generated: {{ $generated_at ?? now()->format('Y-m-d H:i:s') }}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Job Title</th>
                <th>Company</th>
                <th>Barangay</th>
                <th>Type</th>
                <th>Status</th>
                <th>Applicants</th>
            </tr>
        </thead>
        <tbody>
            @forelse($jobs ?? [] as $index => $job)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $job->job_title }}</td>
                <td>{{ $job->establishment?->company_name ?? 'N/A' }}</td>
                <td>{{ $job->barangay?->barangay_name ?? 'N/A' }}</td>
                <td>{{ $job->employment_type }}</td>
                <td>{{ $job->hiring_status }}</td>
                <td>{{ $job->applications_count ?? $job->applications?->count() ?? 0 }}</td>
            </tr>
            @empty
            <tr><td colspan="7" style="text-align:center;">No job vacancies found.</td></tr>
            @endforelse
        </tbody>
    </table>
    <div class="footer">
        <p>PESO Employment System &copy; {{ date('Y') }}</p>
    </div>
</body>
</html>
