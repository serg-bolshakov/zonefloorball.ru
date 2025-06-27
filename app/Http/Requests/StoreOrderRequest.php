<?php
// app/Http/Requests/StoreOrderRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool {
        return true; // Если нужна будет авторизация — поменять на `auth()->check()`
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        $rules = [
            // общие для всех типов покупателей правила валидации входных данных для оформления заказа:
            'customer.type'             => 'required|string|in:guest,individual,legal',
            'delivery.address'          => $this->getAddressRules(),
            'delivery.price'            => 'numeric',
            'delivery.time'             => 'nullable|string',
            'delivery.transportId'      => 'required|numeric',
            'products'                  => 'required|array|min:1',
            'products.*.id'             => 'required|integer',
            'products.*.quantity'       => 'required|integer|min:1',
            'products.*.price'          => 'required|numeric|min:1',
            'paymentMethod'             => 'required|string|in:online,bank_transfer,cash',
            'products_amount'           => 'required|numeric',
            'total'                     => 'required|numeric|min:1',
        ];

        if ($this->input('customer.type') === 'legal') {
            // ... правила для юрлиц
            $rules['customer.orgname']          = 'required|string|max:100';
        } else if ($this->input('customer.type') === 'individual') {
            // ... правила для зарегистрированных и авторизованных физлиц
        } else {
            // ... правила для гостей ('guest') по умолчанию:
            $rules['customer.firstName']        = $this->getNameRules();
            $rules['customer.lastName']         = $this->getNameRules();
            $rules['customer.phone']            = $this->getPhoneRules();
            $rules['customer.email']            = $this->getEmailRules();
            $rules['customer.deliveryAddress']  = $this->getAddressRules();
        }
        
        return $rules;
    }

    public function messages() {
        return [
            // Общие для всех типов
            'customer.type.required' => 'Тип покупателя (guest/individual/legal) обязателен.',
            'customer.type.in' => 'Допустимые типы покупателя: guest, individual, legal.',

            // Для гостей (guest)
            'customer.firstName.required'   => 'Имя обязательно для заполнения.',
            'customer.firstName.regex'      => 'Имя должно быть на русском языке.',
            'customer.firstName.max'        => 'Длина имени по нашему мнению не может превышать :max символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
            'customer.lastName.required'    => 'Фамилия обязательна для заполнения.',
            'customer.lastName.regex'       => 'Фамилия должна быть на русском языке.',
            'customer.lastName.max'         => 'Длина Фамилии по нашему мнению не может превышать :max символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.',
            'customer.phone.required'       => 'Поле: "Телефон" обязательно для заполнения.',
            'customer.phone.regex'          => 'Пожалуйста, укажите номер телефона в указанном формате.',
            'customer.email.required'       => 'Поле email обязательно для заполнения.',
            'customer.email.max'            => 'Поле email слишком длинное.',
            'customer.deliveryAddress.max'  => 'Поле address слишком длинное.',
            'customer.deliveryAddress.regex'=> 'Адрес должен быть на русском языке.',
            
            // Для физлиц (individual) - если будут поля
            // 'customer.passportNumber' => '...',
            
            // Для юрлиц (legal)
            'customer.orgname.required'     => 'Название компании обязательно для юрлиц.',
            'customer.orgname.max'          => 'Название компании не должно превышать :max символов.',
            
            // Доставка и продукты
            'delivery.address.max'          => 'Поле address слишком длинное.',
            'delivery.address.regex'        => 'Адрес доставки должен быть на русском языке.',
            'delivery.price.numeric'        => 'Стоиммость доставки должна быть выражена в числовом эквиваленте.',
            'delivery.transportId.required' => 'Необходимо указать способ доставки (transportId).',
            'delivery.transportId.numeric'  => 'Не опознан вид способа доставки (transportId).',
            'products.*.id.integer'         => 'ID товара должно быть числом.',
            'products.*.quantity.min'       => 'Количество товара не может быть меньше :min.',
            'products.*.price.min'          => 'Товар не может быть бесценным.',
            'products.min'                  => 'Массив продуктов не может быть пустым.',
            
            // ... остальные сообщения
            'paymentMethod.in'              => 'Метод платежа :attribute может быть одним из следующих: :values',
            'products_amount.numeric'       => 'Общая сумма товаров должна быть числом.',
            'total.numeric'                 => 'Общая стоимость заказа должна быть числом.',
            'total.min'                     => 'Общая стоимость заказа должна стоить хоть сколько-то. Хотя бы :min руб.',
        ];
    }

    // Выносим общие правила в отдельные методы для переиспользования
    protected function getNameRules(): array {
        return ['required', 'string', 'max:30', "regex:#^[а-яА-ЯёЁ\s'-]+$#u"];
    }

    protected function getPhoneRules(): array {
        return ['required', "regex:#^(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}$#"];
    }

    protected function getEmailRules(): array {
        return ['required', 'email', 'max:255'];
    }

    protected function getAddressRules(): array {
        return ['nullable', 'max:255', "regex:#^[а-яА-ЯёЁ\d\s.,\"\!:\)\(\/№-]*$#u"];
    }
    
}
