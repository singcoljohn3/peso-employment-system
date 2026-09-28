<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Establishments Report</title>
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
        <h1>Establishments Report</h1>
        <p>PESO Employment System | Generated: {{ $generated_at ?? now()->format('Y-m-d H:i:s') }}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Barangay</th>
                <th>Jobs Posted</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($establishments ?? [] as $index => $est)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $est->company_name }}</td>
                <td>{{ $est->contact_person }}</td>
                <td>{{ $est->barangay?->barangay_name ?? 'N/A' }}</td>
                <td>{{ $est->jobs_count ?? $est->jobs?->count() ?? 0 }}</td>
                <td>{{ $est->user_id ? 'Active' : 'Pending' }}</td>
            </tr>
            @empty
            <tr><td colspan="6" style="text-align:center;">No establishments found.</td></tr>
            @endforelse
        </tbody>
    </table>
    <div class="footer">
        <p>PESO Employment System &copy; {{ date('Y') }}</p>
    </div>
</body>
</html>
