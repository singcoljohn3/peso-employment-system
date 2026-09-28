<?php

namespace App\Notifications;

use App\Models\Agency;
use App\Models\Application;
use App\Models\Establishment;
use App\Models\Interview;
use App\Models\JobSeeker;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public static function sendAccountApproved(User $user): void
    {
        $title = 'Account Approved';
        $message = 'Your account has been approved by the PESO Administrator. You can now log in and apply for available jobs.';

        self::storeNotification($user->id, 'account_approved', $title, $message);

        try {
            Mail::to($user->email)->queue(new \App\Mail\AccountApproved($user));
        } catch (\Exception $e) {
            Log::error('Failed to send approval email: ' . $e->getMessage());
        }
    }

    public static function sendAccountRejected(User $user, string $reason): void
    {
        $title = 'Account Rejected';
        $message = 'Your account has been rejected. Reason: ' . $reason;

        self::storeNotification($user->id, 'account_rejected', $title, $message);

        try {
            Mail::to($user->email)->queue(new \App\Mail\AccountRejected($user, $reason));
        } catch (\Exception $e) {
            Log::error('Failed to send rejection email: ' . $e->getMessage());
        }
    }

    /**
     * Notify an agency that PESO approved its account. The notification type
     * reuses `account_approved` so the existing admin/portal icon mapping and
     * unread filters pick it up without new front-end cases.
     */
    public static function sendAgencyAccountApproved(User $user, Agency $agency): void
    {
        $title = 'Agency Account Approved';
        $message = "Your agency account \"{$agency->agency_name}\" has been approved by PESO. You can now sign in and use the agency portal.";

        self::storeNotification($user->id, 'account_approved', $title, $message, [
            'agency_id' => $agency->id,
            'agency_name' => $agency->agency_name,
            'status' => 'approved',
        ]);

        try {
            Mail::to($user->email)->queue(new \App\Mail\AccountApproved($user));
        } catch (\Exception $e) {
            Log::error('Failed to send agency approval email: ' . $e->getMessage());
        }
    }

    /**
     * Notify an agency that PESO rejected its account.
     */
    public static function sendAgencyAccountRejected(User $user, Agency $agency, string $reason): void
    {
        $title = 'Agency Account Rejected';
        $message = "Your agency account \"{$agency->agency_name}\" was rejected by PESO. Reason: {$reason}";

        self::storeNotification($user->id, 'account_rejected', $title, $message, [
            'agency_id' => $agency->id,
            'agency_name' => $agency->agency_name,
            'status' => 'rejected',
            'reason' => $reason,
        ]);

        try {
            Mail::to($user->email)->queue(new \App\Mail\AccountRejected($user, $reason));
        } catch (\Exception $e) {
            Log::error('Failed to send agency rejection email: ' . $e->getMessage());
        }
    }

    public static function sendAccountSuspended(User $user, string $reason, string $type = 'job_seeker'): void
    {
        $title = 'Account Suspended';
        $message = 'Your account has been suspended. Reason: ' . $reason;

        self::storeNotification($user->id, 'account_suspended', $title, $message);

        try {
            Mail::to($user->email)->queue(new \App\Mail\AccountSuspended($user, $reason, $type));
        } catch (\Exception $e) {
            Log::error('Failed to send suspension email: ' . $e->getMessage());
        }
    }

    public static function sendApplicationStatusUpdated(Application $application): void
    {
        $jobSeeker = $application->jobSeeker;
        $user = $jobSeeker?->user;

        if (!$user) {
            return;
        }

        $jobTitle = $application->job?->job_title ?? 'Unknown Position';
        $status = $application->status ?? 'updated';
        $establishment = $application->establishment ?? $application->job?->establishment;
        $companyName = $establishment?->company_name ?? 'An establishment';

        $title = 'Application Status Updated';
        $message = "Your application for {$jobTitle} at {$companyName} has been {$status}.";

        self::storeNotification($user->id, 'application_status', $title, $message, [
            'application_id' => $application->id,
            'job_title' => $jobTitle,
            'status' => $status,
            'company_name' => $companyName,
        ]);

        try {
            Mail::to($user->email)->queue(new \App\Mail\ApplicationStatusUpdated($application));
        } catch (\Exception $e) {
            Log::error('Failed to send application status email: ' . $e->getMessage());
        }
    }

    public static function sendNewApplication(Application $application): void
    {
        $establishment = $application->establishment ?? $application->job?->establishment;
        if (!$establishment || !$establishment->user_id) {
            return;
        }

        $establishmentUser = User::find($establishment->user_id);
        if (!$establishmentUser) {
            return;
        }

        $jobSeeker = $application->jobSeeker;
        $jobTitle = $application->job?->job_title ?? 'Unknown Position';
        $seekerName = $jobSeeker ? trim($jobSeeker->first_name . ' ' . $jobSeeker->last_name) : 'Unknown';

        $title = 'New Application Received';
        $message = "{$seekerName} applied for {$jobTitle}.";

        self::storeNotification($establishmentUser->id, 'new_application', $title, $message, [
            'application_id' => $application->id,
            'job_seeker_name' => $seekerName,
            'job_title' => $jobTitle,
        ]);
    }

    public static function sendInterviewScheduled(Application $application, Interview $interview): void
    {
        $jobSeeker = $application->jobSeeker;
        $user = $jobSeeker?->user;

        if (!$user) {
            return;
        }

        $jobTitle = $application->job?->job_title ?? 'Unknown Position';
        $companyName = $application->establishment?->company_name ?? $application->job?->establishment?->company_name ?? 'An establishment';
        $date = $interview->scheduled_date ? $interview->scheduled_date->format('F d, Y') : 'TBD';
        $time = $interview->scheduled_time ?? 'TBD';
        $locationOrLink = $interview->location ?? $interview->meeting_link ?? 'TBD';
        $type = $interview->location ? 'On-site' : 'Online';

        $title = 'Interview Scheduled';
        $message = "Your interview for {$jobTitle} at {$companyName} has been scheduled on {$date} at {$time} ({$type}).";

        self::storeNotification($user->id, 'interview_scheduled', $title, $message, [
            'application_id' => $application->id,
            'job_title' => $jobTitle,
            'company_name' => $companyName,
            'interview_date' => $date,
            'interview_time' => $time,
            'interview_type' => $type,
            'location_or_link' => $locationOrLink,
            'notes' => $interview->notes,
        ]);

        try {
            Mail::to($user->email)->queue(new \App\Mail\ApplicationStatusUpdated($application));
        } catch (\Exception $e) {
            Log::error('Failed to send interview scheduled email: ' . $e->getMessage());
        }
    }

    private static function storeNotification(int $userId, string $type, string $title, string $message, ?array $data = null): void
    {
        $payload = array_merge($data ?? [], [
            'type' => $type,
            'title' => $title,
            'message' => $message,
        ]);

        DB::table('notifications')->insert([
            'notifiable_type' => User::class,
            'notifiable_id' => $userId,
            'type' => $type,
            'data' => json_encode($payload),
            'read_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
