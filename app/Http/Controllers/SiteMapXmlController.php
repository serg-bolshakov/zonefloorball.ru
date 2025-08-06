<?php

namespace App\Http\Controllers;

use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use App\Models\Category;
use App\Traits\CategoryTrait;

class SiteMapXmlController extends Controller
{
    use CategoryTrait;

    public function generate()
    {
        $sitemap = Sitemap::create();

        // Добавляем главную страницу
        $sitemap->add(Url::create('/')->setPriority(1.0));

        // Добавляем страницу каталога
        $sitemap->add(Url::create('products/catalog')->setPriority(1.0));


        // Добавляем категории товаров
        $categories = $this->getMenuCategories(); // Получаем все категории c подкатегориями...

        foreach ($categories as $category) {
            if(isset($category[0])) {
                $sitemap->add(Url::create("/products/{$category[0]->url_semantic}")
                ->setPriority(0.9)
                ->setLastModificationDate($category[0]->updated_at ?? now())); 

                foreach($category as $key=>$value) {                                
                    if(isset($value->prop_url_semantic) && ($key != 0)) { 
                        $sitemap->add(Url::create("/products/catalog?{$category[0]->url_semantic}={$value->prop_title }\&{$value->prop_title}={$value->prop_url_semantic}")
                        ->setPriority(0.9)
                        ->setLastModificationDate($value->updated_at ?? now()));
                    
                    } elseif(!empty($value->model) && $key != 0) {
                        $sitemap->add(Url::create("/products/catalog?{$value->url_semantic}=model\&model={$value->model}")
                        ->setPriority(0.9)
                        ->setLastModificationDate($value->updated_at ?? now()));

                    } elseif(!empty($value->url_semantic) && $key != 0) {
                        $sitemap->add(Url::create("/products/{$category[0]->url_semantic}?category%5B%5D={$value->url_semantic}")
                        ->setPriority(0.9)
                        ->setLastModificationDate($value->updated_at ?? now()));
                    
                    } elseif($key != 0) {
                        foreach($category[$key] as $subCatKey=>$subCatValue) {
                            if(isset($subCatValue->url_semantic) && ($subCatKey != 0)) {
                                $sitemap->add(Url::create("/products/catalog?{$subCatValue->url_semantic}")
                                ->setPriority(0.9)
                                ->setLastModificationDate($subCatValue->updated_at ?? now()));
                            }
                        }
                    }
                }
            }
        }


        // Добавляем другие страницы

        /*  Карта сайта (sitemap.xml) используется для указания реальных страниц, которые могут быть проиндексированы поисковыми системами. 
            Модальные окна не являются отдельными страницами. В проекте пока эта информация показывается в модальных окнах
            Модальные окна написаны на JS и не являются отдельными страницами. Поисковые системы не могут их "увидеть" или проиндексировать.

            $sitemap->add(Url::create('/#about-us')->setPriority(0.8));
            $sitemap->add(Url::create('/payment-delivery')->setPriority(0.8));
            $sitemap->add(Url::create('/return-exchange')->setPriority(0.8));
            
            Если там есть важный контент, то лучше сделать отдельную страницу для этого контента (например, /about-us)
            и добавить её в карту сайта. Затем можно использовать JS для открытия модального окна на этой странице, если это необходимо.
            На странице /about-us можно будет добавить кнопку или ссылку, которая откроет модальное окно с дополнительной информацией.
            Надо будет подумать! На досуге... :)
            пока комментируем - потом подумаем, как лучше... 
        */
        
        // Сохраняем карту сайта в файл
        if ($sitemap->writeToFile(public_path('sitemap.xml'))) {
            return 'Sitemap generated successfully!';
        } else {
            return 'Failed to generate sitemap.';
        }
    }
}
