<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureBaranggay
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('barangay.login');
        }

        if (Auth::user()->role !== 'baranggay') {
            Auth::logout();
            return redirect()->route('barangay.login')->with('status', 'Access denied. Barangay privileges required.');
        }

        return $next($request);
    }
}
