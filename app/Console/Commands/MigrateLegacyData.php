<?php

namespace App\Console\Commands;

use App\Models\Ad;
use App\Models\Announcement;
use App\Models\MobileUser;
use App\Models\PaymentRequest;
use App\Models\RedeemKey;
use App\Models\Server;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PDO;
use PDOException;

class MigrateLegacyData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:migrate-legacy-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate data from legacy PHP application database to Laravel';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting legacy data migration...');

        // Legacy Database Credentials (from admin/config.php)
        $host = 'sql12.freesqldatabase.com';
        $db   = 'sql12817725';
        $user = 'sql12817725';
        $pass = 'LghmeBLZRI';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $pdo = new PDO($dsn, $user, $pass, $options);
            $this->info('Connected to legacy database.');

            // Migrate Users
            $this->migrateUsers($pdo);

            // Migrate Servers
            $this->migrateServers($pdo);

            // Migrate Ads
            $this->migrateAds($pdo);

            // Migrate Payment Requests
            $this->migratePayments($pdo);

            // Migrate Redeem Keys
            $this->migrateRedeemKeys($pdo);

            // Migrate Announcements
            $this->migrateAnnouncements($pdo);

            $this->info('Migration completed successfully!');

        } catch (PDOException $e) {
            $this->error('Database connection failed: ' . $e->getMessage());
        }
    }

    private function migrateUsers(PDO $pdo)
    {
        $this->info('Migrating users...');
        $stmt = $pdo->query("SELECT * FROM users");
        $users = $stmt->fetchAll();

        foreach ($users as $user) {
            MobileUser::updateOrCreate(
                ['device_id' => $user['device_id']],
                [
                    'api_token' => $user['api_token'],
                    'is_premium' => (bool)$user['is_premium'],
                    'premium_expires_at' => $user['premium_expires_at'],
                    'device_model' => $user['device_model'],
                    'os_version' => $user['os_version'],
                    'last_login' => $user['last_login'],
                    'created_at' => $user['created_at'],
                ]
            );
        }
        $this->info('Migrated ' . count($users) . ' users.');
    }

    private function migrateServers(PDO $pdo)
    {
        $this->info('Migrating servers...');
        $stmt = $pdo->query("SELECT * FROM servers");
        $servers = $stmt->fetchAll();

        foreach ($servers as $server) {
            Server::updateOrCreate(
                ['name' => $server['name']],
                [
                    'flag_code' => $server['flag_code'],
                    'protocol' => $server['protocol'],
                    'config_uri' => $server['config_uri'],
                    'is_premium' => (bool)$server['is_premium'],
                    'is_active' => (bool)$server['is_active'],
                    'order_index' => (int)$server['order_index'],
                    'created_at' => $server['created_at'],
                ]
            );
        }
        $this->info('Migrated ' . count($servers) . ' servers.');
    }

    private function migrateAds(PDO $pdo)
    {
        $this->info('Migrating ads...');
        $stmt = $pdo->query("SELECT * FROM ads");
        $ads = $stmt->fetchAll();

        foreach ($ads as $ad) {
            Ad::updateOrCreate(
                ['title' => $ad['title']],
                [
                    'image_url' => $ad['image_url'],
                    'target_url' => $ad['target_url'],
                    'is_active' => (bool)$ad['is_active'],
                    'created_at' => $ad['created_at'],
                ]
            );
        }
        $this->info('Migrated ' . count($ads) . ' ads.');
    }

    private function migratePayments(PDO $pdo)
    {
        $this->info('Migrating payment requests...');
        $stmt = $pdo->query("SELECT * FROM payment_requests");
        $payments = $stmt->fetchAll();

        foreach ($payments as $payment) {
            // Find mobile_user_id
            $mobileUser = MobileUser::where('device_id', $payment['device_id'])->first();

            PaymentRequest::updateOrCreate(
                ['transaction_id' => $payment['transaction_id']],
                [
                    'mobile_user_id' => $mobileUser?->id,
                    'device_id' => $payment['device_id'],
                    'plan_id' => $payment['plan_id'],
                    'plan_name' => $payment['plan_name'],
                    'plan_price' => $payment['plan_price'],
                    'sender_name' => $payment['sender_name'],
                    'email' => $payment['email'],
                    'screenshot_data' => $payment['screenshot_data'],
                    'status' => $payment['status'],
                    'admin_note' => $payment['admin_note'],
                    'reviewed_by' => $payment['reviewed_by'],
                    'reviewed_at' => $payment['reviewed_at'],
                    'created_at' => $payment['created_at'],
                ]
            );
        }
        $this->info('Migrated ' . count($payments) . ' payment requests.');
    }

    private function migrateRedeemKeys(PDO $pdo)
    {
        $this->info('Migrating redeem keys...');
        $stmt = $pdo->query("SELECT * FROM redeem_keys");
        $keys = $stmt->fetchAll();

        foreach ($keys as $key) {
            RedeemKey::updateOrCreate(
                ['key_code' => $key['key_code']],
                [
                    'duration_days' => (int)$key['duration_days'],
                    'is_used' => (bool)$key['is_used'],
                    'used_by_device' => $key['used_by_device'],
                    'used_at' => $key['used_at'],
                    'created_at' => $key['created_at'],
                ]
            );
        }
        $this->info('Migrated ' . count($keys) . ' redeem keys.');
    }

    private function migrateAnnouncements(PDO $pdo)
    {
        $this->info('Migrating announcements...');
        $stmt = $pdo->query("SELECT * FROM announcements");
        $announcements = $stmt->fetchAll();

        foreach ($announcements as $announcement) {
            Announcement::updateOrCreate(
                ['message' => $announcement['message']],
                [
                    'url' => $announcement['url'],
                    'is_active' => (bool)$announcement['is_active'],
                    'created_at' => $announcement['created_at'],
                ]
            );
        }
        $this->info('Migrated ' . count($announcements) . ' announcements.');
    }
}
