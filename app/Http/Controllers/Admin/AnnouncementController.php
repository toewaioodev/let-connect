<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/announcements/index', [
            'announcements' => Announcement::orderBy('id', 'desc')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'url' => 'nullable|url',
            'is_active' => 'boolean',
            'min_version_code' => 'integer|min:0',
        ]);

        $validated['min_version_code'] = $validated['min_version_code'] ?? 0;

        if ($validated['is_active']) {
            Announcement::where('is_active', true)->update(['is_active' => false]);
        }

        Announcement::create($validated);

        return redirect()->back()->with('success', 'Announcement added successfully.');
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'url' => 'nullable|url',
            'is_active' => 'boolean',
            'min_version_code' => 'integer|min:0',
        ]);

        $validated['min_version_code'] = $validated['min_version_code'] ?? 0;

        if ($validated['is_active']) {
            Announcement::where('is_active', true)->where('id', '!=', $announcement->id)->update(['is_active' => false]);
        }

        $announcement->update($validated);

        return redirect()->back()->with('success', 'Announcement updated successfully.');
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return redirect()->back()->with('success', 'Announcement deleted successfully.');
    }
}
