<?php

namespace App\Services;

use App\Models\PaymentRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramBotService
{
    protected string $botToken;
    protected string $apiUrl = 'https://api.telegram.org/bot';
    protected string $adminChatId;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token', '');
        $this->adminChatId = config('services.telegram.admin_chat_id', '');
    }

    protected function getUrl(string $method): string
    {
        return $this->apiUrl . $this->botToken . '/' . $method;
    }

    public function sendPaymentNotification(PaymentRequest $payment): bool
    {
        if (empty($this->botToken) || empty($this->adminChatId)) {
            Log::warning('Telegram bot token or admin chat ID not configured.');
            return false;
        }

        $chatIds = explode(',', str_replace(' ', '', $this->adminChatId));

        $caption = "🆕 *New Payment Request*\n\n"
            . "👤 *Sender:* {$payment->sender_name}\n"
            . "📱 *Device ID:* {$payment->device_id}\n"
            . "💳 *Plan:* {$payment->plan_name} ({$payment->plan_price})\n"
            . "📄 *Transaction ID:* {$payment->transaction_id}\n\n"
            . "Please review this request.";

        $keyboard = [
            'inline_keyboard' => [
                [
                    ['text' => '✅ Accept', 'callback_data' => 'approve_' . $payment->id],
                    ['text' => '❌ Reject', 'callback_data' => 'reject_' . $payment->id],
                ]
            ]
        ];

        // Process base64 image data
        $screenshotData = $payment->screenshot_data;
        $hasImage = false;
        $fileContent = null;
        $filename = null;
        
        if ($screenshotData && preg_match('/^data:image\/(\w+);base64,/', $screenshotData, $type)) {
            $base64Data = substr($screenshotData, strpos($screenshotData, ',') + 1);
            $extension = strtolower($type[1]); // jpg, png, etc.
            if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                $extension = 'png';
            }
            $fileContent = base64_decode($base64Data);
            $filename = 'screenshot_' . $payment->id . '.' . $extension;
            $hasImage = true;
        }

        $allSuccessful = true;

        foreach ($chatIds as $chatId) {
            if (empty($chatId)) continue;
            
            if ($hasImage) {
                $response = Http::attach(
                    'photo', $fileContent, $filename
                )->post($this->getUrl('sendPhoto'), [
                    'chat_id' => $chatId,
                    'caption' => $caption,
                    'parse_mode' => 'Markdown',
                    'reply_markup' => json_encode($keyboard)
                ]);
                
                if (!$response->successful()) {
                    Log::error("Telegram sendPhoto to $chatId failed: " . $response->body());
                    $allSuccessful = false;
                }
            } else {
                // Fallback to sendMessage if no valid base64 image is found
                $response = Http::post($this->getUrl('sendMessage'), [
                    'chat_id' => $chatId,
                    'text' => $caption . "\n_(No valid screenshot provided)_",
                    'parse_mode' => 'Markdown',
                    'reply_markup' => json_encode($keyboard)
                ]);

                if (!$response->successful()) {
                    Log::error("Telegram sendMessage to $chatId failed: " . $response->body());
                    $allSuccessful = false;
                }
            }
        }

        return $allSuccessful;
    }

    public function editMessageText(string $chatId, string $messageId, string $text): bool
    {
        $response = Http::post($this->getUrl('editMessageCaption'), [
            'chat_id' => $chatId,
            'message_id' => $messageId,
            'caption' => $text,
            'parse_mode' => 'Markdown',
        ]);
        
        // If editMessageCaption fails (e.g., fallback was used and it was text only), try editMessageText
        if (!$response->successful() && str_contains($response->body(), 'there is no caption in the message to edit')) {
            $response = Http::post($this->getUrl('editMessageText'), [
                'chat_id' => $chatId,
                'message_id' => $messageId,
                'text' => $text,
                'parse_mode' => 'Markdown',
            ]);
        }

        if (!$response->successful()) {
            Log::error('Telegram editMessage failed: ' . $response->body());
            return false;
        }
        
        return true;
    }

    public function answerCallbackQuery(string $callbackQueryId, string $text, bool $showAlert = false): bool
    {
        $response = Http::post($this->getUrl('answerCallbackQuery'), [
            'callback_query_id' => $callbackQueryId,
            'text' => $text,
            'show_alert' => $showAlert
        ]);

        if (!$response->successful()) {
            Log::error('Telegram answerCallbackQuery failed: ' . $response->body());
            return false;
        }

        return true;
    }

    public function sendMessage(string $chatId, string $text, array $keyboard = []): bool
    {
        $payload = [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'Markdown',
        ];

        if (!empty($keyboard)) {
            $payload['reply_markup'] = json_encode($keyboard);
        }

        $response = Http::post($this->getUrl('sendMessage'), $payload);

        if (!$response->successful()) {
            Log::error('Telegram sendMessage directly failed: ' . $response->body());
            return false;
        }

        return true;
    }
}
