<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RedeemKey extends Model
{
    /** @use HasFactory<\Database\Factories\RedeemKeyFactory> */
    use HasFactory;

    protected $fillable = [
        'key_code',
        'duration_days',
        'is_used',
        'used_by_device',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'is_used' => 'boolean',
            'used_at' => 'datetime',
        ];
    }
}
