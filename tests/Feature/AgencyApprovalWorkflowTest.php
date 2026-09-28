<?php

use App\Models\Agency;
use App\Models\User;
use App\Services\AgencyApprovalService;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * Covers the agency registration approval workflow:
 * pending -> approved -> rejected, the login gate, and the PESO admin actions.
 *
 * Note: this suite needs a working pdo_sqlite (or an overridden DB_CONNECTION)
 * because every assertion below touches the database.
 */

function makeAgency(string $status = AgencyApprovalService::STATUS_PENDING, array $attributes = []): array
{
    $user = User::factory()->create(['role' => 'Agency']);

    $agency = Agency::create(array_merge([
        'user_id' => $user->id,
        'agency_name' => 'Approval Test Agency',
        'license_number' => 'PERMIT-1234',
        'contact_person' => 'Test Contact',
        'email' => $user->email,
        'contact_number' => '09171234567',
        'address' => '1 Test Street, Opol',
        'status' => $status,
    ], $attributes));

    return [$user, $agency];
}

/**
 * The notifications table exists in two shapes in this project: the migration
 * chain creates a `user_id` column, while the live database (which
 * NotificationService writes to) uses Laravel's `notifiable_id`. Resolve the
 * recipient column so the assertions hold either way.
 */
function notificationsFor(int $userId): Builder
{
    $column = Schema::hasColumn('notifications', 'notifiable_id') ? 'notifiable_id' : 'user_id';

    return DB::table('notifications')->where($column, $userId);
}

/**
 * NotificationService writes Laravel's polymorphic columns, which the
 * notifications migration does not create. On a database built purely from the
 * migration chain every notification in the app is silently dropped, so these
 * assertions can only run where the live schema is present.
 */
function skipWhenNotificationsSchemaIsMissing(): void
{
    if (! Schema::hasColumn('notifications', 'notifiable_id')) {
        test()->markTestSkipped(
            'This database was built from the migrations, whose notifications table lacks the '
            . 'notifiable_type/notifiable_id columns that NotificationService writes to. '
            . 'See database/migrations/*_create_notifications_table.php versus the live schema.'
        );
    }
}

/* ------------------------------------------------------------------ */
/* Registration                                                         */
/* ------------------------------------------------------------------ */

it('registers an agency as pending approval', function () {
    $response = $this->post('/agency/register', [
        'agency_name' => 'New Agency Inc',
        'license_number' => 'PERMIT-9999',
        'contact_person' => 'Juan Dela Cruz',
        'email' => 'newagency@example.com',
        'contact_number' => '09171234567',
        'address' => '456 New Street, Opol',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'terms' => 'on',
    ]);

    $response->assertRedirect(route('agency.login'));

    $agency = Agency::where('email', 'newagency@example.com')->firstOrFail();

    expect($agency->status)->toBe(AgencyApprovalService::STATUS_PENDING);
    expect($agency->user->role)->toBe('Agency');
});

it('defaults the status column to pending so nothing is auto-approved', function () {
    $user = User::factory()->create(['role' => 'Agency']);

    // Deliberately omits `status` so the column default is what gets stored.
    $id = DB::table('agencies')->insertGetId([
        'user_id' => $user->id,
        'agency_name' => 'Default Status Agency',
        'contact_person' => 'Default Contact',
        'email' => $user->email,
    ]);

    expect(DB::table('agencies')->where('id', $id)->value('status'))
        ->toBe(AgencyApprovalService::STATUS_PENDING);
});

/* ------------------------------------------------------------------ */
/* Login gate                                                          */
/* ------------------------------------------------------------------ */

it('refuses to sign in an agency that is still pending', function () {
    [$user] = makeAgency(AgencyApprovalService::STATUS_PENDING);

    $response = $this->post('/agency/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors([
        'email' => AgencyApprovalService::PENDING_MESSAGE,
    ]);

    $this->assertGuest();
});

it('refuses to sign in a rejected agency', function () {
    [$user] = makeAgency(AgencyApprovalService::STATUS_REJECTED);

    $response = $this->post('/agency/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertSessionHasErrors([
        'email' => AgencyApprovalService::REJECTED_MESSAGE,
    ]);

    $this->assertGuest();
});

