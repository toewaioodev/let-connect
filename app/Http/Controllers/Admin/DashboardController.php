<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Announcement;
use App\Models\MobileUser;
use App\Models\PaymentRequest;
use App\Models\RedeemKey;
use App\Models\Server;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalUsers = MobileUser::count();
        $premiumUsers = MobileUser::where('is_premium', true)->count();
        $freeUsers = $totalUsers - $premiumUsers;
        $newUsersToday = MobileUser::whereDate('created_at', today())->count();
        $newUsersThisWeek = MobileUser::where('created_at', '>=', Carbon::now()->startOfWeek())->count();
        $dailyActiveUsers = MobileUser::whereDate('last_login', today())->count();

        $pendingPayments = PaymentRequest::where('status', 'pending')->count();
        $approvedPayments = PaymentRequest::where('status', 'approved')->count();
        $rejectedPayments = PaymentRequest::where('status', 'rejected')->count();

        $activeServers = Server::where('is_active', true)->count();
        $totalServers = Server::count();
        $premiumServers = Server::where('is_premium', true)->where('is_active', true)->count();

        $recentPayments = PaymentRequest::with('mobileUser')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'mobile_user_id', 'device_id', 'plan_name', 'plan_price', 'sender_name', 'status', 'created_at']);

        $recentUsers = MobileUser::orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'device_id', 'device_model', 'is_premium', 'created_at', 'last_login']);

        // New registrations per day for the last 7 days
        $registrationChart = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::now()->subDays($daysAgo);

            return [
                'date' => $date->format('M d'),
                'count' => MobileUser::whereDate('created_at', $date->toDateString())->count(),
            ];
        })->values();

        $activeAnnouncement = Announcement::where('is_active', true)->latest()->first(['id', 'message', 'url', 'is_active', 'min_version_code']);
        $activeAds = Ad::where('is_active', true)->count();
        $unusedKeys = RedeemKey::where('is_used', false)->count();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'premiumUsers' => $premiumUsers,
                'freeUsers' => $freeUsers,
                'newUsersToday' => $newUsersToday,
                'newUsersThisWeek' => $newUsersThisWeek,
                'dailyActiveUsers' => $dailyActiveUsers,
                'pendingPayments' => $pendingPayments,
                'approvedPayments' => $approvedPayments,
                'rejectedPayments' => $rejectedPayments,
                'activeServers' => $activeServers,
                'totalServers' => $totalServers,
                'premiumServers' => $premiumServers,
                'activeAds' => $activeAds,
                'unusedKeys' => $unusedKeys,
            ],
            'recentPayments' => $recentPayments,
            'recentUsers' => $recentUsers,
            'registrationChart' => $registrationChart,
            'activeAnnouncement' => $activeAnnouncement,
        ]);
    }
}
