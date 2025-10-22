<?php
// app/Http/Controllers/Admin/AdminOrderController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Enums\OrderStatus;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $perPage        = (int)($request->input('perPage') ?? 25);
        $page           = (int)($request->input('page') ?? 1);
        $sortBy         = $request->input('sortBy') ?? 'created_at';
        $sortOrder      = $request->input('sortOrder') ?? 'desc';
        
        $searchTerm     = $request->input('search') ?? '';
        $searchType     = $request->input('searchType') ?? 'order_number';
        $statusFilter   = $request->input('status') ?? 'all';

        $dateFrom       = $request->input('dateFrom') ?? '';
        $dateTo         = $request->input('dateTo') ?? '';
                
        \Log::debug('AdminOrderController index request:', $request->all());

        // Создаём базовый запрос
        $query = Order::query()
            ->with(['user', 'statusHistory',
                'items.product' // Загружаем items с связанными продуктами
            ])            
            ->orderBy($sortBy, $sortOrder);

        // Фильтрация по статусу
        if ($statusFilter !== 'all') {
            $query->where('status_id', (int)$statusFilter);
        }

        // Фильтрация по дате (только если не пустые строки)
        if ($dateFrom !== '') {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo !== '') {
            $query->whereDate('created_at', '<=', $dateTo);
        }
        
        // Вместо проверки на null/empty - проверяем на непустую строку
        if ($searchTerm !== '') {
            $query->where(function($q) use ($searchTerm, $searchType) {
                if ($searchType === 'order_number') {
                    $q->where('id', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('order_number', 'LIKE', "%{$searchTerm}%");
                } else {
                    $q->where('order_recipient_names', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('user', function($userQuery) use ($searchTerm) {
                          $userQuery->where('email', 'LIKE', "%{$searchTerm}%")
                                   ->orWhere('name', 'LIKE', "%{$searchTerm}%");
                      });
                }
            });
        }
        
        $orders = $query->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('AdminOrdersListPage', [
            'title'          => 'Админка. Заказы',
            'robots'         => 'NOINDEX,NOFOLLOW',
            'description'    => '',
            'keywords'       => '',
            'orders'         => $orders,
            'filters' => [
                'search'     => $searchTerm,    // всегда string
                'searchType' => $searchType,
                'status'     => $statusFilter,
                'sortBy'     => $sortBy,
                'sortOrder'  => $sortOrder,
                'perPage'    => $perPage,
                'dateFrom'   => $dateFrom,      // всегда string (пустая или с датой)
                'dateTo'     => $dateTo,        // всегда string
            ],
            // 'statusOptions' => $this->getStatusOptions()
        ]);
    }

    private function getStatusOptions(): array {
        $options = [['value' => 'all', 'label' => 'Все статусы']];
        
        foreach (OrderStatus::cases() as $status) {
            $options[] = [
                'value' => $status->value,
                'label' => $status->title()
            ];
        }
        
        return $options;
    }
    
    public function updateStatus(Order $order, Request $request) {
        
        \Log::debug('AdminOrderController updateStatus full request:', [
            'route_parameters' => $request->route()->parameters(),
            'order_id_from_route' => $request->route('order'),
            'order_model' => $order->toArray(),
            'order_id' => $order->id ?? 'NULL',
            'request_data' => $request->all()
        ]);
        
        $request->validate([
            'status'    => 'required|integer',
            // 'track_num' => 'nullable|string|max:40',
            'comment'   => 'nullable|string'
        ]);
        
        try {
            $oldStatus = $order->status_id; // Берём исходное значение из БД   
            $newStatus = OrderStatus::fromValue($request->status);
            
            DB::transaction(function () use ($order, $newStatus, $oldStatus, $request) {
                // Обновляем статус
                $order->update(['status_id' => $newStatus->value]);
                
                // Логируем изменение
                $order->statusHistory()->create([
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus->value,
                    'comment' => $request->comment ?? '',
                    'created_at' => now(),
                ]);
            });
            
            return redirect()->back()->with('success', 'Статус обновлен');
            
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()->with('error', 'Неверный статус заказа');
        }
    }

    public function updateTrackNumber(Request $request, Order $order) {
        $validated = $request->validate([
            'track_number' => 'required|string',
            'comment' => 'required|string'      // фронтенд всегда генерирует комментарий
        ]);
        
        
        try {
            // Сохраняем текущий статус ДО начала транзакции
            $currentStatus = $order->status_id; // Берём исходное значение из БД 
            
            DB::transaction(function () use ($order, $currentStatus, $validated) {
                
                // Обновляем трек-номер
                $order->update(['order_track_num' => $validated['track_number']]);
                
                // Логируем изменение (статус не обновляем!, изменяем только комментарий, который увидит покупатель)
                // Добавляем комментарий с трек-номером
                $order->statusHistory()->create([
                    'old_status' => $currentStatus,
                    'new_status' => $currentStatus, // статус не меняем!
                    'comment' => $validated['comment'],
                    'created_at' => now(),
                ]);
            });
            
            // Для AJAX запросов возвращаем JSON
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Трек-номер успешно обновлен',
                    'order' => $order->fresh() // возвращаем обновленные данные
                ]);
            }
            
            return redirect()->back()->with('success', 'Трек-номер успешно обновлен');
            
        } catch (\Exception $e) {                               // ловим все исключения
            \Log::error('Ошибка обновления трек-номера', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка при обновлении трек-номера'
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Ошибка при обновлении трек-номера');
        }
    }
}