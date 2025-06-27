<x-maket-guest>
    <x-slot:title>Вход в систему зарегистрированных пользователей</x-slot>
    <x-slot:robots>NOFOLLOW, NOINDEX</x-slot>
    <x-slot:description></x-slot>
    <x-slot:keywords></x-slot> 


<div class="registration">

@if(session('status'))
    {{-- Если был сброс пароля, после записи нового пароля, пользователь переводится сюда и ему будет предложено сразу авторизоваться --}}
    <div class="d-flex flex-sa">
        <div class="forgot-password__form--btn">{{ session('status') }}</div>
    </div>
@endif

    <form action="/login" method="POST"> 
    @csrf
        <input type="hidden" name="from" value="{{ url()->full() }}">
        <p class="registration-form__input-item"><span class="registration-form__title">Форма авторизации</span></p>
        <p class="registration-form__input-item"><span class="registration-form__star">*</span> - поля, обязательные для заполнения </p>
        
        <p class="registration-form__input-item">
            <label class="label" for="email">Электронная почта: </label>
            <input id="email" class="registration-form__input" type="email" name="email" required autofocus autocomplete="username" value="{{ old('email') }}">  
            <span class="registration-error">*<br>@error('email') {{ $message }} @enderror</span>
        </p>
                
        <p class="registration-form__input-item password">
            <label class="label" for="password">Пароль: </label>
            <input id="password" class="registration-form__input" name="password" type="password" autofocus autocomplete="current-password" required value="{{ old('password') }}">
            <a href="#" class="password-control" onclick="return show_hide_password(this);"></a>
            <span class="registration-error">*<br>@error('password') {{ $message }} @enderror</span>           
        </p>

        <div class="prop-list">
            <div>
                <input type="checkbox" id="remember_me" name="remember">
                <label for="remember_me">
                    <button class="modal-trigger" data-modal="remember-me">Запомнить меня</button>    
                </label>
            </div>
        </div>

        <div class="registration-form__input-item">
            @if(Route::has('password.request'))
                <a class="" href="/forgot-password">
                    Не помню пароль 
                </a>
            @endif
        </div>

        <div class="d-flex flex-sa">
            <a href="/" class="registration-form__submit-btn" >Отмена</a>
            <button type="submit" class="registration-form__submit-btn" name="regsubbtn" value="regsubmit">Вперёд</button>
        </div>
        
    </form>
</div>
<!-- Модальное окно "Запомнить меняс" -->
<div id="remember-me" class="modal">
    <div class="modal-content">
        <span class="modal-close">&times;</span>
        <p>При активации данной опции, посещая этот сайт, вы будете автоматически авторизованы без необходимости повторного ввода логина (адреса электронной почты) и пароля, до тех пор, пока сами не выйдите из системы (приложения)...</p>
    </div>
</div>

<script src="{{ asset('js/show-hide-password.js') }}"></script>
<script src="{{ asset('js/modal-window-buttons.js') }}"></script>

</x-maket-guest>    