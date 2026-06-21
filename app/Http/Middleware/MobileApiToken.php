<?php

namespace App\Http\Middleware;

use App\Models\MobileUser;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MobileApiToken
{
    /**
     * Validate the Bearer token for mobile API routes and bind the resolved
     * MobileUser onto the request so controllers can call $request->attributes->get('mobile_user').
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (empty($token)) {
            return response()->json(['error' => 'Missing Authorization header'], 401);
        }

        $user = MobileUser::where('api_token', $token)->first();

        if (! $user) {
            return response()->json(['error' => 'Invalid API token'], 401);
        }

        // Update last login to track activity when the API is hit
        $user->update(['last_login' => now()]);

        // Bind the authenticated mobile user so controllers can use it directly
        $request->attributes->set('mobile_user', $user);

        return $next($request);
    }
}
