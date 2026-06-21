<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomServerKey;
use App\Models\Server;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomServerKeyController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/custom-keys/index', [
            'servers' => Server::where('is_custom', true)->get(),
            'keys' => CustomServerKey::with(['usedByUser', 'server'])
                ->orderBy('id', 'desc')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'server_id' => 'required|exists:servers,id',
            'count' => 'required|integer|min:1|max:100',
        ]);

        $server = Server::findOrFail($request->server_id);
        
        if (!$server->is_custom) {
            abort(404, 'This server is not a custom server.');
        }

        for ($i = 0; $i < $request->count; $i++) {
            CustomServerKey::create([
                'server_id' => $server->id,
                'key_code' => strtoupper(Str::random(12)),
            ]);
        }

        return redirect()->back()->with('success', "{$request->count} keys generated successfully for server {$server->name}.");
    }

    public function destroy(CustomServerKey $customKey): RedirectResponse
    {
        $customKey->delete();

        return redirect()->back()->with('success', 'Custom server key deleted successfully.');
    }
}
