<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AdController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\MobileUserController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\RedeemKeyController;
use App\Http\Controllers\Admin\ServerController;
use App\Http\Controllers\Admin\CustomServerKeyController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        // Servers
        Route::get('servers', [ServerController::class, 'index'])->name('servers.index');
        Route::post('servers', [ServerController::class, 'store'])->name('servers.store');
        Route::put('servers/{server}', [ServerController::class, 'update'])->name('servers.update');
        Route::delete('servers/{server}', [ServerController::class, 'destroy'])->name('servers.destroy');
        Route::post('servers/{server}/toggle', [ServerController::class, 'toggle'])->name('servers.toggle');

        // Ads
        Route::get('ads', [AdController::class, 'index'])->name('ads.index');
        Route::post('ads', [AdController::class, 'store'])->name('ads.store');
        Route::put('ads/{ad}', [AdController::class, 'update'])->name('ads.update');
        Route::delete('ads/{ad}', [AdController::class, 'destroy'])->name('ads.destroy');

        // Payments
        Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::post('payments/{paymentRequest}/approve', [PaymentController::class, 'approve'])->name('payments.approve');
        Route::post('payments/{paymentRequest}/reject', [PaymentController::class, 'reject'])->name('payments.reject');

        // Redeem Keys
        Route::get('keys', [RedeemKeyController::class, 'index'])->name('keys.index');
        Route::post('keys', [RedeemKeyController::class, 'store'])->name('keys.store');
        Route::delete('keys/{redeemKey}', [RedeemKeyController::class, 'destroy'])->name('keys.destroy');

        // Custom Server Keys
        Route::get('custom-keys', [CustomServerKeyController::class, 'index'])->name('custom-keys.index');
        Route::post('custom-keys', [CustomServerKeyController::class, 'store'])->name('custom-keys.store');
        Route::delete('custom-keys/{customKey}', [CustomServerKeyController::class, 'destroy'])->name('custom-keys.destroy');

        // Announcements
        Route::get('announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
        Route::post('announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
        Route::put('announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
        Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

        // Mobile Users
        Route::get('users', [MobileUserController::class, 'index'])->name('users.index');
        Route::post('users/{mobileUser}/toggle-premium', [MobileUserController::class, 'togglePremium'])->name('users.toggle-premium');
    });
});

require __DIR__.'/settings.php';
