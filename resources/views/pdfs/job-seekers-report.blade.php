<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Job Seekers Report</title>
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
        <h1>Job Seekers Report</h1>
        <p>PESO Employment System | Generated: {{ $generated_at ?? now()->format('Y-m-d H:i:s') }}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Barangay</th>
                <th>Skills</th>
                <th>Employment Status</th>
                <th>Registered</th>
            </tr>
        </thead>
        <tbody>
            @forelse($jobSeekers ?? [] as $index => $seeker)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $seeker->first_name ?? '' }} {{ $seeker->last_name ?? '' }}</td>
                <td>{{ $seeker->barangay?->barangay_name ?? 'N/A' }}</td>
                <td>{{ is_array($seeker->skills) ? implode(', ', $seeker->skills) : $seeker->skills ?? 'N/A' }}</td>
                <td>{{ $seeker->employment_status ?? 'N/A' }}</td>
                <td>{{ $seeker->is_fully_registered ? 'Yes' : 'No' }}</td>
            </tr>
            @empty
            <tr><td colspan="6" style="text-align:center;">No job seekers found.</td></tr>
            @endforelse
        </tbody>
    </table>
    <div class="footer">
        <p>PESO Employment System &copy; {{ date('Y') }}</p>
    </div>
</body>
</html>
