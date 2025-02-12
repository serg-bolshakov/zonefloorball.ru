<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\UpdatesUserPasswords;

class UpdateUserPassword implements UpdatesUserPasswords
{
    use PasswordValidationRules;

    /**
     * Validate and update the user's password.
     *
     * @param  array<string, string>  $input
     */
    
     public function update($user, array $input)
     {
         Validator::make($input, [
             'current_password' => ['required', 'string'],
             'password' => $this->passwordRules(),
         ])->after(function ($validator) use ($user, $input) {
             if (!isset($input['current_password']) || !Hash::check($input['current_password'], $user->password)) {
                 $validator->errors()->add('current_password', __('The provided password does not match your current password.'));
             }
         })->validate();
 
         $user->forceFill([
             'password' => Hash::make($input['password']),
         ])->save();
     }
    
    
     /* комментируем оригинальный код функции 07.01.2025 - если его использовать, то смена поароля не происходит, а происходит переадресация на /update-password
     public function update(User $user, array $input): void
    {
         dump($input);
        Validator::make($input, [
            'current_password' => ['required', 'string', 'current_password:web'],
            'password' => $this->passwordRules(),
        ], [
            'current_password.current_password' => __('The provided password does not match your current password.'),
        ])->validateWithBag('updatePassword');
        dd($input);
        $user->forceFill([
            'password' => Hash::make($input['password']),
        ])->save();
    }
    */
}