it('signs in an approved agency and lands on the agency dashboard', function () {
    [$user] = makeAgency(AgencyApprovalService::STATUS_APPROVED);

    $this->post('/agency/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('agency.dashboard'));

    $this->assertAuthenticatedAs($user);
});

it('never creates a session for an unapproved agency', function () {
    [$pendingUser] = makeAgency(AgencyApprovalService::STATUS_PENDING);
    [$rejectedUser] = makeAgency(AgencyApprovalService::STATUS_REJECTED);

    foreach ([$pendingUser, $rejectedUser] as $user) {
        $this->post('/agency/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
        expect(session()->has(auth()->getName()))->toBeFalse();
    }
});

it('does not reveal the approval status before the password is verified', function () {
    [$user] = makeAgency(AgencyApprovalService::STATUS_PENDING);

    $response = $this->post('/agency/login', [
        'email' => $user->email,
        'password' => 'definitely-the-wrong-password',
    ]);

    $response->assertSessionHasErrors([
        'email' => 'The provided credentials do not match our records.',
    ]);
    $this->assertGuest();
});

it('refuses a deactivated agency the same way as before the workflow existed', function () {
    [$user] = makeAgency(AgencyApprovalService::STATUS_APPROVED);
    $user->forceFill(['is_active' => false])->save();

    $response = $this->post('/agency/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertSessionHasErrors([
        'email' => 'Your account has been deactivated. Please contact the administrator.',
    ]);
    $this->assertGuest();
});

/* ------------------------------------------------------------------ */
/* Portal access gate                                                  */
/* ------------------------------------------------------------------ */

it('blocks a pending agency from reaching the agency portal directly', function () {
    [$user] = makeAgency(AgencyApprovalService::STATUS_PENDING);

    $this->actingAs($user)
        ->get('/agency/dashboard')
        ->assertRedirect(route('agency.login'))
        ->assertSessionHas('status', AgencyApprovalService::PENDING_MESSAGE);

    $this->assertGuest();
});

it('blocks a rejected agency from reaching the agency portal directly', function () {
    [$user] = makeAgency(AgencyApprovalService::STATUS_REJECTED);

    $this->actingAs($user)
        ->get('/agency/dashboard')
        ->assertRedirect(route('agency.login'))
        ->assertSessionHas('status', AgencyApprovalService::REJECTED_MESSAGE);

    $this->assertGuest();
});

it('lets an approved agency into the agency portal', function () {
    [$user] = makeAgency(AgencyApprovalService::STATUS_APPROVED);

    $this->actingAs($user)
        ->get('/agency/dashboard')
        ->assertOk();
});

/* ------------------------------------------------------------------ */
/* PESO admin                                                          */
/* ------------------------------------------------------------------ */

it('shows the agency review queue to an admin with a pending count', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    makeAgency(AgencyApprovalService::STATUS_PENDING);
    makeAgency(AgencyApprovalService::STATUS_APPROVED);

    $response = $this->actingAs($admin)->get('/admin/agencies');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Agencies')
        ->has('agencies.data', 2)
        ->where('counts.total', 2)
        ->where('counts.pending', 1)
        ->where('counts.approved', 1)
        ->where('counts.rejected', 0)
        ->where('filters.status', 'all'));
});

it('shares the pending agency count with every admin page for the sidebar badge', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    makeAgency(AgencyApprovalService::STATUS_PENDING);

    $this->actingAs($admin)
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('pendingAgencyCount', 1));
});

it('does not leak the agency review queue to a non-admin', function () {
    $seeker = User::factory()->create(['role' => 'job_seeker']);

    $this->actingAs($seeker)
        ->get('/admin/agencies')
        ->assertRedirect();
});

it('approves a pending agency so it can sign in', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    [$user, $agency] = makeAgency(AgencyApprovalService::STATUS_PENDING);

    $this->actingAs($admin)
        ->post("/admin/agencies/{$agency->id}/approve")
        ->assertRedirect(route('admin.agencies'));

    $agency->refresh();

    expect($agency->status)->toBe(AgencyApprovalService::STATUS_APPROVED);
    expect($agency->approved_at)->not->toBeNull();
    expect($agency->reviewed_by)->toBe($admin->id);

    // Sign the admin out so the agency can post to the guest-only login route.
    $this->app['auth']->guard()->logout();
    $this->flushSession();

    $this->post('/agency/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('agency.dashboard'));

    $this->assertAuthenticatedAs($user);
});

