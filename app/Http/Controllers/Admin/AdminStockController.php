<?php
// App\Http\Controllers\Admin\AdminStockController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductReport;

class AdminStockController extends Controller {
    
    public function manual(Request $request) {
        \Log::debug('AdminStockController begin1', [
            '$request' => $request->all(),
        ]);
        try {
            $responseData = $this->getResponseData($request);
            // dd($responseData);
            return Inertia::render('AdminStockUpdateManualPage', $responseData);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function manualUpdate(Request $request, $productId) {
        
        // Валидируем только нужные поля
        $validated = $request->validate([
            'in_stock'      => 'sometimes|integer|min:0',
            'on_sale'       => 'sometimes|integer|min:0',
            'reserved'      => 'sometimes|integer|min:0',
            'on_preorder'   => 'sometimes|integer|min:0',
            'preordered'    => 'sometimes|integer|min:0',
        ]);

        \Log::debug('AdminStockController: manualUpdate', [
            'request' => $request->all(),
            'productId' => $productId,
            'validated' =>$validated
        ]);

        $validated['updated_at'] = now();

        // Находим запись об остатках для этого товара и обновляем
        $updated = DB::table('product_reports')
            ->where('product_id', $productId)
            ->update($validated);

        if (!$updated) {
            return redirect()->route('admin.stocks.manual')->with('error', 'Такого товара не найдено!');
        }

        return redirect()->route('admin.stocks.manual')->with('success', 'Остатки успешно обновлены!');
    }

    protected function getResponseData(Request $request) {

        $perPage    = (int)$request->input('perPage', 25);
        $page       = (int)$request->input('page', 1);

        $searchTerm = $request->input('search');
        $searchType = $request->input('searchType', 'article'); // По умолчанию поиск по артикулу

        // Базовый запрос с JOIN вместо with()
        $query = DB::table('products as p')
            ->leftJoin('product_reports as pr', 'p.id', '=', 'pr.product_id')
            ->select(
                'p.id',
                'p.article',
                'p.title',
                'pr.in_stock',
                'pr.on_sale',
                'pr.reserved',
                'pr.on_preorder',
                'pr.preordered'
            )
            ->orderBy('p.article');


        // Поиск
        if ($searchTerm) {
            if ($searchType === 'article') {
                $query->where('p.article', 'LIKE', "%{$searchTerm}%");
            } else {
                $query->where('p.title', 'LIKE', "%{$searchTerm}%");
            }
        }

        // Пагинация - используем простой paginate()
        $products = $query->paginate($perPage, ['*'], 'page', $page);
        
        // Формируем данные для ответа
        $responseData = [
            'title'         => 'Админка. Обновление остатков',
            'robots'        => 'NOINDEX,NOFOLLOW',
            'description'   => '',
            'keywords'      => '',
            'products'      => $products,
            'search'        => $request->input('search', ''),
            'searchType'    => $request->input('searchType', 'article'),
        ];
        // dd($responseData);
        return $responseData;
    }
}