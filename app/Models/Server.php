<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Server extends Model
{
    /** @use HasFactory<\Database\Factories\ServerFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'flag_code',
        'protocol',
        'config_uri',
        'is_premium',
        'is_custom',
        'is_active',
        'order_index',
    ];

    protected function casts(): array
    {
        return [
            'is_premium' => 'boolean',
            'is_custom' => 'boolean',
            'is_active' => 'boolean',
            'order_index' => 'integer',
        ];
    }

    public function customServerKeys()
    {
        return $this->hasMany(CustomServerKey::class);
    }
}
