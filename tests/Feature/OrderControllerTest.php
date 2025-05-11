<?php
// tests/Feature/OrderControllerTest.php
namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;      // C этим потерял ВСЮ БД... умножил на ноль... 
use Illuminate\Foundation\Testing\DatabaseTransactions; // Откатывает изменения после теста

use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    // use RefreshDatabase; // Сбрасывает БД после каждого теста
    use DatabaseTransactions; // Безопасная альтернатива RefreshDatabase
    
    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    /** @test */
    public function guest_can_create_order_with_valid_data()
    {
        // 1. Arrange: Подготовка данных
        $data = [
            'customer' => [
                'type' => 'guest',
                'firstName' => 'Иван',
                'lastName' => 'Иванов',
                'phone' => '+7 (999) 123-45-67',
                'email' => 'ivan@test.ru',
                'deliveryAddress' => 'Самовывоз: Нижний Новгород, ул. Бекетова, 3А.',
            ],
            'delivery' => [
                'address' => 'Самовывоз: Нижний Новгород, ул. Бекетова, 3А.',
                'price' => 0,
                'time' => '1-2 дня',
                'transportId' => 1,
            ],
            'paymentMethod' => 'online',
            'products' => [
                ['id' => 65, 'quantity' => 1, 'price' => 17990],
                ['id' => 78, 'quantity' => 1, 'price' => 8990],
            ],
            'products_amount' => 26980,
            'total' => 26980,
        ];

        // 2. Act: Вызов API
        $response = $this->postJson('/api/orders/create', $data);

        // 3. Assert: Проверки
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'order_id',
                'invoice_url',
                'order_url'
            ]);
    }

    /** @test */
    public function it_rejects_invalid_order_data()
    {
        $invalidData = [
            'customer' => ['type' => 'guest'], // Не хватает обязательных полей
            'delivery' => ['address' => 'test'], // Добавляем обязательное поле
            'paymentMethod' => 'online', // Добавляем обязательное поле
            'products' => [['id' => 1, 'quantity' => 1]] // Добавляем обязательное поле
        ];

        $response = $this->postJson('/api/orders/create', $invalidData);

        $response->assertStatus(422)                    //  422 Unprocessable Entity с ошибками валидации.
            ->assertJsonValidationErrors([
                'customer.firstName',
                'customer.lastName',
                'products'
            ]);
    }

}
