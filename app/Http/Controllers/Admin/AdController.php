<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/ads/index', [
            'ads' => Ad::orderBy('id', 'desc')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image_url' => 'required|string|url',
            'target_url' => 'required|string|url',
            'is_active' => 'boolean',
        ]);

        Ad::create($validated);

        return redirect()->back()->with('success', 'Ad added successfully.');
    }

    public function update(Request $request, Ad $ad): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image_url' => 'required|string|url',
            'target_url' => 'required|string|url',
            'is_active' => 'boolean',
        ]);

        $ad->update($validated);

        return redirect()->back()->with('success', 'Ad updated successfully.');
    }

    public function destroy(Ad $ad): RedirectResponse
    {
        $ad->delete();

        return redirect()->back()->with('success', 'Ad deleted successfully.');
    }
}
