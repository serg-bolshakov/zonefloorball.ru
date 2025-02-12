<x-maket-guest>
    <x-slot:title>Мы кликнули в почте на ссылку для установки нового палоля</x-slot>
    <x-slot:robots>NOFOLLOW, NOINDEX</x-slot>
    <x-slot:description></x-slot>
    <x-slot:keywords></x-slot> 

    <div class="registration">
        
        <form action="/reset-password" method="POST"> 
            @csrf

            <p class="registration-form__input-item"><span class="registration-form__title">Сброс пароля и установка нового</span></p>
            <p class="registration-form__input-item"><span class="registration-form__star">*</span> - поля, обязательные для заполнения </p>

            <!-- Password Reset Token -->
            <input type="hidden" name="token" value="{{ request()->route('token') }}">
                                
            <!-- Email Address -->
            <p class="registration-form__input-item">
                <label class="label" for="email">Логин / электронная почта: </label>
                <input id="email" class="registration-form__input" type="email" name="email" required autofocus autocomplete="username" value="{{ old('email') }}">  
                <span class="registration-error">*<br>@error('email') {{ $message }} @enderror</span>
            </p>
            
            <!-- Password -->
            <p class="registration-form__input-item password">
                <label class="label" for="password">Новый пароль: </label>
                <input id="password" class="registration-form__input" name="password" type="password" required autocomplete="new-password" value="{{ old('password') }}">
                <a href="#" class="password-control" onclick="return show_hide_password(this);"></a>
                <span class="registration-error">*<br>@error('password') {{ $message }} @enderror</span>           
            </p>
            
            <!-- Confirm Password -->
            <p class="registration-form__input-item password">
                <label class="label" for="password_confirmation">Подтвердите новый пароль: </label>
                <input id="password_confirmation" class="registration-form__input" name="password_confirmation" type="password" required autocomplete="new-password">
                <a href="#" class="password-control" onclick="return show_hide_password(this);"></a>
                <span class="registration-error">*<br>@error('password_confirmation') {{ $message }} @enderror</span>           
            </p>

            <div class="d-flex flex-sa">
                <button type="submit" class="forgot-password__form--btn">Установить новый пароль</button>
            </div>
            <div class="d-flex flex-sa"><a href = "/profile" class="changing-form__submit-btn" >Не меняем</a></div>
        </form>
    </div>

    <script src="{{ asset('js/show-hide-password.js') }}"></script> 
</x-maket-guest> 