it('rejects an agency and stores the reason', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    [, $agency] = makeAgency(AgencyApprovalService::STATUS_PENDING);

    $this->actingAs($admin)
        ->post("/admin/agencies/{$agency->id}/reject", [
            'rejection_reason' => 'Permit could not be verified.',
        ])
        ->assertRedirect(route('admin.agencies'));

    $agency->refresh();

    expect($agency->status)->toBe(AgencyApprovalService::STATUS_REJECTED);
    expect($agency->rejection_reason)->toBe('Permit could not be verified.');
    expect($agency->rejected_at)->not->toBeNull();
    expect($agency->reviewed_by)->toBe($admin->id);
});

it('stores an approval notification for the agency user', function () {
    skipWhenNotificationsSchemaIsMissing();

    $admin = User::factory()->create(['role' => 'admin']);
    [$user, $agency] = makeAgency(AgencyApprovalService::STATUS_PENDING);

    expect(notificationsFor($user->id)->where('type', 'account_approved')->count())->toBe(0);

    $this->actingAs($admin)->post("/admin/agencies/{$agency->id}/approve");

    $notification = notificationsFor($user->id)->where('type', 'account_approved')->first();

    expect($notification)->not->toBeNull();
    expect((string) $notification->data)->toContain('title');
});

it('stores a rejection notification for the agency user', function () {
    skipWhenNotificationsSchemaIsMissing();

    $admin = User::factory()->create(['role' => 'admin']);
    [$user, $agency] = makeAgency(AgencyApprovalService::STATUS_PENDING);

    $this->actingAs($admin)->post("/admin/agencies/{$agency->id}/reject", [
        'rejection_reason' => 'Permit could not be verified.',
    ]);

    $notification = notificationsFor($user->id)->where('type', 'account_rejected')->first();

    expect($notification)->not->toBeNull();
    expect((string) $notification->data)->toContain('rejected');
});

it('clears the rejection trail when a rejected agency is later approved', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    [, $agency] = makeAgency(AgencyApprovalService::STATUS_REJECTED, [
        'rejection_reason' => 'Earlier reason',
    ]);

    $this->actingAs($admin)->post("/admin/agencies/{$agency->id}/approve");

    $agency->refresh();

    expect($agency->status)->toBe(AgencyApprovalService::STATUS_APPROVED);
    expect($agency->rejection_reason)->toBeNull();
    expect($agency->rejected_at)->toBeNull();
});

it('shows the submitted agency information on the detail page', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    [, $agency] = makeAgency(AgencyApprovalService::STATUS_PENDING);

    $this->actingAs($admin)
        ->get("/admin/agencies/{$agency->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/AgencyDetails')
            ->where('agency.agency_name', 'Approval Test Agency')
            ->where('agency.license_number', 'PERMIT-1234')
            ->where('agency.contact_person', 'Test Contact')
            ->where('agency.address', '1 Test Street, Opol')
            ->where('agency.status', AgencyApprovalService::STATUS_PENDING))
        ->assertSee('Approval Test Agency')
        ->assertSee('PERMIT-1234')
        ->assertSee('Test Contact')
        ->assertSee('Test Street');
});

it('filters the review queue by status', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    makeAgency(AgencyApprovalService::STATUS_PENDING, ['agency_name' => 'Pending One']);
    makeAgency(AgencyApprovalService::STATUS_APPROVED, ['agency_name' => 'Approved One']);

    $this->actingAs($admin)
        ->get('/admin/agencies?status=approved')
        ->assertOk()
        ->assertSee('Approved One')
        ->assertDontSee('Pending One');
});

/* ------------------------------------------------------------------ */
/* Service behaviour                                                   */
/* ------------------------------------------------------------------ */

it('maps every status onto the correct portal block message', function () {
    $service = app(AgencyApprovalService::class);

    expect($service->blockReason(AgencyApprovalService::STATUS_APPROVED))->toBeNull();
    expect($service->blockReason(AgencyApprovalService::STATUS_PENDING))->toBe(AgencyApprovalService::PENDING_MESSAGE);
    expect($service->blockReason(AgencyApprovalService::STATUS_REJECTED))->toBe(AgencyApprovalService::REJECTED_MESSAGE);
    expect($service->blockReason(null))->toBe(AgencyApprovalService::MISSING_RECORD_MESSAGE);
});
