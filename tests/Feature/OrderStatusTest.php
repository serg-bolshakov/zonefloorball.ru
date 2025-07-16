<?php
// tests/Feature/OrderStatusTest.php
namespace Tests\Feature;
use App\Models\Order;
use App\Enums\OrderStatus;
use Illuminate\Foundation\Testing\DatabaseTransactions; // Откатывает изменения после теста
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class OrderStatusTest extends TestCase {
    use DatabaseTransactions; // Безопасная альтернатива RefreshDatabase

    public function test_status_change_logs_history() {
        $order = Order::factory()->create(['status_id' => 1]);
        $order->changeStatus(OrderStatus::PAID, 'Тест оплаты');
        
        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $order->id,
            'new_status' => OrderStatus::PAID->value,
            'comment' => 'Тест оплаты',
        ]);
    }
}