<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureJobSeeker
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('peso.login');
        }

        if (Auth::user()->role !== 'job_seeker') {
            Auth::logout();
            return redirect()->route('peso.login')->with('status', 'Access denied. Job seeker privileges required.');
        }

        return $next($request);
    }
}
