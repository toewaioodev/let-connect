<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\TelegramBotService;
use App\Models\PaymentRequest;

$service = app(TelegramBotService::class);
echo "Testing telegram...\n";

$mockPayment = new PaymentRequest([
    'id' => 9999,
    'sender_name' => 'Test User',
    'device_id' => 'TEST-1234',
    'plan_name' => 'Premium',
    'plan_price' => '$5.99',
    'transaction_id' => 'TXN-001',
    'screenshot_data' => null // Test without photo first
]);

try {
    $res = $service->sendPaymentNotification($mockPayment);
    echo "Sent: " . ($res ? "true" : "false") . "\n";
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}

