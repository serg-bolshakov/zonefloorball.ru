<x-maket-guest>
    
    <div class="registration">

        <x-slot:title>Смена пароля</x-slot>
        <x-slot:robots>NOFOLLOW, NOINDEX</x-slot>
        <x-slot:description></x-slot>
        <x-slot:keywords></x-slot> 

        @if (session('status') == 'password-updated')
            <div class="forgot-password__title">
                {{-- Здесь перевод не работает!!! --}} {{-- __('Welcome!') --}}
                Ваш пароль был успешно изменён! Далее, при входе в систему, используйте его.
            </div>
            <div class="d-flex flex-sa margin-top8px margin-bottom8px">
                <a href = "/profile" class="forgot-password__form--btn--link" >
                    {{-- __('Perfect!') --}} {{-- __('Close window.') --}}
                    Отлично! Закрыть окно.
                </a>
            </div>
        @else

        <!-- <form action="{{ route('user-password.update') }}" method="POST">  -->
        <form action="/user/password" method="POST">
            @csrf
            @method('PUT')

            <p class="registration-form__input-item"><span class="registration-form__title">Форма смены пароля</span></p>
            <p class="registration-form__input-item"><span class="registration-form__star">*</span> - поля, обязательные для заполнения </p>

            <!-- Текущий пароль -->
            <p class="registration-form__input-item password">
                <label class="label" for="current_password">Текущий пароль {{ __('Current Password') }}</label>
                <input id="current_password"  class="registration-form__input" type="password" name="current_password" required autocomplete="current-password" value="{{ old('current_password') }}">
                <a href="#" class="password-control" onclick="return show_hide_current_password(this);"></a>
                <span class="registration-error">*<br>@error('current_password') {{ $message }} @enderror</span>
            </p>
            
            <!-- Новый пароль -->
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
                <a href="#" class="password-control" onclick="return show_hide_password_confirmation(this);"></a>
                <span class="registration-error">*<br>@error('password_confirmation') {{ $message }} @enderror</span>           
            </p>

            <div class="d-flex flex-sa">
                <button type="submit" class="forgot-password__form--btn">Установить новый пароль</button>
            </div>
            <div class="d-flex flex-sa"><a href = "/profile" class="changing-form__submit-btn" >Не меняем</a></div>
        </form>

        <script src="{{ asset('js/show-hide-inputs.js') }}"></script> 

        @endif
    </div>
    
</x-maket-guest> 

