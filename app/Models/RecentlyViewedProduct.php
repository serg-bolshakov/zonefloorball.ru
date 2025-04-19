<?php
// app/Models/RecentlyViewedProduct.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon; 
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Знакомимся с Carbon-ом:
 *  Carbon — это "магия" для дат в Laravel - популярная PHP-библиотека для работы с датами и временем, 
 *  расширяющая стандартный класс DateTime. Она добавляет удобные методы для манипуляций с датами.
 * 
 *  Основные возможности Carbon:
 *  1. Создание дат из разных форматов: 
 *      - Carbon::now(); // Текущее время
 *      - Carbon::createFromTimestampMs(1640995200000); // Из timestamp в миллисекундах
 *  2. Форматирование:
 *      - $date->format('Y-m-d H:i:s'); // "2023-12-31 23:59:59"
 *      - $date->toIso8601String(); // ISO-8601
 *  3. Манипуляции:
 *      - $date->addDays(7); // +7 дней
 *      - $date->subHours(3); // -3 часа
 *  4. Сравнение:
 *      - $date->isPast(); // true/false
 *      - $date->diffInMinutes($otherDate); // Разница в минутах
 */
class RecentlyViewedProduct extends Model {
    use HasFactory;

    protected $fillable = ['user_id', 'product_id', 'viewed_at'];

    // Валидация JSON в Laravel: Автоматическая конвертация в Carbon при работе с полем
    protected $casts = [
        'viewed_at' => 'datetime:Y-m-d H:i:s.v',  // Автоматическая конвертация ... для миллисекунд
        // Теперь $model->viewed_at вернёт Carbon-объект
    ];

    /** касты - это пользовательские приведения типов?
     * 
     * Как работают кастомные касты
     * Любой объект, реализующий новый контракт CastsAttributes, можно использовать в модели в свойстве $casts. 
     * При доступе к свойствам модели, перед тем как передать его нам, Eloquent сначала проверяет, есть ли кастомный каст 
     * для преобразования значения. 
     * 
     * Каст будет вызываться при каждой get— и set-операции, поэтому рассмотреть возможность кэширования интенсивных операций!
    */
    
    // Один пользователь у многих записей
    /*public function user() {
        return $this->belongsTo(User::class);
    }*/
    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    // Один продукт у многих записей
    /*public function product() {
        return $this->belongsTo(Product::class);
    }*/

    /** отношение belongsToMany нужно для промежуточных таблиц (например, product_user без дополнительных полей). 
     *  У нас сейчас таблица — самостоятельная сущность с данными (viewed_at), поэтому здесь используем belongsTo...     * 
    */

    public function product(): BelongsTo {
        return $this->belongsTo(Product::class);
    } 

    // products:[{productId:47, timestamp:1744962682367}, {productId:2, timestamp:1744898776201}, {productId:157, timestamp:1744897309278}]
    public static function validationRules(): array {
        return [
            'products' => 'required|array|max:6', // Лимит 6 товаров
            'products.*.productId' => 'required|integer|exists:products,id',    // Проверка существования товаров (exists:products,id)
            'products.*.timestamp' => [
                'required', 
                'integer', 
                'min:0',
                function ($attribute, $value, $fail) {
                    if ($value > now()->addDay()->getTimestampMs()) {
                        $fail('Время просмотра не может быть в будущем');
                    }
                }
            ]
        ];
    }

