<x-maket-guest>
    
    <div class="registration">

        <x-slot:title>Смена адреса электронной почты</x-slot>
        <x-slot:robots>NOFOLLOW, NOINDEX</x-slot>
        <x-slot:description></x-slot>
        <x-slot:keywords></x-slot> 

        @if (session('status') == 'profile-information-updated')
            <div class="forgot-password__title">
                Вам отправлена новая ссылка для подтверждения адреса электронной почты!
            </div>
            <div class="d-flex flex-sa margin-top8px margin-bottom8px">
                <a href = "/" class="forgot-password__form--btn--link" >
                    {{-- __('Perfect!') --}} {{-- __('Close window.') --}}
                    Отлично! Закрыть окно.
                </a>
            </div>
        @else

        <div class="registration-form__input-item">
                <span class="forgot-password__title">
                    {{-- почему-то не работает здесь перевод, комментируем: __('To enjoy all the benefits provided to registered and authorized users, please confirm the e-mail address you provided, to which the letter containing the link for address confirmation was sent. If you do not see the letter, just in case, check the "Spam" folder. Did not receive the letter? We will be happy to send you another one.) --}}
                </span>
                <div class="notification-text">
                    <h2>Смена адреса электронной почты - это серьёзное решение!</h2>
                    <p>Надеемся это того стоит. Вы временно (до подтверждения нового адреса) не будете иметь доступа к своему профилю.</p>
                    <p>По указанному новому электронному адресу будет отправлено письмо для подтверждения - нужно "нажать" кнопку подтверждения или "перейти" по ссылке в письме.</p>
                    <p>Если вы не увидите письмо, на всякий случай, проверьте папку "Спам".</p>
                    <p>Ссылка подтверждения адреса будет действительна в течение одного часа.</p>
                    <h2>Добро пожаловать!</h2>
                </div>
            </div>

            <form method="POST" action="/user/profile-information">
                @csrf
                @method('PUT')

                <p class="registration-form__input-item">
                    <label class="label" for="email">Логин / электронная почта: </label>
                    <input id="email" class="registration-form__input" type="email" name="email" required value="{{ old('email') }}">  
                    <span class="registration-error">*<br>@error('email') {{ $message }} @enderror</span>
                </p>

                <div class="d-flex flex-sa margin-top8px margin-bottom8px">
                <button type="submit" class="forgot-password__form--btn">
                    Оформить новый адрес электронной почты.
                </button>
                </div>
            </form>

            <div class="d-flex flex-sa">
                <a class="forgot-password__form--btn--link" href = "/profile">
                    {{-- __('Perfect!') --}} {{-- __('Close window.') --}}
                    Оставим прежний адрес.
                </a>
            </div>

        @endif
    </div>
    
</x-maket-guest> 

