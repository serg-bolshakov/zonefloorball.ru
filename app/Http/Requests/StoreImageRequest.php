<?php
// app/Http/Requests/StoreImageRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;

class StoreImageRequest extends FormRequest {
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool {
        return true;       // Разрешаем всем (можно добавить проверку прав) - по умолчанию...
        // возможная логика прав: return auth()->check() && auth()->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    
    
    // Валидация ОСНОВНЫХ полей
    public function rules(): array {
        return [
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'metadata' => 'required|json',
        ];
    }

    public function messages(): array {
        return [
            'images.*.required' => 'Каждое изображение обязательно',
            'images.*.image' => 'Файл должен быть изображением',
            'images.*.mimes' => 'Разрешены только jpeg, png, jpg, gif, webp',
            'images.*.max' => 'Размер изображения не должен превышать 2MB',
            'metadata.required' => 'Метаданные обязательны',
            'metadata.json' => 'Метаданные должны быть в формате JSON',
        ];
    }

    // Опционально: кастомный формат ошибок
    protected function failedValidation(Validator $validator) {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Ошибки валидации',
            'errors' => $validator->errors()
        ], 422));
    }
}