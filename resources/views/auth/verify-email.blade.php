<x-maket-guest>
    <x-slot:title>Подтверждение адреса электронной почты</x-slot>
    <x-slot:robots>NOFOLLOW, NOINDEX</x-slot>
    <x-slot:description></x-slot>
    <x-slot:keywords></x-slot> 

    <div class="registration">

        @if (session('status') == 'verification-link-sent')
            <div class="forgot-password__title">
                {{-- __('A new link has been sent to you to confirm your email address.') --}} {{-- __('Welcome!') --}}
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
                    <h2>Спасибо, что присоединились к нам!</h2>
                    <p>Чтобы пользоваться всеми преимуществами, предоставляемыми зарегистрированным и авторизованным пользователям, просим вас подтвердить электроннную почту.</p>
                    <p>По указанному в процессе регистрации электронному адресу было отправлено письмо для подтверждения - нужно "нажать" кнопку подтверждения или "перейти" по ссылке в письме.</p>
                    <p>Если вы не видите письмо, на всякий случай, проверьте папку "Спам".</p>
                    <p>Ссылка подтверждения адреса действительна в течение одного часа.</p>
                    <h2>Добро пожаловать!</h2>
                    <p>Не получили письмо?</p>
                </div>
            </div>

            <form method="POST" action="/email/verification-notification">
                @csrf
                <div class="d-flex flex-sa margin-top8px margin-bottom8px">
                <button type="submit" class="forgot-password__form--btn">
                    {{-- __('Send a new link to confirm your email address.') --}}
                    Выслать новую ссылку для подтверждение адреса электронной почты.
                </button>
                </div>
            </form>

            <div class="d-flex flex-sa">
                <a class="forgot-password__form--btn--link" href = "/">
                    {{-- __('Perfect!') --}} {{-- __('Close window.') --}}
                    Да, сейчас посмотрю.
                </a>
            </div>
        @endif
    </div>
</x-maket-guest>