<?php
// app/Http/Resources/ProductCollection.php
namespace App\Http\Resources;
use Illuminate\Support\Facades\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use App\Models\User;

class ProductCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
    */

    public function toArray(Request $request): array {

        return [
            'data' => $this->collection->map(function ($product) {
                return new ProductResource($product);
            }),
            
            // Добавляем ссылки для пагинации: 
            // 'links' => $this->getPaginationLinks(),                  // Inertia.js использует JSON для передачи данных между Laravel и React. Когда мы передаём объект ProductCollection, он сериализуется в JSON. В процессе сериализации некоторые свойства объекта LengthAwarePaginator (например, lastPage, total, perPage и т.д.) могут быть преобразованы в массивы, если они имеют сложную структуру или если в процессе сериализации происходит дублирование данных - это проблема: в react мы получаем не значения, а массиивы значений (дублирование), что приводит к проблемам при рендеринге данных
            // 'meta' => $this->getMeta(),
        ];
        
    }

    /** если не нужна вложенность data:
     * return $this->collection->map(function ($product) use ($request) {
     *   return new ProductResource($product);
     * })->all();
    */

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
