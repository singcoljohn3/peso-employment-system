<?php

namespace App\Http\Middleware;

use App\Models\Establishment;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $establishment = null;

        if ($user && strtolower((string) ($user->role ?? '')) === 'establishment') {
            $establishment = Establishment::with('barangay')
                ->where('user_id', $user->id)
                ->first();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'establishment' => $establishment,
        ];
    }
}
