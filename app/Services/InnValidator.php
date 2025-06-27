<?php

// проверка ИНН

namespace App\Services;

class InnValidator {
    public static function validate(string $inn): bool {
        if (!preg_match('/^\d{10,12}$/', $inn)) {
            return false;
        }

        return strlen($inn) === 10 
            ? self::validateJuridicalInn($inn) 
            : self::validateIndividualInn($inn);
    }

    private static function validateJuridicalInn(string $inn): bool {
        // Проверка 10-значного ИНН (юрлица)
        if (strlen($inn) === 10) {
            $weights = [2, 4, 10, 3, 5, 9, 4, 6, 8];
            $sum = 0;
            
            for ($i = 0; $i < 9; $i++) {
                $sum += (int)$inn[$i] * $weights[$i];
            }
            
            $control = ($sum % 11) % 10;
            return $control === (int)$inn[9];
        }
    }

    private static function validateIndividualInn(string $inn): bool {
        // Проверка 12-значного ИНН (физлица/ИП)
        if (strlen($inn) === 12) {
            $weightsStage1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
            $sumStage1 = 0;
            
            for ($i = 0; $i < 10; $i++) {
                $sumStage1 += (int)$inn[$i] * $weightsStage1[$i];
            }
            
            $controlStage1 = ($sumStage1 % 11) % 10;
            
            $weightsStage2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
            $sumStage2 = 0;
            
            for ($i = 0; $i < 11; $i++) {
                $sumStage2 += (int)$inn[$i] * $weightsStage2[$i];
            }
            
            $controlStage2 = ($sumStage2 % 11) % 10;
            
            return $controlStage1 === (int)$inn[10] && $controlStage2 === (int)$inn[11];
        }

        return false;
    }
}