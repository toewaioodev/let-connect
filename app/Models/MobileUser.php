<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MobileUser extends Model
{
    /** @use HasFactory<\Database\Factories\MobileUserFactory> */
    use HasFactory;

    protected $fillable = [
        'device_id',
        'api_token',
        'is_premium',
        'premium_expires_at',
        'device_model',
        'os_version',
        'last_login',
    ];

    protected function casts(): array
    {
        return [
            'is_premium' => 'boolean',
            'premium_expires_at' => 'datetime',
            'last_login' => 'datetime',
        ];
    }

    public function paymentRequests(): HasMany
    {
        return $this->hasMany(PaymentRequest::class);
    }
}
