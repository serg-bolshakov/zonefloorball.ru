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
}

// создаём интерфейсы для юридических и физических лиц, которые будут расширять базовый интерфейс:
export interface IIndividualUser extends IUserBase {
    pers_surname: string | null;
    date_of_birth: string | null;
    pers_tel: string | null;
    pers_email: string | null;
}

export interface IOrgUser extends IUserBase {
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

// Создаём объединённый тип пользователя:
export type User = IIndividualUser | IOrgUser | null;
/* Пример того, как далее мы можем использовать юзера:
    
    function isIndividualUser(user: User): user is IIndividualUser {
        return (user as IIndividualUser).date_of_birth !== undefined;
    }

    function isOrgUser(user: User): user is IOrgUser {
        return (user as IOrgUser).org_inn !== undefined;
    }

    // Вариант использования:
    if (isIndividualUser(user)) {
        // Работаем с физическим лицом
    } else if (isOrgUser(user)) {
        // Работаем с юридическим лицом
    }

*/

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
    category_id?: number
    parent_id?: number;
    brand_id?: number;
    url_semantic?: string;
    category?: string;
    /**
     * Название категории для отображения.
     */
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
    0?: ICategoryMenuItem; // по большому счёту - это "костыль", чтобы TS не показывал ошибку - при переборе вложенных уровней категории, например: "Дополнительная защита" - только в этом случае мы будем получать value[0] в Header.tsx - ничего другое не помогает. Случай уникальный - вот по-этому такая ситуация
    children?: ICategoryMenuItem[] | Record<number, ICategoryMenuItem>;  // Массив или объект. Вложенные объекты - это как 4-й уровень вложенности должен быть по задумке - посмотрим, что получится..
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

// Интерфейс для состояния модального окна
export interface IModalState {
    isOpen: boolean;
    content: ReactNode | null; // ReactNode — это тип для любого React-элемента (компонент, строка, число и т.д.)
}
