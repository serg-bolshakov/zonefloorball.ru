<?php
// tests/Unit/PaymentMethodTest.php
namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Enums\PaymentMethod;
use Illuminate\Http\Request;

class PaymentMethodTest extends TestCase
{
    /** @test */
    public function it_returns_bank_transfer_for_legal_invoice()
    {
        // Для POST-запроса нужно использовать $request->replace() или правильный конструктор
        $request = new Request();
        $request->replace([
            'paymentMethod' => 'invoice',
            'customer' => ['type' => 'legal']
        ]);

        $this->assertEquals(
            PaymentMethod::BANK_TRANSFER->value,
            PaymentMethod::forRequest($request)->value
        );
    }

    /** @test */
    public function it_returns_online_by_default()
    {
        $request = new Request();
        $request->replace([
            'paymentMethod' => 'any_value',
            'customer' => ['type' => 'individual']
        ]);

        $this->assertEquals(
            PaymentMethod::ONLINE->value,
            PaymentMethod::forRequest($request)->value
        );
    }
}
