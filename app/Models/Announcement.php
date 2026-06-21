<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    /** @use HasFactory<\Database\Factories\AnnouncementFactory> */
    use HasFactory;

    protected $fillable = [
        'message',
        'url',
        'is_active',
        'min_version_code',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'min_version_code' => 'integer',
        ];
    }
}
