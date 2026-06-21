<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Announcement;
use App\Models\MobileUser;
use App\Models\PaymentRequest;
use App\Models\RedeemKey;
use App\Models\Server;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\TelegramBotService;

class MobileAppController extends Controller
{
    /**
     * Resolve the authenticated MobileUser bonded by MobileApiToken middleware.
     */
    private function mobileUser(Request $request): MobileUser
    {
        return $request->attributes->get('mobile_user');
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'deviceId' => 'required|string',
            'deviceModel' => 'nullable|string',
            'osVersion' => 'nullable|string',
        ]);

        $user = MobileUser::where('device_id', $validated['deviceId'])->first();

        if ($user) {
            $user->update(['last_login' => now()]);

            if ($user->is_premium && $user->premium_expires_at && now()->isAfter($user->premium_expires_at)) {
                $user->update([
                    'is_premium' => false,
                    'premium_expires_at' => null,
                ]);
            }

            return response()->json([
                'apiToken' => $user->api_token,
                'isPremium' => $user->is_premium,
                'userId' => (string) $user->id,
                'expiresAt' => $user->premium_expires_at?->format('Y-m-d H:i:s'),
                'message' => 'Login successful',
            ]);
        }

        $apiToken = Str::random(64);

        $user = MobileUser::create([
            'device_id' => $validated['deviceId'],
            'api_token' => $apiToken,
            'device_model' => $validated['deviceModel'] ?? null,
            'os_version' => $validated['osVersion'] ?? null,
            'last_login' => now(),
        ]);

        return response()->json([
            'apiToken' => $apiToken,
            'isPremium' => false,
            'userId' => (string) $user->id,
            'expiresAt' => null,
            'message' => 'Registration successful',
        ]);
    }

    public function getConfigs(Request $request): JsonResponse
    {
        // Token already validated by MobileApiToken middleware
        $user = $this->mobileUser($request);

        // Check premium expiration
        if ($user->is_premium && $user->premium_expires_at && now()->isAfter($user->premium_expires_at)) {
            $user->update([
                'is_premium' => false,
                'premium_expires_at' => null,
            ]);
        }

        $ads = Ad::where('is_active', true)
            ->orderBy('id', 'desc')
            ->get(['id', 'title', 'image_url as imageUrl', 'target_url as targetUrl'])
            ->map(function ($ad) {
                $ad->id = (string) $ad->id;

                return $ad;
            });

        $servers = Server::where('is_active', true)
            ->orderBy('is_premium', 'asc')
            ->orderBy('order_index', 'asc')
            ->get();

        $announcement = Announcement::where('is_active', true)
            ->orderBy('id', 'desc')
            ->first(['message', 'url', 'is_active as isActive', 'min_version_code as minVersionCode']);

        if ($announcement) {
            $announcement->isActive = (bool) $announcement->isActive;
            $announcement->minVersionCode = (int) $announcement->minVersionCode;
        }

        // Fetch custom server IDs unlocked by the user
        $unlockedCustomServerIds = \App\Models\CustomServerKey::where('used_by_user_id', $user->id)
            ->pluck('server_id')
            ->toArray();

        $configs = $servers->map(function ($server) use ($user, $unlockedCustomServerIds) {
            $isUnlockedCustom = in_array($server->id, $unlockedCustomServerIds);
            $configUri = '';

            if ($server->is_custom) {
                // Custom servers enforce specific unlock keys
                if ($isUnlockedCustom) {
                    $configUri = $server->config_uri;
                }
            } else {
                // Regular servers enforce premium plan
                if (! $server->is_premium || $user->is_premium) {
                    $configUri = $server->config_uri;
                }
            }

            return [
                'id' => (string) $server->id,
                'uri' => $configUri,
                'isPremium' => $server->is_premium,
                'isCustom' => $server->is_custom,
                'isUnlocked' => $server->is_custom ? $isUnlockedCustom : ((! $server->is_premium) || $user->is_premium),
                'tag' => $server->name,
                'flag' => $server->flag_code,
            ];
        });

        return response()->json([
            'message' => 'Configs retrieved successfully',
            'userInfo' => [
                'isPremium' => $user->is_premium,
                'expiresAt' => $user->premium_expires_at?->format('Y-m-d H:i:s'),
                'userId' => (string) $user->id,
            ],
            'ads' => $ads,
            'configs' => $configs,
            'announcement' => $announcement,
        ]);
    }

    public function redeemCustomServer(Request $request): JsonResponse
    {
        $user = $this->mobileUser($request);

        $validated = $request->validate([
            'key_code' => 'required|string',
            'server_id' => 'required|integer',
        ]);

        // One server → one user exclusively: reject if ANY user has already unlocked this server
        $serverTaken = \App\Models\CustomServerKey::where('server_id', $validated['server_id'])
            ->whereNotNull('used_by_user_id')
            ->exists();

        if ($serverTaken) {
            // Let the owner re-confirm silently (same user already holds it)
            $alreadyOwner = \App\Models\CustomServerKey::where('server_id', $validated['server_id'])
                ->where('used_by_user_id', $user->id)
                ->exists();

            if ($alreadyOwner) {
                return response()->json(['error' => 'You have already unlocked this server'], 400);
            }

            return response()->json(['error' => 'This server has already been claimed by another user'], 400);
        }

        $key = \App\Models\CustomServerKey::where('key_code', $validated['key_code'])
            ->where('server_id', $validated['server_id'])
            ->first();

        if (! $key) {
            return response()->json(['error' => 'Invalid key for this server'], 400);
        }

        if ($key->is_used) {
            return response()->json(['error' => 'This key has already been used'], 400);
        }

        $key->update([
            'is_used' => true,
            'used_by_user_id' => $user->id,
            'used_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Custom server unlocked successfully',
        ]);
    }

    public function redeemKey(Request $request): JsonResponse
    {
        // Token already validated by MobileApiToken middleware
        $user = $this->mobileUser($request);

        $keyCode = $request->input('keyCode');

        if (! $keyCode) {
            return response()->json(['error' => 'Redeem key is required'], 400);
        }

        // One key per user: reject if this device has already redeemed any key
        // $alreadyRedeemed = RedeemKey::where('used_by_device', $user->device_id)->exists();
        // if ($alreadyRedeemed) {
        //     return response()->json(['error' => 'This device has already redeemed a key. Each device may only use one redeem key.'], 400);
        // }

        $key = RedeemKey::where('key_code', $keyCode)->where('is_used', false)->first();

        if (! $key) {
            return response()->json(['error' => 'Invalid or already used key'], 400);
        }

        // Apply premium
        $currentExpiresAt = $user->premium_expires_at && now()->isBefore($user->premium_expires_at)
            ? Carbon::parse($user->premium_expires_at)
            : now();

        $newExpiresAt = $currentExpiresAt->addDays($key->duration_days);

        $user->update([
            'is_premium' => true,
            'premium_expires_at' => $newExpiresAt,
        ]);

        $key->update([
            'is_used' => true,
            'used_by_device' => $user->device_id,
            'used_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Premium activated for {$key->duration_days} days",
            'isPremium' => true,
            'expiresAt' => $newExpiresAt->format('Y-m-d H:i:s'),
        ]);
    }

    public function submitPayment(Request $request, TelegramBotService $telegramService): JsonResponse
    {
        // Token already validated by MobileApiToken middleware
        $user = $this->mobileUser($request);

        $validated = $request->validate([
            'device_id' => 'required|string',
            'plan_id' => 'required|string',
            'plan_name' => 'required|string',
            'plan_price' => 'required|string',
            'transaction_id' => 'required|string|unique:payment_requests,transaction_id',
            'sender_name' => 'required|string',
            'email' => 'nullable|email',
            'screenshot_data' => 'required|string', // Base64 data URI
        ]);

        $paymentRequest = PaymentRequest::create([
            'mobile_user_id' => $user->id,
            'device_id' => $validated['device_id'],
            'plan_id' => $validated['plan_id'],
            'plan_name' => $validated['plan_name'],
            'plan_price' => $validated['plan_price'],
            'transaction_id' => $validated['transaction_id'],
            'sender_name' => $validated['sender_name'],
            'email' => $validated['email'],
            'screenshot_data' => $validated['screenshot_data'],
            'status' => 'pending',
        ]);

        // Trigger Telegram notification
        $telegramService->sendPaymentNotification($paymentRequest);

        return response()->json([
            'success' => true,
            'request_id' => $paymentRequest->id,
            'message' => 'Payment request submitted successfully. Awaiting admin approval.',
        ]);
    }

    public function getPaymentHistory(Request $request): JsonResponse
    {
        $user = $this->mobileUser($request);

        $history = PaymentRequest::where('mobile_user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get([
                'id',
                'plan_name',
                'plan_price',
                'transaction_id',
                'status',
                'admin_note',
                'created_at',
                'reviewed_at',
            ]);
        // "admin_note"),
        //          createdAt     = obj.optString("created_at"),
        //          reviewedAt    = obj.optString("reviewed_at"),

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }
}
