<x-maket-guest>
    <x-slot:title>Подтверждение действия</x-slot>
    <x-slot:robots>NOFOLLOW, NOINDEX</x-slot>
    <x-slot:description></x-slot>
    <x-slot:keywords></x-slot> 

    <div class="registration">
        
        <p class="registration-form__input-item">
            <span class="forgot-password__title">{{ __('This is a secure area of the application. Please confirm your password before continuing.') }}</span>
        </p>

        <!-- <form method="POST" action="{{ route('password.confirm') }}"> -->
        <form method="POST" action="/user/confirm-password">
            @csrf

            <!-- Password -->

            <p class="registration-form__input-item password">
                <label class="label" for="password">Введите пароль: </label>
                <input id="password" class="registration-form__input" name="password" type="password" required autocomplete="current-password" value="{{ old('password') }}">
                <a href="#" class="password-control" onclick="return show_hide_password(this);"></a>
                <span class="registration-error">*<br>@error('password') {{ $message }} @enderror</span>           
            </p>
                
            <div class="d-flex flex-sa">
                <button type="submit" class="forgot-password__form--btn">Подтвердить действие</button>
            </div>
            
            <div class="d-flex flex-sa">
                <a class="forgot-password__form--btn--link" href = "/profile">
                    {{ __('Let us not do this.') }}<br>{{ __('Close window.') }}
                </a>
            </div>
        </form>

        <script src="{{ asset('js/show-hide-password.js') }}"></script> 
    </div>
</x-maket-guest>
