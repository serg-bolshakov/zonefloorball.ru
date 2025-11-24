<?php
// app/Http/Requests/StoreReviewRequest.php - для валидации данных отзыва. 

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Проверяем, что пользователь аутентифицирован
        // return auth()->check(); - подразумеваем, что и гости могут оставлять отзыв... если купили товар как "гость"
        
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'product_id' => [
                'required',
                'integer',
                'exists:products,id',
                // Дополнительная проверка, что товар активен
                Rule::exists('products', 'id')->where(function ($query) {
                    $query->where('product_status_id', 1); // ACTIVE
                }),
            ],
            'rating' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],
            'advantages' => [
                'nullable',
                'string',
                'max:500',
            ],
            'disadvantages' => [
                'nullable', 
                'string',
                'max:500',
            ],
            'comment' => [
                'required',
                'string',
                'min:10',
                'max:2000',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'Не указан товар для отзыва',
            'product_id.exists' => 'Указанный товар не существует или неактивен',
            'rating.required' => 'Пожалуйста, поставьте оценку',
            'rating.min' => 'Оценка должна быть от 1 до 5 звёзд',
            'rating.max' => 'Оценка должна быть от 1 до 5 звёзд',
            'advantages.max' => 'Достоинства не должны превышать 500 символов',
            'disadvantages.max' => 'Недостатки не должны превышать 500 символов',
            'comment.required' => 'Пожалуйста, напишите комментарий',
            'comment.min' => 'Комментарий должен содержать минимум 10 символов',
            'comment.max' => 'Комментарий не должен превышать 2000 символов',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'product_id' => 'товар',
            'rating' => 'оценка',
            'advantages' => 'достоинства',
            'disadvantages' => 'недостатки',
            'comment' => 'комментарий',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Очищаем и тримим данные перед валидацией
        $this->merge([
            'advantages' => $this->advantages ? trim($this->advantages) : null,
            'disadvantages' => $this->disadvantages ? trim($this->disadvantages) : null,
            'comment' => trim($this->comment),
        ]);
    }

    /**
     * Handle a passed validation attempt.
     */
    protected function passedValidation(): void
    {
        // Дополнительные проверки после базовой валидации
        $this->ensureUserCanReviewProduct();
    }

    /**
     * Проверка что пользователь может оставить отзыв на товар
     */
    private function ensureUserCanReviewProduct(): void
    {
        $productId = $this->input('product_id');
        $userId = auth()->id();

        // Логируем попытку создания отзыва
        \Log::debug('🔍 StoreReviewRequest: проверка прав пользователя', [
            'user_id' => $userId,
            'product_id' => $productId,
        ]);

        // Здесь можно добавить дополнительные проверки, например:
        // - Пользователь не оставлял уже отзыв на этот товар
        // - Товар был куплен пользователем и доставлен
        // и т.д.

        // Пока просто логируем, основные проверки в ReviewService
    }
}