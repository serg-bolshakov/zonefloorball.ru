<?php
// app/Services/Catalog/GeneralCatalogService.php
namespace App\Services\Catalog;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use App\Traits\CategoryTrait;
use App\Traits\ArrayTrait;

class GeneralCatalogService extends BaseFilterCatalogService
{
    use CategoryTrait, ArrayTrait;

    public function applyFilters(array $filters): Builder
    {
        // получаем категорию товаров, которую хочет получить пользоватеь - это ключ первого элемента строки запроса: /products/catalog?blades=model&model=HARDER - в этом случае: blades
        // $categoryUrlSemantic = array_key_first($filters);                           // Получить первый ключ заданного массива array, не затрагивая внутренний указатель массива.
        
        // Было (хрупко):
        // $categoryUrlSemantic = array_key_first($filters);

        // Стало (надёжно):
        $categoryUrlSemantic = $_GET['category'] ?? null;

        // если во всплывающем меню хедера пользователь выбирает брендовый каталог, то выведем ему требуемое
        $brandUrlSemantic = $_GET['brand'] ?? null;
        if(!empty($brandUrlSemantic)) {
            $brandId = DB::table('brands')->select('id')->where('brand',  $brandUrlSemantic)->value('id');
            $this->query->where('brand_id', $brandId);
        }

        // Дополнительная проверка для совместимости со старыми URL:
        if (!$categoryUrlSemantic) {
            $categoryUrlSemantic = array_key_first($filters);
        }

        $categoryId = $this->getCategoryIdViaSlug($categoryUrlSemantic);            // если изначально id категории был неопределен - пробуем его получить
        
        // Категория может иметь вложенные категории. Пример: вратарской экипировки - это "материнская" категория, у которой parent_id = NULL и в которой могут быть: Шлемы / Нагрудники / Баулы... а сама может быть пустой...
        $requestMainCategoryWithSubCats = $this->getCategoryProducts($categoryId);

        # если категория товара определена, получаем запрашиваемое свойство:
        if(!empty($categoryId)) {

            // если выьрана категория с подкатегориями (сумки и чехлы / вратарям)
            if(count((array)$requestMainCategoryWithSubCats) > 1) {
                $this->query->whereIn('category_id', (array)$requestMainCategoryWithSubCats);
            } else {
                $this->query->where('category_id', $categoryId);
            }

            # если это модель, то просто делаем выборку подходящих товаров из $products:
            if(isset($filters['model']) && !empty($filters['model'])) {
                $prodPropModelValue = $filters['model'];
                $this->query->where('model', 'LIKE', $prodPropModelValue);
            } elseif(isset($filters['serie']) && !empty($filters['serie'])) {
                $prodPropUrlSemantic = $filters['serie'];
                $prodPropId = DB::table('properties')->where('prop_title', '=', 'serie')->where('prop_url_semantic', '=', $prodPropUrlSemantic)->value('id'); 
                $filterProp[] = $prodPropId;
                
                $prodIds = DB::table('product_property')->select('product_id')->whereIn('property_id',  $filterProp)->get();
                $filterProdPropIds = [];
                if(!empty($prodIds)) {
                    foreach ($prodIds as $prodId) {
                        $filterProdPropIds[] = $prodId->product_id;
                    }
                    $this->query->whereIn('id', (array)$filterProdPropIds);
                }
            } 
        } 

        return $this->query;
    }
}