// resources/js/Types/types.ts
import { ReactNode } from 'react';

// создаём базовый интерфейс для всех пользователей:
export interface IUserBase {
    id: number;
    created_at: string;
    updated_at: string;
    client_type_id: number;
    client_rank_id: number;
    user_access_id: number;
    this_id: number | null;
    email: string | null;
    email_verified_at: string | null;
    name: string;
    delivery_addr_on_default: string | null;
    user_manager_id: number | null;
    action_auth_id: number | null;
    needReconfirm?: boolean;
    privacy_policy_agreed_at: string;
}

// создаём интерфейсы для юридических и физических лиц, которые будут расширять базовый интерфейс:
export interface IIndividualUser extends IUserBase {
    type: 'individual';
    pers_surname: string | null;
    date_of_birth: string | null;
    pers_tel: string | null;
    pers_email: string | null;
    bonuses?: number;
    deliveryAddress?: string;
}

export interface IOrgUser extends IUserBase {
    type: 'legal';
    org_inn: string | null;
    org_kpp: string | null;
    is_taxes_pay: boolean | null;
    org_addr: string | null;
    org_tel: string | null;
    org_email: string | null;
    org_repres_name: string | null;
    org_repres_surname: string | null;
    org_repres_patronymic: string | null;
    org_repres_justification: string | null;
    org_bank_acc: string | null;
    org_bank_bic: string | null;
}


// Гость - покупатель
export interface IGuestCustomer {
    type: 'guest';
    firstName: string;
    lastName: string;
    phone: string;
    email: string; 
    deliveryAddress?: string;
}

// Создаём объединённый тип пользователя:
export type TUser = IIndividualUser | IOrgUser | null;

// Пример того, как далее мы можем использовать юзера:
export function isIndividualUser(user: TUser): user is IIndividualUser {
    return user !== null && 
        'client_type_id' in user && 
        user.client_type_id === 1; // ID физлица
}

export function isLegalUser(user: TUser): user is IOrgUser {
    return user !== null && 
        'client_type_id' in user && 
        user.client_type_id === 2; // ID юрлица
}

/*  Вариант использования:
    if (isIndividualUser(user)) {
        // Работаем с физическим лицом
    } else if (isOrgUser(user)) {
        // Работаем с юридическим лицом
    }
*/

export type TCustomer = IGuestCustomer | IIndividualUser | IOrgUser;

// Type guards (проверка типов) - это TypeScript-функция с type predicate (`is`)
export function isIndividual(customer: TCustomer): customer is IIndividualUser {
    return customer.type === 'individual';
}
  
export function isLegal(customer: TCustomer): customer is IOrgUser {
    return customer.type === 'legal';
}
  
export function isGuest(customer: TCustomer): customer is IGuestCustomer {
    return customer.type === 'guest';
}

// Создадим интерфейс для объектов третьего уровня меню категорий товаров/моделей/серий с числовыми ключами, каждое значение - это объект типа ICategoryMenuItem:
export interface ICategoryMenuItem {
    /**
     * id - уникальный идентификатор позиции, выводимой в меню товаров - это могут быть категории, серии, модели: 
        +"id": 17 
        +"category_id": 1
        +"brand_id": 1
        +"prop_title": "serie"
        +"prop_value": "evolab"
        +"prop_value_view": "EVOLAB"
        +"prop_url_semantic": "evolab-sticks-series"
     */
    id?: number;
    /**
     * category_id - уникальный идентификатор категории.
     */
    category_id?: number;
    parent_id?: number;
    brand_id?: number;
    url_semantic?: string;
    category?: string;
    category_view?: string;
    category_view_2?: string;
    cat_description?: string;
    tag_title?: string;
    meta_name_description?: string;
    meta_name_keywords?: string;
    meta_name_robots?: string;
    category_title?: string;
    prop_title?: string;
    prop_value?: string;
    prop_value_view?: string;
    prop_url_semantic?: string;
    model?: string;
    isPropChecked?: boolean; // добавили для управления состоянием чекбокса
    0?: ICategoryMenuItem; // по большому счёту - это "костыль", чтобы TS не показывал ошибку - при переборе вложенных уровней категории, например: "Дополнительная защита" - только в этом случае мы будем получать value[0] в Header.tsx - ничего другое не помогает. Случай уникальный - вот по-этому такая ситуация
    // children?: ICategoryMenuItem[] | Record<number, ICategoryMenuItem>;  // Массив или объект. Вложенные объекты - это как 4-й уровень вложенности должен быть по задумке - посмотрим, что получится..
    [key: string]: any; // Для динамических ключей вложенных категорий
    children?: Record<string, ICategoryMenuItem>; // Для вложенных структур
}
 
