<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MobileUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MobileUserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => MobileUser::orderBy('id', 'desc')->paginate(50),
        ]);
    }

    public function togglePremium(Request $request, MobileUser $mobileUser): RedirectResponse
    {
        $request->validate([
            'duration_days' => 'nullable|integer|min:0',
        ]);

        if ($mobileUser->is_premium) {
            $mobileUser->update([
                'is_premium' => false,
                'premium_expires_at' => null,
            ]);
        } else {
            $duration = $request->input('duration_days', 30);
            $mobileUser->update([
                'is_premium' => true,
                'premium_expires_at' => now()->addDays($duration),
            ]);
        }

        return redirect()->back()->with('success', 'User premium status updated.');
    }
}
