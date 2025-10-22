<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use App\Models\Category;
use App\Traits\CategoryTrait;

class GenerateSitemap extends Command
{
    use CategoryTrait;
    
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate the sitemap.';

    /**
     * Execute the console command.
     */
    public function handle()
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

                // упрощаем sitemap: оставляем ТОЛЬКО основные категории: код ниже комментируем...
                /**
                 * Проблемы с query-параметрами в sitemap, как мне кажется:
                 * Временность: Модели/фильтры меняются, товары распродаются
                 * Дубли контента: Одна страница с разными параметрами
                 * Каннибализация: Поисковики путаются какая версия главная
                 * Динамичность: Фильтры меняются чаще чем индексация
                 */

                /* foreach($category as $key=>$value) {                                
                    if(isset($value->prop_url_semantic) && ($key != 0)) { 
                        
                        $queryParams = [
                            $category[0]->url_semantic => $value->prop_title,
                            $value->prop_title => $value->prop_url_semantic
                        ];

                        $url = "/products/catalog?" . http_build_query($queryParams);
                        $sitemap->add(Url::create($url)
                            ->setPriority(0.9)
                            ->setLastModificationDate($value->updated_at ?? now()));
                    
                    } elseif(!empty($value->model) && $key != 0) {
                                                
                        // Правильное формирование URL с кодированием
                        $url = "/products/catalog?" . http_build_query([        // Что делает http_build_query(): ✅ Автоматически кодирует пробелы в %20, ✅ Правильно обрабатывает спецсимволы, ✅ Формирует валидный query string, ✅ Заменяет & на &amp; для XML
                            $value->url_semantic => 'model',
                            'model' => $value->model
                        ]);
                        
                        $sitemap->add(Url::create($url)
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
                }*/
            }
        }
        
        // Сохраняем карту сайта в файл
        if ($sitemap->writeToFile(public_path('sitemap.xml'))) {
            $this->info('Sitemap generated successfully!');
        } else {
            $this->info('Failed to generate sitemap.');
        }        
    }
}
