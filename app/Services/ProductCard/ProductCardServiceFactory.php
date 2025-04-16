<?php
//  app/Services/ProductCard/ProductCardServiceFactory.php - Фабрика для выбора сервиса - выбирает нужный сервисный класс в зависимости от раздела каталога.
// в настоящий момент используем для получения товаров, которые явяются родственными для просматриваемого пользователем - готовим для выборки вариантов товаров в карточку (различные размеры/цвет...)

namespace App\Services\ProductCard;

class ProductCardServiceFactory
{
    public static function create(?string $categoryId, $prodInfo): BaseProductCardService
    {
        switch ($categoryId) {
            case '1':
                return new StickProductCardService($prodInfo);         // клюшек           sticks
            case '2':
                return new BladeProductCardService($prodInfo);         // крюков           blades
            case '3':
                return new BallProductCardService($prodInfo);          // мячей            balls
            // case '5':
            //     return new BagProductCardService($prodInfo);           // сумок и чехлов   bags
            // case '6':
            //     return new GripProductCardService($prodInfo);          // обмоток          grips
            // case '7':
            //     return new EyewearsProductCardService($prodInfo);      // очков            eyewears
            // case 'goalie':
            //     return new GoalieProductCardService($prodInfo);        // вратарской экипировки
            default:
                return new GeneralProductCardService($prodInfo);       // общие принципы для всех категорий товаров
        }
    }
}