    public static function processRequest(int $userId, array $products): array {
        $items = collect($products)
            ->sortByDesc('timestamp')
            ->unique()
            ->take(6) // Берем только 6 последних
            ->mapWithKeys(function ($item) {
                return [$item['productId'] => $item['timestamp']];
            });

        // Получаем существующие записи
        $existing = self::where('user_id', $userId)
        ->whereIn('product_id', $items->keys())
        ->get()
        ->keyBy('product_id');

        foreach ($items as $productId => $timestamp) {
            // Если запись уже есть - обновляем время ТОЛЬКО если новый просмотр свежее
            if ($existing->has($productId)) {
                $existingTimestamp = $existing->get($productId)->viewed_at->getTimestampMs();
                if ($timestamp > $existingTimestamp) {
                    self::where([
                        'user_id' => $userId,
                        'product_id' => $productId
                    ])->update(['viewed_at' => $timestamp]);
                }
            } 
            // Если записи нет - создаем новую
            else {
                self::create([
                    'user_id' => $userId,
                    'product_id' => $productId,
                    'viewed_at' => Carbon::createFromTimestampMs($timestamp)
                    // $timestamp — это Unix-время в миллисекундах (например, 1640995200000), полученное с фронтенда.
                    // createFromTimestampMs() конвертирует его в объект Carbon, который Laravel автоматически сохранит в БД как datetime.
                ]);
            }
        }

        /** Пример работы с Carbon:
         *  Допустим, фронтенд прислал: {"productId": 47, "timestamp": 1744962682367}
         *  1. Конвертация: $carbonDate = Carbon::createFromTimestampMs(1744962682367); // Результат: Carbon-объект с датой "2025-04-16 12:51:22.367" 
         *  2. Сохранение в БД: Записывается как DATETIME: "2025-04-16 12:51:22"
         *  3. Дальнейшее использование: $product->viewed_at->diffForHumans(); // "2 дня назад" 
        */

        // Возвращаем актуальные данные
        return self::getRecentlyViewed($userId);
    }    

    public static function getRecentlyViewed(int $userId): array {
        return self::with('product')
            ->where('user_id', $userId)
            ->orderByDesc('viewed_at')
            ->limit(6)
            ->get()
            ->map(function ($item) {
                return [
                    'productId' => $item->product_id,
                    'timestamp' => $item->viewed_at->getTimestampMs()
                ];
            })
        ->toArray();
    }

    // Автоматическая загрузка корзины для авторизованного пользователя - ПОКА НЕ ИСПОЛЬЗУЕМ _ ПРОСТО ДЛЯ ИНФОРМАЦИИ _ КАК ДЕДАЛ ДО ФИНАЛЬНОГО РЕЛИЗА
    public static function forUser(User $user): self {
        return self::firstOrCreate(['user_id' => $user->id]);
    }

    // метод для получения Недавно просмотренных товаров - ПОКА НЕ ИСПОЛЬЗУЕМ _ ПРОСТО ДЛЯ ИНФОРМАЦИИ _ КАК ДЕДАЛ ДО ФИНАЛЬНОГО РЕЛИЗА
    public static function getRecentlyViewedItems(array $productIds) {
        return Product::with([
            'actualPrice', 
            'regularPrice', 
            'productReport', 
            'productShowCaseImage'
            ])
            ->where('product_status_id', '=', 1)
            ->whereIn('id', $productIds)
        ->get();   
    }

    // Метод для добавления просмотра с проверкой времени
    public static function addView(int $userId, int $productId, int $frontendTimestamp): void {
        $newViewTime = Carbon::createFromTimestampMs($frontendTimestamp);
        
        self::updateOrCreate(
            ['user_id' => $userId, 'product_id' => $productId],
            ['viewed_at' => $newViewTime] // Сохраняем именно фронтенд-время
        );
    }

    // Получить свежие просмотры (за последние 7 дней)
    public static function getRecentViews(int $userId) {
        return self::where('user_id', $userId)
            ->where('viewed_at', '>=', Carbon::now()->subDays(7)) // Carbon-магия!
            ->orderBy('viewed_at', 'desc')
            ->get();
    }

    // Форматирование даты для API (например, "2 часа назад") 
    public function getHumanReadableDateAttribute(): string {
        return $this->viewed_at->diffForHumans(); // Встроенный метод Carbon
    }

    /** Как это работает?
     *  Где-то в контроллере: 
     *      - $productId = 47;
     *      - $frontendTimestamp = 1744962682367; // Получено от JS (Date.now())
     *  Добавляем просмотр: 
     *      - RecentlyViewedProduct::addView(auth()->id(), $productId, $frontendTimestamp);
     *  Получаем данные: 
     *      - $views = RecentlyViewedProduct::getRecentViews(auth()->id());
     *      -   foreach ($views as $view) {
     *             echo $view->human_readable_date; // "5 минут назад", "3 часа назад"
     *          }
     */
}