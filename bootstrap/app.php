<?php

use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
            'staff' => \App\Http\Middleware\EnsureStaff::class,
            'establishment' => \App\Http\Middleware\EnsureEstablishment::class,
            'agency' => \App\Http\Middleware\EnsureAgency::class,
            'job_seeker' => \App\Http\Middleware\EnsureJobSeeker::class,
            'sanctum' => \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        Authenticate::redirectUsing(function ($request) {
            if ($request->is('establishment/*')) {
                return route('establishment.login');
            }
            if ($request->is('agency/*')) {
                return route('agency.login');
            }
            return route('peso.login');
        });

        RedirectIfAuthenticated::redirectUsing(function (Request $request) {
            $role = strtolower((string) ($request->user()?->role ?? ''));

            return match ($role) {
                'admin' => route('admin.dashboard'),
                'staff' => route('staff.dashboard'),
                'establishment' => route('establishment.dashboard'),
                'agency' => route('agency.dashboard'),
                'job_seeker' => route('jobseeker.dashboard'),
                default => route('peso.login'),
            };
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
