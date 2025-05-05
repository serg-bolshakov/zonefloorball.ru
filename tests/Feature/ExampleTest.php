<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Enums\PaymentMethod;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    use RefreshDatabase; // Сбрасывает БД после каждого теста

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
                'email' => 'ivan@test.ru'
            ],
            'paymentMethod' => 'online',
            'products' => [
                ['id' => 1, 'quantity' => 2]
            ]
        ];

        // 2. Act: Вызов API
        $response = $this->postJson('/api/orders/create', $data);

        // 3. Assert: Проверки
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'order_id',
                'invoice_url'
            ]);
    }
}
