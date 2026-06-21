<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mobile_user_id')->nullable()->constrained('mobile_users')->nullOnDelete();
            $table->string('device_id', 191)->index();
            $table->string('plan_id', 50);
            $table->string('plan_name', 100);
            $table->string('plan_price', 20);
            $table->string('transaction_id', 191)->unique();
            $table->string('sender_name', 255);
            $table->string('email', 255)->nullable();
            $table->mediumText('screenshot_data');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->text('admin_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_requests');
    }
};
