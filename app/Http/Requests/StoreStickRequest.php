<?php
// app/Http/Requests/StoreStickRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStickRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;       // Разрешаем всем (можно добавить проверку прав) - по умолчанию...
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        return [
            'article'       => 'required|string|max:12|unique:products,article',
            'brandId'       => 'required|integer|exists:brands,id',
            'categoryId'    => 'required|integer|exists:categories,id',
            'model'         => 'nullable|string|max:50',
            'marka'         => 'nullable|string|max:50',
            'shaftFlexId'   => 'required|integer|exists:properties,id',
            'colour'        => 'nullable|string|max:96',
            'material'      => 'nullable|string|max:255',
            'stickSizeId'   => 'required|integer|exists:sizes,id',
            'weight'        => 'nullable|string|max:12',
            'prod_desc'     => 'nullable|string|max:4000',
            'hookId'        => 'required|integer|in:1,2,3',
            'iffId'         => 'required|integer|exists:iff_statuses,id',
        ];
    }

    public function messages() {
        return [
            'article.unique'        => 'Товар с таким артикулом уже существует',
            'brandId.exists'        => 'Выбранный бренд не существует',
            'categoryId.exists'     => 'Выбранная категория не существует',
            // ... другие кастомные сообщения ... пока забьём...
        ];
    }

    // Опционально: подготовка данных перед валидацией - пока просто, чтоб иметь ввиду...
    public function prepareForValidation()
    {
        $this->merge([
            'brandId' => (int)$this->brandId,
            'categoryId' => (int)$this->categoryId,
            // ... другие преобразования
        ]);
    }
}
