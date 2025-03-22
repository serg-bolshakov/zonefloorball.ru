// resources/js/Types/types.ts
import { ReactNode } from 'react';

// Создадим интерфейс для объектов третьего уровня меню категорий товаров/моделей/серий с числовыми ключами, каждое значение - это объект типа IFilterItem:
export interface IProductFilterItem {
    /**
       #items: array:4 [▼
          "prop_title" => "shaft_flex"
          "prop_value" => "30"
          "prop_value_view" => "30"
          "isPropChecked" => ""
        ]
     */
    id?: number;
    brand?: string;
    brand_view?: string;
    description?: string;
    url?: string;
    isBrandChecked?: boolean| string;
    prop_title?: string;
    prop_value?: string | number;
    prop_value_view?: string | number;
    isPropChecked?: boolean| string;
    size_title?: string;
    size_value?: string | number;
    size_recommendation?: string;
}
 
// опишем тип для объектов второго уровня с числовыми ключами (например, 1, 3, 2, 6, 7, 8, 5)... каждое значение — это объект со строковыми ключами (третий уровень).
/** 
   "filterShaftFlexes" => Illuminate\Support\Collection {#643 ▼
    #items: array:11 [▼
      0 => Illuminate\Support\Collection {#617 ▶} 
      1 => Illuminate\Support\Collection {#622 ▶}
      2 => Illuminate\Support\Collection {#621 ▶}
      3 => Illuminate\Support\Collection {#590 ▶}
      4 => Illuminate\Support\Collection {#589 ▶}
      5 => Illuminate\Support\Collection {#651 ▶}
      6 => Illuminate\Support\Collection {#650 ▶}
      7 => Illuminate\Support\Collection {#649 ▶}
      8 => Illuminate\Support\Collection {#648 ▶}
      9 => Illuminate\Support\Collection {#647 ▶}
      10 => Illuminate\Support\Collection {#646 ▶}
    ]
*/
export type TProductFiltersSecondLevel = IProductFilterItem[];

// Интерфейс для первого уровня: объект со строковыми ключами "brands", "filterShaftFlexes", "filterStickSizes", "filterHooks". Каждое значение — это объект с числовыми ключами (второй уровень).
export interface IProductsFilters {
    [key: string]: TProductFiltersSecondLevel; // Динамические ключи - можно будет добавлять другие фильтры и не описывать их, работать будет, но есть нюансы: 
    // Потеря семантики: Тип Record<string, ...> делает структуру менее явной. Мы теряете информацию о том, какие именно фильтры ожидаются (например, brands, filterShaftFlexes и т.д.).
    // Если сделаю опечатку в названии фильтра (например, filterShaftFlexes вместо filterShaftFlexes), TypeScript не сможет это проверить... - подумаем, но на данном этапе лучше прописывать явно... как мне кажется...
    brands: TProductFiltersSecondLevel;
    filterShaftFlexes: TProductFiltersSecondLevel;
    filterStickSizes: TProductFiltersSecondLevel;
    filterHooks: TProductFiltersSecondLevel;
}