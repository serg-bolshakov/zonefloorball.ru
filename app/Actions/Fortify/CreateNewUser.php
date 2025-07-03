<?php
namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

/* Если вы не хотите использовать метод validate запроса, то вы можете создать экземпляр валидатора вручную, 
   используя фасад Validator. Метод make фасада генерирует новый экземпляр валидатора: */
use Illuminate\Support\Facades\Validator;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */

    public function create(array $input): User {
        
        // используем самописный контроллер для регистрации, сюда не попадаем!!!
        
        // отключаем стандартные маршруты Fortify config/fortify.php и найдите раздел features
        // Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
        // Route::post('/register', [RegisteredUserController::class, 'store']);
        
    }
}
