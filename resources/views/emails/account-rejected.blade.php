<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; }
        .footer { text-align: center; padding: 10px; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Account Application Status</h2>
        </div>
        <div class="content">
            <p>Dear {{ $user->name }},</p>
            <p>We regret to inform you that your account registration has been rejected.</p>
            <p><strong>Reason:</strong> {{ $reason }}</p>
            <p>If you have any questions, please contact PESO for further assistance.</p>
            <p>Best regards,<br>PESO Team</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} PESO Employment System. All rights reserved.
        </div>
    </div>
</body>
</html>
