<?php
//  app/Services/ProductCard/ProductCardServiceFactory.php - Фабрика для выбора сервиса - выбирает нужный сервисный класс в зависимости от раздела каталога.
// в настоящий момент используем для получения товаров, которые явяются родственными для просматриваемого пользователем - готовим для выборки вариантов товаров в карточку (различные размеры/цвет...)

namespace App\Services\ProductCard;

class ProductCardServiceFactory
{
    public static function create(?string $categoryId, $prodInfo): BaseProductCardService
    {
        // \Log::debug('ProductCardServiceFactory:', [ 'categoryId' => $categoryId, 'prodInfo' => $prodInfo]);

        // Категории, которые используют универсальный сервис размеров
        $sizeCategories = [
            '6'  => 'grips_size',      // обмотки
            // '10' => 'pants_size',   // вратарские штаны            - уже реализованы, чтобы не "мутить воду" - комментируем... 
            // '12' => 'knees_size',   // вратарские наколенники      - уже реализованы, чтобы не "мутить воду" - комментируем... 
            '13' => 'gloves_size',     // вратарские перчатки
            '14' => 'groins_size',     // вратарские защита паха
            '15' => 'necks_size',      // вратарские защита шеи
            '17' => 'baules_size',     // размер сумок
        ];
        
        // \Log::debug('ProductCardServiceFactory:', [ 'isset' => isset($sizeCategories[$categoryId])]);
        
        if (isset($sizeCategories[$categoryId])) {
            return new UniversalSizeProductCardService(
                $prodInfo, 
                $sizeCategories[$categoryId]
            );
        }

        switch ($categoryId) {
            case '1':
                return new StickProductCardService($prodInfo);              // клюшек           sticks
            case '2':
                return new BladeProductCardService($prodInfo);              // крюков           blades
            case '3':
                return new BallProductCardService($prodInfo);               // мячей            balls
            // case '5':
            //     return new BagProductCardService($prodInfo);             // сумок и чехлов   bags
            // case '6':
            //     return new GripProductCardService($prodInfo);            // обмоток          grips
            // case '7':
            //     return new EyewearsProductCardService($prodInfo);        // очков            eyewears
            // case 'goalie':
            //     return new GoalieProductCardService($prodInfo);          // вратарской экипировки
            case '10':
                return new GoaliePantsProductCardService($prodInfo);        // вратарские штаны
            case '12':
                return new GoalieKneesProductCardService($prodInfo);        // вратарские наколенники

            case '13':
                return new SizeProductCardService($prodInfo);               // вратарские перчатки

            default:
                return new GeneralProductCardService($prodInfo);            // общие принципы для всех категорий товаров
        }
    }
}