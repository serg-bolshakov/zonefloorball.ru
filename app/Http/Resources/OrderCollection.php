<?php
// app/Http/Resources/OrderCollection.php
namespace App\Http\Resources;
use Illuminate\Support\Facades\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use App\Models\User;

class OrderCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
    */

    public function toArray(Request $request): array {

        return [
            'data' => $this->collection->map(function ($order) {
                return new OrderResource($order);
            }),
            
            // Inertia.js использует JSON для передачи данных между Laravel и React. Когда мы передаём объект OrderCollection, он сериализуется в JSON. В процессе сериализации некоторые свойства объекта LengthAwarePaginator (например, lastPage, total, perPage и т.д.) могут быть преобразованы в массивы, если они имеют сложную структуру или если в процессе сериализации происходит дублирование данных - это проблема: в react мы получаем не значения, а массиивы значений (дублирование), что приводит к проблемам при рендеринге данных
        ];
        
    }

    /** если не нужна вложенность data:
     * return $this->collection->map(function ($order) use ($request) {
     *   return new OrderResource($order);
     * })->all();
    */
}
