<?php
// app/Services/ProductCard/GeneralProductCardService.php
namespace App\Services\ProductCard;

use Illuminate\Database\Eloquent\Builder;               // Builder в Laravel - это реализация шаблона "строитель" (Builder pattern), который позволяет постепенно строить SQL-запрос, добавляя к нему условия.
use Illuminate\Support\Facades\DB;
use App\Models\Product;

class GeneralProductCardService extends BaseProductCardService
{
    public function getSimilarProps() {   
        $propsVariants = [];
        return $propsVariants;
    }
}