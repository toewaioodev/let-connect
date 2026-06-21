<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RedeemKey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RedeemKeyController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/keys/index', [
            'keys' => RedeemKey::orderBy('id', 'desc')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'duration_days' => 'required|integer|min:1',
            'count' => 'required|integer|min:1|max:100',
        ]);

        for ($i = 0; $i < $request->count; $i++) {
            RedeemKey::create([
                'key_code' => strtoupper(Str::random(12)),
                'duration_days' => $request->duration_days,
            ]);
        }

        return redirect()->back()->with('success', "{$request->count} keys generated successfully.");
    }

    public function destroy(RedeemKey $redeemKey): RedirectResponse
    {
        $redeemKey->delete();

        return redirect()->back()->with('success', 'Key deleted successfully.');
    }
}
