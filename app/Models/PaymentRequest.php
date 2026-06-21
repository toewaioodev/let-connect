<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentRequest extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentRequestFactory> */
    use HasFactory;

    protected $fillable = [
        'mobile_user_id',
        'device_id',
        'plan_id',
        'plan_name',
        'plan_price',
        'transaction_id',
        'sender_name',
        'email',
        'screenshot_data',
        'status',
        'admin_note',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function mobileUser(): BelongsTo
    {
        return $this->belongsTo(MobileUser::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
