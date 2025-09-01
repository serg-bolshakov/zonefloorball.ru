<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class ImgOrient extends Model
{
    use HasFactory;

    const PORTRAIT = 1;
    const ALBUM    = 2;
    const SQUARE   = 3;
    const PROMO    = 4;

    protected $fillable = ['img_orient'];

    # в модели с ориентацией картинок сделаем метод для получения картинок :
    public function images() {
        return $this->hasMany(Image::class);
    }

}