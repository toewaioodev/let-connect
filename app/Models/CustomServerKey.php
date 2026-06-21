<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomServerKey extends Model
{
    /** @use HasFactory<\Database\Factories\CustomServerKeyFactory> */
    use HasFactory;

    protected $fillable = [
        'server_id',
        'key_code',
        'is_used',
        'used_by_user_id',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'is_used' => 'boolean',
            'used_at' => 'datetime',
        ];
    }

    public function server()
    {
        return $this->belongsTo(Server::class);
    }

    public function usedByUser()
    {
        return $this->belongsTo(MobileUser::class, 'used_by_user_id');
    }
}