// опишем тип для объектов второго уровня с числовыми ключами (например, 1, 3, 2, 6, 7, 8, 5)... каждое значение — это объект с числовыми ключами (третий уровень).
/** 
 * array:4 [▼ // app\Http\Controllers\IndexReactController.php:75
  "NoName" => array:7 [▶]
  "unihoc" => array:7 [▼
    1 => array:8 [▼
      17 => {#1805 ▶}
      18 => {#1773 ▶}
      19 => {#1743 ▶}
      20 => {#1798 ▶}
      23 => {#1735 ▶}
      28 => {#1716 ▶}
      94 => {#1714 ▶}
      0 => {#1633 ▶}
    ]
    3 => array:2 [▶]
    2 => array:8 [▶]
    6 => array:3 [▶]
    7 => array:2 [▶]
    8 => array:7 [▶]
    5 => array:2 [▶]
  ]
  "zone" => array:5 [▶]
  "UnihocZoneRussia" => array:7 [▶]
]
*/
export type TSecondLevel = Record<number,  Record<number, ICategoryMenuItem>>;
// Record — это встроенный тип TypeScript, который позволяет описать объект с динамическими ключами. Синтаксис: Record<KeyType, ValueType>

// Интерфейс для первого уровня: объект с ключами "NoName", "unihoc", "zone", "UnihocZoneRussia". Каждое значение — это объект с числовыми ключами (второй уровень).
export interface ICategoriesMenuArr {
    NoName: TSecondLevel;
    unihoc: TSecondLevel;
    zone: TSecondLevel;
    UnihocZoneRussia: TSecondLevel;
}

export interface IProduct extends IProductReportFromDB {
    id: number;                                     // значение передаётся из app/Http/Resources/ProductResource.php в каталог товаров в раздел assortimentCards
    article?: number | null;
    title: string;                                  // значение передаётся из app/Http/Resources/ProductResource.php в каталог товаров в раздел assortimentCards
    category?: string | null;                       // значение передаётся из app/Http/Resources/ProductResource.php в каталог товаров в раздел assortimentCards
    category_id?: number | null;
    brand?: string | null;                          // значение передаётся из app/Http/Resources/ProductResource.php в каталог товаров в раздел assortimentCards
    brand_id?: number | null;
    model?: string | null;                          // значение передаётся из app/Http/Resources/ProductResource.php в каталог товаров в раздел assortimentCards
    marka?: string | null;                          // значение передаётся из app/Http/Resources/ProductResource.php в каталог товаров в раздел assortimentCards
    size_id?: number | null;
    product_unit_id?: number | null;
    colour?: string | null;
    material?: string | null;   
    weight?: number | null;
    prod_desc?: string | null;
    prod_url_semantic?: string;                      // значение передаётся из app/Http/Resources/ProductResource.php в каталог товаров в раздел assortimentCards
    iff_id?: number | null;
    product_ean?: number | null;
    actual_price?: number;
    price_actual?: number;                          // значение передаётся из app/Http/Resources/ProductResource.php в каталог товаров в раздел assortimentCards
    regular_price?: number;
    price_regular?: number;                         // значение передаётся из app/Http/Resources/ProductResource.php в каталог товаров в раздел assortimentCards
    product_status_id?: number | null;
    prod_status?: number | null;                     // значение передаётся из app/Http/Resources/ProductResource.php в каталог товаров в раздел assortimentCards
    img_link?: string | null;                        // значение передаётся из app/Http/Resources/ProductResource.php в каталог товаров в раздел assortimentCards
    
