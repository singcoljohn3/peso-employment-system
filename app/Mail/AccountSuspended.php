<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountSuspended extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $reason;
    public string $accountType;

    public function __construct(User $user, string $reason, string $accountType = 'job_seeker')
    {
        $this->user = $user;
        $this->reason = $reason;
        $this->accountType = $accountType;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Account Suspended - PESO Employment System',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.account-suspended',
        );
    }
}
