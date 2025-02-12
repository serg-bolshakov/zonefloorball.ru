<div class="registration">
    <!-- <form action="/login" method="POST">  -->
    <form action="" method="POST">
    @csrf
        <p class="registration-form__input-item"><span class="registration-form__title">Форма авторизации</span></p>
        <p class="registration-form__input-item"><span class="registration-form__star">*</span> - поля, обязательные для заполнения </p>
        
        <p class="registration-form__input-item">
            <label class="label" for="email">Логин / электронная почта: </label>
            <input id="email" class="registration-form__input" type="email" name="email" required value="<?php if (isset ($_POST['email'])) echo $_POST['email'] ?>">  
            <span class="registration-error">*<br></span>
        </p>
                
        <p class="registration-form__input-item password">
            <label class="label" for="password">Пароль: </label>
            <input id="password" class="registration-form__input" name="password" type="password" required value="<?php if (isset ($_POST['password'])) echo $_POST['password'] ?>">
            <a href="#" class="password-control" onclick="return show_hide_password(this);"></a>
            <span class="registration-error">*<br>{{ $passwordErr }}</span>
        </p>

        <div class="prop-list">
            <div>
                <input type="checkbox" id="remember_me" name="remember">
                <label for="remember_me">
                    <div class="pop-up__checkbox-block-prop-hint">Запомнить меня
                        <div class="pop-up__checkbox-block-prop-hint-text">При активации данной опции, посещая этот сайт, вы будете автоматически авторизованы без необходимости повторного ввода логина (адреса электронной почты) и пароля, до тех пор, пока сами не выйдите из системы (приложения)...</div>
                    </div>
                </label>
            </div>
        </div>

        <div class="registration-form__input-item">
            @if (Route::has('password.request'))
                <a class="" href="{{ route('password.request') }}">
                    Не помню пароль
                </a>
            @endif
        </div>

        <div class="d-flex flex-sa">
            <button type="submit" class="registration-form__submit-btn" name="regsubbtn" value="regsubmit">Вперёд!</button>
            <a href="<?= $locationString; ?>" class="registration-form__submit-btn" >Отменить</a>
        </div>
        
    </form>
</div>

<script src="{{ asset('js/show-hide-password.js') }}"></script> 