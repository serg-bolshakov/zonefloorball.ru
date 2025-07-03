<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LegalDocument extends Model
{
    use HasFactory;

    // сетод получения актуальной версии:
    public static function getCurrentVersion(string $type): ?LegalDocument
    {
        return self::where('type', $type)
            ->where('is_active', true)
            ->latest('effective_date')
            ->first();
    }

    protected $casts = [
        'effective_date'    => 'date',  // Автоматическое преобразование в Carbon
        'created_at'        => 'datetime',
        'updated_at'        => 'datetime',
    ];

}