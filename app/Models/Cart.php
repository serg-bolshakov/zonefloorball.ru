<?php
// app/Models/Cart.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model {
    protected $fillable = ['user_id', 'products'];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    // Автоматическая загрузка корзины для авторизованного пользователя
    public static function forUser(User $user): self {
        return self::firstOrCreate(['user_id' => $user->id]);
    }

    // Валидация JSON в Laravel:
    protected $casts = [
        'products' => 'array'   // Автоматическая конвертация
    ];

    /**
     * касты - это пользовательские приведения типов?
     * Как работают кастомные касты
     * Любой объект, реализующий новый контракт CastsAttributes, можно использовать в модели в свойстве $casts. 
     * При доступе к свойствам модели, перед тем как передать его нам, Eloquent сначала проверяет, есть ли кастомный каст 
     * для преобразования значения. 
     * 
     * Каст будет вызываться при каждой get— и set-операции, поэтому рассмотреть возможность кэширования интенсивных операций!
    */

    /** Когда сохраняем JSON в БД: 
     * $cart->products = '{"1": {"quantity": 2}}'; // Строка
     * Laravel автоматически преобразует это в: $cart->products; // ['1' => ['quantity' => 2]]
    */

    public static function rules(): array {
        return [
            'products' => 'json',
            'products.*.quantity' => 'integer|min:1' 
        ];
    }

    /** Валидация на уровне модели
     * 
     * public static function rules(): Что проверяет:
     *  - products — валидный JSON
     *  - products.*.quantity — целое число ≥ 1 для каждого товара
     * 
     * Как это будет работать в реальности?     * 
     * 1. Пользователь добавляет товар → фронт отправляет: { "cart": {"84": {"quantity": 1}} }
     * 2. Контроллер:
     *  - Проверяет данные через Cart::rules(): $validated = $request->validate(Cart::rules()); // Вот тут!
     *  - Находит/создает корзину через Cart::forUser()
     *  - Сохраняет в БД как JSON
     * 3. При следующем запросе: Laravel автоматически преобразует JSON из БД в массив PHP благодаря $casts.
    */
}