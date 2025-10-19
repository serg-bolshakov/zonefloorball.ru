<?php
// app/Http/Resources/AdminProductCollection.php
namespace App\Http\Resources;
use Illuminate\Support\Facades\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use App\Models\User;

class AdminProductCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
    */

    public function toArray(Request $request): array {
        // \Log::debug('AdminProductCollection:', ['AdminProductCollection request' => $request->all()]);
        return [
            'data' => $this->collection->map(function ($product) {
                // \Log::debug('AdminProductCollection:', ['AdminProductCollection product' => $product]);
                return new AdminProductResource($product);
            }),
        ];
        
    }
}
