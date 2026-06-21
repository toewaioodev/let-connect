<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Server;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/servers/index', [
            'servers' => Server::orderBy('order_index')->orderBy('id', 'desc')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'flag_code' => 'required|string|max:10',
            'protocol' => 'required|in:vless,vmess,trojan,shadowsocks',
            'config_uri' => 'required|string',
            'is_premium' => 'boolean',
            'is_custom' => 'boolean',
            'is_active' => 'boolean',
            'order_index' => 'integer',
        ]);

        Server::create($validated);

        return redirect()->back()->with('success', 'Server added successfully.');
    }

    public function update(Request $request, Server $server): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'flag_code' => 'required|string|max:10',
            'protocol' => 'required|in:vless,vmess,trojan,shadowsocks',
            'config_uri' => 'required|string',
            'is_premium' => 'boolean',
            'is_custom' => 'boolean',
            'is_active' => 'boolean',
            'order_index' => 'integer',
        ]);

        $server->update($validated);

        return redirect()->back()->with('success', 'Server updated successfully.');
    }

    public function destroy(Server $server): RedirectResponse
    {
        $server->delete();

        return redirect()->back()->with('success', 'Server deleted successfully.');
    }

    public function toggle(Server $server): RedirectResponse
    {
        $server->update(['is_active' => !$server->is_active]);

        return redirect()->back()->with('success', 'Server status toggled.');
    }
}
