<?php
// app/Http/Resources/ProductCollection.php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ProductCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Проверяем данные
        // dd($this->collection->toArray());
        
        return [
            'data' => ProductResource::collection($this->collection),   // возвращает коллекцию ресурсов ? список товаров
            // Добавляем ссылки для пагинации: 
            'links' => $this->getPaginationLinks(),
            'meta' => $this->getMeta(),
        ];
    }

    /** Добавление ссылок для пагинации в ресурс коллекции, когда мы пробуем использовать пагинацию на стороне сервера. 
     * В Laravel это делается с помощью встроенных возможностей: класс ResourceCollection уже предоставляет встроенную поддержку пагинации.
     * Мы использум пагинацию в Laravel через paginate(), объект пагинации содержит всю необходимую информацию для создания ссылок: 
     * текущая страница, следующая страница, предыдущая страница. Эту информацию можно автоматически добавить в ответ.
     * Класс ResourceCollection уже предоставляет методы для добавления метаданных пагинации. 
     * Всё, что нужно нам сделать, — это вызвать метод paginationInformation() и вернуть нужные данные.
     * Молодец Laravel! - главное, чтобы всё заработало... :)
     */

    protected function getPaginationLinks() {
        return [
            'first'         => $this->url(1),                   // Возвращает URL для указанной страницы. Например, $this->url(1) вернёт ссылку на первую страницу.
            'last'          => $this->url($this->lastPage()),   
            'prev'          => $this->previousPageUrl(),        // Возвращает URL для предыдущей страницы. Если текущая страница — первая, вернётся null.
            'next'          => $this->nextPageUrl(),            // Возвращает URL для следующей страницы. Если текущая страница — последняя, вернётся null.
        ];
    }

    protected function getMeta() {
        return [
            'current_page'  => $this->currentPage(),            // Возвращает номер текущей страницы.
            'from'          => $this->firstItem(),              // Возвращает номер первого элемента на текущей странице.
            'last_page'     => $this->lastPage(),               // Возвращает номер последней страницы.
            'path'          => $this->path(),                   // Возвращает базовый URL для пагинации (например, /api/products).
            'per_page'      => $this->perPage(),                // Возвращает количество элементов на странице.
            'to'            => $this->lastItem(),               // Возвращает номер последнего элемента на текущей странице.
            'total'         => $this->total(),                  // Возвращает общее количество элементов.
        ];
    }
}
