<?php
// app/Http/Requests/MarkAsHelpfulRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MarkAsHelpfulRequest extends FormRequest {

    public function rules(): array {
        return [
            'reviewId' => 'required|integer|exists:reviews,id',
            'isHelpful' => 'required|boolean'
        ];
    }
    
    public function messages(): array {
        return [
            'reviewId.required' => 'ID отзыва обязателен',
            'reviewId.exists' => 'Отзыв не найден'
        ];
    }
}