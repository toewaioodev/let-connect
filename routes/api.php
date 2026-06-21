<?php

use App\Http\Controllers\Api\MobileAppController;
use App\Http\Middleware\MobileApiToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Mobile App API
Route::prefix('mobile')->group(function () {
    // Public: gets a token on first launch
    Route::post('/register', [MobileAppController::class, 'register']);

    // Protected: require a valid API token
    Route::middleware(MobileApiToken::class)->group(function () {
        Route::get('/configs', [MobileAppController::class, 'getConfigs']);
        Route::post('/redeem', [MobileAppController::class, 'redeemKey']);
        Route::post('/custom-server/redeem', [MobileAppController::class, 'redeemCustomServer']);
        Route::post('/payment', [MobileAppController::class, 'submitPayment']);
        Route::get('/payment/history', [MobileAppController::class, 'getPaymentHistory']);
    });
});

Route::post('/telegram/webhook', [\App\Http\Controllers\Api\TelegramWebhookController::class, 'handle']);
