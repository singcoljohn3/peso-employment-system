<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureEstablishment
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('establishment.login');
        }

        $role = strtolower((string) (Auth::user()->role ?? ''));

        if ($role !== 'establishment') {
            Auth::logout();
            return redirect()->route('establishment.login')->with('status', 'Access denied. Establishment privileges required.');
        }

        return $next($request);
    }
}
