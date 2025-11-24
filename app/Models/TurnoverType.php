<?php
// app/Models/TurnoverType.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TurnoverType extends Model {
    use HasFactory;

    protected $table = 'turnover_types';
    protected $fillable = ['turnover_type'];
}
