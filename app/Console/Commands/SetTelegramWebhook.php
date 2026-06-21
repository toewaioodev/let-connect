<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SetTelegramWebhook extends Command
{
    protected $signature = 'telegram:set-webhook {url?}';
    protected $description = 'Set Telegram Webhook URL';

    public function handle()
    {
        $botToken = config('services.telegram.bot_token');
        if (empty($botToken)) {
            $this->error('TELEGRAM_BOT_TOKEN is not configured.');
            return Command::FAILURE;
        }

        $url = $this->argument('url') ?? config('app.url') . '/api/telegram/webhook';
        
        $payload = ['url' => $url];

        $this->info("Setting Webhook to URL: {$url}");

        $response = Http::post("https://api.telegram.org/bot{$botToken}/setWebhook", $payload);

        if ($response->successful()) {
            $this->info('Webhook set successfully!');
            return Command::SUCCESS;
        } else {
            $this->error('Failed to set webhook: ' . $response->body());
            return Command::FAILURE;
        }
    }
}
