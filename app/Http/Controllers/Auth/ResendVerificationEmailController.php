<?php
// app/Http/Controllers/Auth
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ResendVerificationEmailController extends Controller
{
    public function resend(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return back()->withErrors(['email' => 'Пользователь с таким email не найден.']);
        }

        if ($user->hasVerifiedEmail()) {
            return back()->with('status', 'Email уже подтвержден.');
        }

        // Отправляем письмо с подтверждением
        $user->sendEmailVerificationNotification();

        return back()->with('status', 'Ссылка для подтверждения email отправлена.');
    }
}