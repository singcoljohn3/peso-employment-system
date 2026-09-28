<?php

use App\Models\Agency;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

/**
 * These assertions deliberately avoid the database: this environment has no
 * pdo_sqlite, so anything that touches the DB cannot be exercised here.
 */

function userWithRole(string $role): User
{
    $user = new User();
    $user->id = 999;
    $user->name = 'Probe';
    $user->email = 'probe@example.com';
    $user->role = $role;

    return $user;
}

it('sends a logged-in agency user visiting /agency/login to the agency dashboard', function () {
    $user = userWithRole('Agency');
    Auth::setUser($user);

    $this->get('/agency/login')->assertRedirect(route('agency.dashboard'));
});

it('sends a logged-in agency user visiting /agency/register to the agency dashboard', function () {
    Auth::setUser(userWithRole('Agency'));

    $this->get('/agency/register')->assertRedirect(route('agency.dashboard'));
});

it('sends a logged-in establishment user visiting /agency/login to the establishment dashboard', function () {
    Auth::setUser(userWithRole('Establishment'));

    $this->get('/agency/login')->assertRedirect(route('establishment.dashboard'));
});

it('sends a logged-in establishment user visiting /establishment/login to the establishment dashboard', function () {
    Auth::setUser(userWithRole('Establishment'));

    $this->get('/establishment/login')->assertRedirect(route('establishment.dashboard'));
});

it('routes an agency user from / to the agency dashboard', function () {
    Auth::setUser(userWithRole('Agency'));

    $this->get('/')->assertRedirect(route('agency.dashboard'));
});

it('routes an agency user from /dashboard to the agency dashboard', function () {
    Auth::setUser(userWithRole('Agency'));

    $this->get('/dashboard')->assertRedirect(route('agency.dashboard'));
});

it('routes an agency user from /peso-login to the agency dashboard', function () {
    Auth::setUser(userWithRole('Agency'));

    $this->get('/peso-login')->assertRedirect(route('agency.dashboard'));
});

it('routes an establishment user from /dashboard to the establishment dashboard', function () {
    Auth::setUser(userWithRole('Establishment'));

    $this->get('/dashboard')->assertRedirect(route('establishment.dashboard'));
});

it('routes a job seeker from /dashboard to the job seeker dashboard', function () {
    Auth::setUser(userWithRole('Job Seeker'));

    $this->get('/dashboard')->assertRedirect(route('jobseeker.dashboard'));
});

it('sends a guest to the agency login page, not the establishment login page', function () {
    $this->get('/agency/profile')->assertRedirect(route('agency.login'));
});

it('sends a guest to the establishment login page', function () {
    $this->get('/establishment/profile')->assertRedirect(route('establishment.login'));
});

it('ignores a stale establishment url.intended after a successful agency login', function () {
    $user = User::factory()->create(['role' => 'Agency']);

    Agency::create([
        'user_id' => $user->id,
        'agency_name' => 'Probe Agency',
        'contact_person' => 'Probe',
        'email' => $user->email,
        'contact_number' => '09171234567',
        'address' => 'Somewhere',
        'status' => 'approved',
    ]);

    $this->post('/agency/login', ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('agency.dashboard'));

    $this->post('/agency/login', ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('agency.dashboard'));
});

it('honours an in-scope agency url.intended after a successful agency login', function () {
    $user = User::factory()->create(['role' => 'Agency']);

    Agency::create([
        'user_id' => $user->id,
        'agency_name' => 'Probe Agency',
        'contact_person' => 'Probe',
        'email' => $user->email,
        'contact_number' => '09171234567',
        'address' => 'Somewhere',
        'status' => 'approved',
    ]);

    $this->withSession(['url.intended' => route('agency.jobs')])
        ->post('/agency/login', ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('agency.jobs'));
});

it('ignores a stale agency url.intended after a successful establishment login', function () {
    $user = User::factory()->create(['role' => 'Establishment']);

    $this->withSession(['url.intended' => route('agency.dashboard')])
        ->post('/establishment/login', ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('establishment.dashboard'));
});

it('keeps agency accounts out of the establishment portal', function () {
    $user = User::factory()->create(['role' => 'Agency']);

    Agency::create([
        'user_id' => $user->id,
        'agency_name' => 'Probe Agency',
        'contact_person' => 'Probe',
        'email' => $user->email,
        'contact_number' => '09171234567',
        'address' => 'Somewhere',
        'status' => 'approved',
    ]);

    $this->actingAs($user)
        ->get('/establishment/dashboard')
        ->assertRedirect(route('establishment.login'));
});