    price_with_rank_discount?   : number;
    price_with_action_discount? : number;
    percent_of_rank_discount?   : number;
    summa_of_action_discount?   : number;
    price_special?              : number;
    date_end?                   : string;

    quantity?: number;
    
}

export interface IProductsResponse {
    data: IProduct[]; // Массив товаров
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
        links: [{ url: string | null; label: string; active: boolean }]; 
    };
}

export interface ICategoryItemFromDB {
    id: number;
    category?: string | null;
    category_view?: string;
    category_view_2?: string;
    parent_id?: number | string | null;
    cat_description?: string | null;
    url_semantic?: string;
    tag_title?: string;
    meta_name_description?: string;
    meta_name_keywords?: string | null;
    meta_name_robots?: string;
    category_title?: string | null;
}

export interface IBrandItemFromDB {
    id: number;
    brand?: string;
    brand_view?: string | null;
    description?: string | null;
    url?: string | null;
}

export interface ISizeItemFromDB {
    id: number;
    category_id?: number | null;
    size_title?: string | null;
    size_unit?: string | null;
    size_value?: string | null;
    size_value_view?: string | null;
    size_recommendation?: string | null;
    length?: number | null;
    width?: number | null;
    height?: number | null;
}

export interface IPropertyItemFromDB {
    id: number;
    prop_title?: string;
    category_id?: number;
    brand_id?: number | null;
    unit?: string | null;
    prop_value?: string | number | null;
    prop_value_view?: string | null;
    prop_url_semantic?: string | null;
    archived?: boolean | null;
    prop_description?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    author_id?: number| null;
}

export interface IImageItemFromDB {
    id: number,
    product_id?: number;
    img_main?: boolean | null;
    img_link?: string | null;
    img_promo?: boolean | null;
    img_showcase?: boolean | null;
    img_orient_id?: number | null;
    created_at: string | null;
    author_id: number| null;
}

export interface IImgOrientItemFromDB {
    id: number;
    img_orient: string;
}

export interface IPriceItemFromDB {
    id: number,
    created_at: string | null;
    updated_at: string | null;
    product_id?: number;
    price_type_id?: number,
    price_value?: number | null;  
    date_start?: string | null;   // ISO-дата (например, "2025-03-29")
    date_end?: string | null;
    author_id: number| null;
}

export interface IProductItemFromDB {
    id: number,
    article?: number;
    title?: string | null;
    category_id?: number | null;
    brand_id?: number | null;
    model?: string | null;
    marka?: string | null;
    size_id?: number | null;
    product_unit_id?: number;
    colour?: string | null;
    material?: string | null;
    weight?: number | null;
    prod_desc?: string | null;
    prod_url_semantic?: string;
    tag_title?: string;
    meta_name_description?: string | null;
    meta_name_keywords?: string | null;
    style_link?: string | null;
    iff_id?: number | null;
    product_ean?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    product_status_id?: boolean | null;
    author_id?: number| null;
}

export interface IProductReportFromDB {
    id: number,
    product_id?: number;
    in_stock?: number;
    on_sale?: number;
    reserved?: number;
    coming_soon?: number;
    expected_receipt_date?: string | null;
    on_preorder?: number;
    preodered?: number;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface IProductUnitFromDB {
    id: number,
    unit_parent_id?: number | null;
    unit_prod_value?: string;
    coefficient?: number;
    unit_prod_code?: number | null;
    unit_prod_value_view?: string;
    unit_prod_value_name?: string;
}