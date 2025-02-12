<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImgOrient extends Model
{
    use HasFactory;

    # в модели с ориентацией картинок сделаем метод для получения картинок :
    public function images() {
        return $this->hasMany(Image::class);
    }

}