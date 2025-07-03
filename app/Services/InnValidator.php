<?php

// проверка ИНН
// app/Services/InnValidator.php

/*  Пример использования:
     // В форме регистрации
    $request->validate([
        'org_inn' => ValidationRules::innRules(),
    ]);

    // В форме редактирования
    $request->validate([
        'org_inn' => ValidationRules::innRules($user),
    ]); 
  
*/

namespace App\Services;

use Illuminate\Contracts\Validation\Rule;
use Illuminate\Contracts\Validation\ValidatorAwareRule;
use Illuminate\Validation\Validator;

class InnValidator implements Rule, ValidatorAwareRule
{
    protected Validator $validator;
    
    public function passes($attribute, $value): bool
    {
        if (!is_string($value)) {
            return false;
        }

        if (!preg_match('/^\d{10,12}$/', $value)) {
            return false;
        }

        return strlen($value) === 10 
            ? $this->validateJuridicalInn($value) 
            : $this->validateIndividualInn($value);
    }

    public function message(): string
    {
        return 'Некорректный ИНН. Пожалуйста, укажите действительный ИНН.';
    }

    public function setValidator($validator): static
    {
        $this->validator = $validator;
        return $this;
    }

    protected function validateJuridicalInn(string $inn): bool
    {
        $weights = [2, 4, 10, 3, 5, 9, 4, 6, 8];
        $sum = 0;
        
        for ($i = 0; $i < 9; $i++) {
            $sum += (int)$inn[$i] * $weights[$i];
        }
        
        return ($sum % 11 % 10) === (int)$inn[9];
    }

    protected function validateIndividualInn(string $inn): bool
    {
        // Проверка первого контрольного числа
        $weightsStage1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
        $sumStage1 = array_sum(array_map(
            fn($weight, $digit) => $weight * (int)$digit,
            $weightsStage1,
            str_split(substr($inn, 0, 10))
        ));
        
        if (($sumStage1 % 11 % 10) !== (int)$inn[10]) {
            return false;
        }
        
        // Проверка второго контрольного числа
        $weightsStage2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
        $sumStage2 = array_sum(array_map(
            fn($weight, $digit) => $weight * (int)$digit,
            $weightsStage2,
            str_split(substr($inn, 0, 11))
        ));
        
        return ($sumStage2 % 11 % 10) === (int)$inn[11];
    }
}