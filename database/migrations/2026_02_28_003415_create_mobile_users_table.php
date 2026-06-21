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
        Schema::create('mobile_users', function (Blueprint $table) {
            $table->id();
            $table->string('device_id', 191)->unique();
            $table->string('api_token', 191)->unique();
            $table->boolean('is_premium')->default(false);
            $table->dateTime('premium_expires_at')->nullable();
            $table->string('device_model', 100)->nullable();
            $table->string('os_version', 50)->nullable();
            $table->dateTime('last_login')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mobile_users');
    }
};
