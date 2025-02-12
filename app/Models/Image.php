<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    use HasFactory;

    public function products() {
        return $this->belongsToMany(Product::class);
    }

    public function orient() {
        return $this->belongsTo(ImgOrient::class)->withDefault([
            'img_orient_id' => '2',
        ]);
    }
    
}