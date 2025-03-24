<?php

// app/Services/Catalog/BaseFilterCatalogService.php
// базовый класс BaseFilterCatalogService: а) применяет общие фильтры (например, по статусу товара).
// б) определяет абстрактный метод applyFilters, который должны реализовать дочерние классы.

/* Далее создадим отдельные сервисные классы для каждого раздела каталога. Такие как:
    - StickFilterService — для фильтрации клюшек.
    - BallFilterService — для фильтрации мячей.
    - GeneralCatalogService — для общего каталога. 
    
    Каждый сервисный класс будет отвечать за: 
    - Получение данных из базы.
    - Применение фильтров.
    - Возврат результата.
*/

namespace App\Services\Catalog;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;

abstract class BaseFilterCatalogService
{
    protected $query;
    protected $filters;

    public function __construct(Builder $query, array $filters = [])
    {
        $this->query = $query;
        $this->filters = $filters;
        $this->applyDefaultFilters();   // Применяем фильтры по умолчанию
    }
    /*
        protected function applyDefaultFilters(): void
        {
            // Фильтруем только активные товары (которые не в архиве):
            $this->query->where('product_status_id', '=', 1);
            // Теперь все сервисы, которые наследуются от BaseFilterService, будут автоматически применять фильтр по статусу товара.
        }
    */

    // возможно понадобится показывать архивные товары, сделаем на всякий случай фильтр динамическим:
    protected function applyDefaultFilters(): void
    {
        // Если не указано иное, показываем только активные товары (которые не в архиве):
        if(!isset($this->filters['show_archived'])) {
            $this->query->where('product_status_id', '=', 1);
        }
        // Теперь все сервисы, которые наследуются от BaseFilterCatalogService, будут автоматически применять фильтр по статусу товара.            
    }

    abstract public function applyFilters(array $filters): Builder;
}