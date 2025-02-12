<x-maket-guest>
    <x-slot:title>Мы кликнули. что не помним пароль</x-slot>
    <x-slot:robots>NOFOLLOW, NOINDEX</x-slot>
    <x-slot:description></x-slot>
    <x-slot:keywords></x-slot> 

    
    <div class="registration">

        <!-- Session Status После перенаправления обратно к конечной точке /forgot-password после успешного запроса переменная 
         сессии status может использоваться для отображения состояния попытки запроса ссылки для сброса пароля.-->

        @if (session('status'))
            <div class="registration-form__input-item margin-top8px margin-bottom8px">
                {{ session('status') }}
            </div>
            <div class="d-flex flex-sa margin-top8px margin-bottom8px">
                <a href = "/" class="registration-form__submit-btn" >{{ __('Perfect!') }}</a>
            </div>
        @else
            <p class="registration-form__input-item">
                <span class="forgot-password__title">{{ __('Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.') }}</span>
                <!-- Забыли свой пароль? Ничего страшного. Пожалуйста,
                введите адрес электронной почты, который вы указали при регистрации в качестве логина, и мы вышлем вам по этому адресу ссылку, 
                пройдя по которой, вы сможете придумать и установить новый пароль. -->
            </p>
            <form method="POST" action="/forgot-password">
                @csrf

                <!-- Email Address -->
                <p class="registration-form__input-item">
                    <label class="label" for="email">Логин / электронная почта: </label>
                    <input id="email" class="registration-form__input" type="email" name="email" required value="{{ old('email') }}">  
                    <span class="registration-error">*<br>@error('email') {{ $message }} @enderror</span>
                </p>

                <div class="d-flex flex-sa">
                    <button type="submit" class="forgot-password__form--btn">Получить ссылку для восстановления пароля</button>
                </div>
                <div class="d-flex flex-sa">
                    <a href = "/login" class = "forgot-password__form--btn--link" >Ой! Помню.</a>
                </div>
            </form>
        @endif
    </div>
</x-maket-guest> 

