<?php
// app/Http/Controllers/Admin/AdminDocumentController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DocumentService;
use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDocumentController extends Controller
{
    public function __construct(
        private DocumentService $documentService
    ) {}

    /**
     * Список документов
     */
    public function index(Request $request)
    {
        $documents = Document::with(['documentType', 'user', 'createdBy'])
            ->latest()
            ->paginate(50);

        return Inertia::render('AdminDocumentsListPage', [
            'title' => 'Админка. Документы',
            'robots' => 'NOINDEX,NOFOLLOW',
            'description' => '',
            'keywords' => '',
            'documents' => $documents,
            'filters' => $request->all(),
            'documentTypes' => \App\Models\DocumentType::all(), // Передаем типы документов
        ]);
    }

    /**
     * Форма создания документа
     */
    public function create()
    {
        return Inertia::render('AdminDocumentCreatePage', [
            'title'         => 'Админка. Создание документа',
            'robots'        => 'NOINDEX,NOFOLLOW', 
            'description'   => '',
            'keywords'      => '',
            'documentTypes' => \App\Models\DocumentType::all(),
            'units'         => \App\Models\ProductUnit::all(),
            'products'      => \App\Models\Product::select('id', 'article', 'title')->get(),
        ]);
    }

    /**
     * Сохранение нового документа
     */
    public function store(Request $request) {

        /**
         * Ожидаем: {document_type_id: 3, document_date: '2025-11-05', comment: '', items: Array(1)} 
         * comment: "" document_date: "2025-11-05"
         * document_type_id:3
         * items:Array(1) 
         * 0:price: 555, product_article: "7010606", product_id: 229, product_name:"Рукоятка для клюшек Алетерс AIR CONCEPT 33 80cm, black/white", quantity: 101, total: 56055, unit_id: 1...
         */

        \Log::info('🎯 Creating document STARTED', [
            'document_type_id' => $request->document_type_id,
            'document_date' => $request->document_date,
            'request_data' => $request->all()
        ]);

        $validated = $request->validate([
            'document_type_id' => 'required|integer',
            'document_date' => 'required|date',
            'user_id' => 'sometimes|integer|nullable',
            'comment' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.unit_id' => 'required|integer',
        ]);

         \Log::debug('✅ Валидация пройдена', [
            'validated_data' => $validated
        ]);

        try {
            \Log::debug('🔄 Передаём валидированные данные в documentService->createDocument($validated)');
            $document = $this->documentService->createDocument($validated); // ✅ $document уже содержит items благодаря load()
            
            // На странице просмотра можно сразу показать позиции
            return redirect()
                ->route('admin.documents.show', $document)
                ->with('success', 'Документ успешно создан');
                
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Просмотр документа
     */
    public function show(Document $document)
    {
        $document->load(['items.product', 'items.unit', 'documentType', 'user', 'createdBy']);

        return Inertia::render('AdminDocumentShowPage', [
            'title' => 'Админка. Документ ' . $document->document_number,
            'robots' => 'NOINDEX,NOFOLLOW',
            'description' => '',
            'keywords' => '', 
            'document' => $document,
        ]);
    }

    // Другие методы: edit, update, post, destroy...
    
}
