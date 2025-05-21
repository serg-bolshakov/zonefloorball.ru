<?php
// app/Models/Cart.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cart extends Model {
    use HasFactory;

    protected $fillable = ['user_id', 'product_id', 'quantity', 'deleted_at'];

    // Отношения
    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo {
        return $this->belongsTo(Product::class)->withDefault([
            'name' => 'Товар удалён'
        ]);
    }

    // использовать осторожно! Лучше не использовать! 
    public static function rules(): array {
        return [
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1', 
        ];
    }

    // метод для проверки остатков
    public static function validateQuantities(array $items): array     {
    return Product::with('productReport')                                                   // Жадная загрузка with - эффективнее, чем load() (который делает отдельный запрос после выборки)
            ->whereIn('id', array_keys($items))
            ->get()
            ->mapWithKeys(function ($product) use ($items) {                                // Этот метод преобразует коллекцию в ассоциативный массив, задавая свои ключи и значения. Подробнее в AuthSyncControlle...
                // Защита от случаев, когда связи productReport нет
                $available = $product->productReport?->on_sale ?? 0;

                return [
                    $product->id => min(
                        $items[$product->id],   // Запрошенное количество
                        $available              // Доступно для продажи
                    )
                ];
            })

            ->toArray();
    }
}