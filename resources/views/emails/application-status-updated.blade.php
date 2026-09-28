<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; }
        .footer { text-align: center; padding: 10px; color: #94a3b8; font-size: 12px; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Application Status Updated</h2>
        </div>
        <div class="content">
            <p>Dear {{ $application->jobSeeker?->first_name ?? 'Applicant' }},</p>
            <p>Your application status has been updated.</p>
            <p><strong>Position:</strong> {{ $application->job?->job_title ?? 'N/A' }}</p>
            <p><strong>Company:</strong> {{ $application->establishment?->company_name ?? $application->job?->establishment?->company_name ?? 'N/A' }}</p>
            <p><strong>Status:</strong> {{ ucfirst($application->status ?? 'Updated') }}</p>
            @if($application->remarks)
                <p><strong>Remarks:</strong> {{ $application->remarks }}</p>
            @endif
            <p>You can check the details by logging into your account.</p>
            <p>Best regards,<br>PESO Team</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} PESO Employment System. All rights reserved.
        </div>
    </div>
</body>
</html>
