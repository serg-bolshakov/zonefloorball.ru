<?php
// app/Models/ProductUnit.php  
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductUnit extends Model {
    use HasFactory;

    protected $table = 'product_units';
    
    protected $fillable = [
        'unit_parent_id',
        'unit_prod_value', 
        'coefficient',
        'unit_prod_code',
        'unit_prod_value_view',
        'unit_prod_value_name'
    ];

    public function productsOfUnitMeasurement() {
        return $this->hasMany(Product::class);
    }

}