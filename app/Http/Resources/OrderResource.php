<?php
// app/Http/Resources/OrderResource.php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Enums\OrderStatus;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

    public function toArray(Request $request): array {
               
        $user = Auth::user() ?? null;
        // dd($this);
        
        $data = [
            'id' => $this->id,
            'number' => $this->order_number,
            'order_date' => $this->order_date->format('d.m.Y H:i'),
            'hash' => $this->access_hash,
            'status' => OrderStatus::tryFrom((int)$this->status_id)?->title() ?? 'Статус не определён',     // tryFrom с null-оператором - Безопасное преобразование статуса без исключений.
            'cost' => (int)$this->total_product_amount + (int)$this->order_delivery_cost,
            'delivery' => [
                'type'              => $this->transport->name,
                'address'           => $this->order_delivery_address,
                'tracking_number'   => $this->delivery_tracking_number,
                'estimated_date'    => $this->estimated_delivery_date?->format('d.m.Y'), // estimated_delivery_date может быть null - добавили обработку
                'cost'              => $this->order_delivery_cost
            ],
            'payment' => [
                'method' => [
                    'code'  => $this->payment_method->value,       // 'online'
                    'label' => $this->payment_method->label()      // 'Онлайн-оплата'
                ],
                'status' => [
                    'code'  => $this->payment_status->value,       // 'pending'
                    'label' => $this->payment_status->label()      // 'Ожидает оплаты'
                ],
                'invoice_url' => '/invoice/' . $this->access_hash
            ]
        ];

        return $data;      
    }
    
}
