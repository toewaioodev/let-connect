<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentRequest;
use App\Models\MobileUser;
use App\Services\TelegramBotService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TelegramWebhookController extends Controller
{
    protected TelegramBotService $telegramService;
    protected array $adminChatIds = [];

    public function __construct(TelegramBotService $telegramService)
    {
        $this->telegramService = $telegramService;
        $adminChatIdStr = config('services.telegram.admin_chat_id', '');
        $this->adminChatIds = explode(',', str_replace(' ', '', $adminChatIdStr));
    }

    public function handle(Request $request)
    {
        // Webhook secret validation omitted as requested by user

        $logData = $request->all();
        
        // Extract callback query
        if (isset($logData['callback_query'])) {
            $callbackQuery = $logData['callback_query'];
            $this->processCallbackQuery($callbackQuery);
        }
        
        // Extract message for text commands
        if (isset($logData['message'])) {
            $message = $logData['message'];
            $this->processMessage($message);
        }

        // Always return 200 OK so Telegram doesn't retry
        return response()->json(['status' => 'ok']);
    }

    protected function processMessage(array $message)
    {
        $chatId = $message['chat']['id'] ?? null;
        $text = $message['text'] ?? '';
        
        if (!$chatId || empty($text)) {
            return;
        }

        // Authentication: only respond to configured admins
        if (!in_array((string)$chatId, $this->adminChatIds)) {
            return;
        }

        $parts = explode(' ', $text);
        $command = strtolower($parts[0]);

        switch ($command) {
            case '/stats':
                $this->handleStatsCommand($chatId);
                break;
            case '/pending':
                $this->handlePendingCommand($chatId);
                break;
            case '/user':
                $this->handleUserCommand($chatId, $parts);
                break;
            case '/premium':
                $this->handlePremiumCommand($chatId, $parts);
                break;
        }
    }

    protected function handleStatsCommand($chatId)
    {
        $totalUsers = MobileUser::count();
        $premiumUsers = MobileUser::where('is_premium', true)
                                  ->where('premium_expires_at', '>', now())
                                  ->count();
        $pendingPayments = PaymentRequest::where('status', 'pending')->count();
        $approvedPayments = PaymentRequest::where('status', 'approved')->count();

        $text = "📊 *Server Statistics*\n\n"
              . "👥 *Total Users:* {$totalUsers}\n"
              . "⭐️ *Active Premium Users:* {$premiumUsers}\n"
              . "⏳ *Pending Payments:* {$pendingPayments}\n"
              . "✅ *Approved Payments:* {$approvedPayments}";

        $this->telegramService->sendMessage($chatId, $text);
    }

    protected function handlePendingCommand($chatId)
    {
        $pending = PaymentRequest::where('status', 'pending')
                    ->orderBy('created_at', 'asc')
                    ->take(5)
                    ->get();

        if ($pending->isEmpty()) {
            $this->telegramService->sendMessage($chatId, "🎉 *No pending payments right now!*");
            return;
        }

        $text = "⏳ *Top 5 Oldest Pending Payments*\n\n";
        foreach ($pending as $p) {
            $date = $p->created_at->diffForHumans();
            $text .= "- ID: `{$p->id}` | {$p->sender_name} | {$p->plan_price} ({$date})\n";
        }
        $text .= "\n_Use your dashboard to handle them if you missed the initial notification._";

        $this->telegramService->sendMessage($chatId, $text);
    }

    protected function handleUserCommand($chatId, array $parts)
    {
        if (count($parts) < 2) {
            $this->telegramService->sendMessage($chatId, "⚠️ *Usage:* `/user [device_id]`");
            return;
        }

        $deviceId = $parts[1];
        $user = MobileUser::where('device_id', $deviceId)->first();

        if (!$user) {
            $this->telegramService->sendMessage($chatId, "❌ User not found with Device ID: `{$deviceId}`");
            return;
        }

        $premiumStatus = $user->is_premium ? "✅ Active" : "❌ Inactive";
        $expires = $user->premium_expires_at ? Carbon::parse($user->premium_expires_at)->format('Y-m-d H:i') : "N/A";

        $text = "👤 *User Info*\n\n"
              . "📱 *Device ID:* `{$user->device_id}`\n"
              . "📅 *Registered:* {$user->created_at->format('Y-m-d')}\n"
              . "⏱ *Last Login:* {$user->last_login}\n"
              . "⭐️ *Premium:* {$premiumStatus}\n"
              . "⏳ *Expires At:* {$expires}";

        $this->telegramService->sendMessage($chatId, $text);
    }

    protected function handlePremiumCommand($chatId, array $parts)
    {
        if (count($parts) < 3) {
            $this->telegramService->sendMessage($chatId, "⚠️ *Usage:* `/premium [device_id] [days]`\nExample: `/premium 1234abcd 30`");
            return;
        }

        $deviceId = $parts[1];
        $days = (int) $parts[2];

        if ($days <= 0) {
            $this->telegramService->sendMessage($chatId, "❌ Days must be greater than 0");
            return;
        }

        $user = MobileUser::where('device_id', $deviceId)->first();

        if (!$user) {
            $this->telegramService->sendMessage($chatId, "❌ User not found with Device ID: `{$deviceId}`");
            return;
        }

        $currentExpiresAt = $user->premium_expires_at && now()->isBefore($user->premium_expires_at)
            ? Carbon::parse($user->premium_expires_at)
            : now();

        $user->update([
            'is_premium' => true,
            'premium_expires_at' => $currentExpiresAt->addDays($days),
        ]);

        $this->telegramService->sendMessage($chatId, "✅ Successfully added *{$days} days* of premium to Device ID `{$deviceId}`.\nNew Expiration: {$user->premium_expires_at->format('Y-m-d H:i')}");
    }

    protected function processCallbackQuery(array $callbackQuery)
    {
        $data = $callbackQuery['data'] ?? '';
        $callbackQueryId = $callbackQuery['id'];
        $message = $callbackQuery['message'] ?? null;
        $chatId = $message['chat']['id'] ?? null;
        $messageId = $message['message_id'] ?? null;
        $from = $callbackQuery['from']['username'] ?? $callbackQuery['from']['first_name'] ?? 'Admin';

        if (empty($data)) {
            return;
        }

        if (Str::startsWith($data, 'approve_')) {
            $paymentId = str_replace('approve_', '', $data);
            $this->approvePayment($paymentId, $callbackQueryId, $chatId, $messageId, $from);
        } elseif (Str::startsWith($data, 'reject_')) {
            $paymentId = str_replace('reject_', '', $data);
            $this->rejectPayment($paymentId, $callbackQueryId, $chatId, $messageId, $from);
        }
    }

    protected function approvePayment($paymentId, $callbackQueryId, $chatId, $messageId, $adminName)
    {
        $paymentRequest = PaymentRequest::find($paymentId);

        if (!$paymentRequest) {
            $this->telegramService->answerCallbackQuery($callbackQueryId, 'Payment request not found!', true);
            return;
        }

        if ($paymentRequest->status !== 'pending') {
            $this->telegramService->answerCallbackQuery($callbackQueryId, "Payment already {$paymentRequest->status}!", true);
            return;
        }

        $paymentRequest->update([
            'status' => 'approved',
            'reviewed_by' => null, // Bot approval, could use a specific admin account id if needed
            'reviewed_at' => now(),
            'admin_note' => "Approved via Telegram by {$adminName}",
        ]);

        $user = $paymentRequest->mobileUser;
        if ($user) {
            $durationDays = 30; // Default
            if (Str::contains($paymentRequest->plan_id, 'monthly')) $durationDays = 30;
            elseif (Str::contains($paymentRequest->plan_id, '3months')) $durationDays = 90;
            elseif (Str::contains($paymentRequest->plan_id, '5months')) $durationDays = 150;
            elseif (Str::contains($paymentRequest->plan_id, 'yearly')) $durationDays = 365;

            $currentExpiresAt = $user->premium_expires_at && now()->isBefore($user->premium_expires_at)
                ? Carbon::parse($user->premium_expires_at)
                : now();

            $user->update([
                'is_premium' => true,
                'premium_expires_at' => $currentExpiresAt->addDays($durationDays),
            ]);
        }

        // Notify telegram that operation was successful
        $this->telegramService->answerCallbackQuery($callbackQueryId, 'Payment Approved!');

        // Update the message so buttons are removed
        if ($chatId && $messageId) {
            $newCaption = "✅ *Payment Approved*\n\n"
                . "👤 *Sender:* {$paymentRequest->sender_name}\n"
                . "📱 *Device ID:* {$paymentRequest->device_id}\n"
                . "💳 *Plan:* {$paymentRequest->plan_name} ({$paymentRequest->plan_price})\n"
                . "📄 *Transaction ID:* {$paymentRequest->transaction_id}\n\n"
                . "👉 _Approved by: {$adminName}_";

            $this->telegramService->editMessageText($chatId, $messageId, $newCaption);
        }
    }

    protected function rejectPayment($paymentId, $callbackQueryId, $chatId, $messageId, $adminName)
    {
        $paymentRequest = PaymentRequest::find($paymentId);

        if (!$paymentRequest) {
            $this->telegramService->answerCallbackQuery($callbackQueryId, 'Payment request not found!', true);
            return;
        }

        if ($paymentRequest->status !== 'pending') {
            $this->telegramService->answerCallbackQuery($callbackQueryId, "Payment already {$paymentRequest->status}!", true);
            return;
        }

        $paymentRequest->update([
            'status' => 'rejected',
            'reviewed_by' => null,
            'reviewed_at' => now(),
            'admin_note' => "Rejected via Telegram by {$adminName}",
        ]);

        $this->telegramService->answerCallbackQuery($callbackQueryId, 'Payment Rejected!');

        if ($chatId && $messageId) {
            $newCaption = "❌ *Payment Rejected*\n\n"
                . "👤 *Sender:* {$paymentRequest->sender_name}\n"
                . "📱 *Device ID:* {$paymentRequest->device_id}\n"
                . "💳 *Plan:* {$paymentRequest->plan_name} ({$paymentRequest->plan_price})\n"
                . "📄 *Transaction ID:* {$paymentRequest->transaction_id}\n\n"
                . "👉 _Rejected by: {$adminName}_";

            $this->telegramService->editMessageText($chatId, $messageId, $newCaption);
        }
    }
}
