<x-maket-guest>
    <x-slot:title>Добро пожаловать. Регистрация</x-slot>
    <x-slot:robots>NOFOLLOW, NOINDEX</x-slot>
    <x-slot:description></x-slot>
    <x-slot:keywords></x-slot> 

<div>
    <!-- Very little is needed to make a happy life. - Marcus Aurelius -->
</div>

<div class="registration registration-addition">
    <input id="inphiddenwitherrorinfo" type="hidden" data-nameoforgerr="@error('name_of_org') {{ $message }} @enderror" 
    data-innoforgerr="@error('org_inn') {{ $message }} @enderror" data-kppoforgerr="@error('org_kpp') {{ $message }} @enderror" data-addroforgerr="@error('org_addr') {{ $message }} @enderror" 
    data-telnumoforgerr="@error('regorgtel') {{ $message }} @enderror" data-emailoforgerr="@error('regorgemail') {{ $message }} @enderror" 
    data-contractsurnameoforgerr="" data-persaddrposted=""
    data-contractnameoforgerr="" data-contractpatronoforgerr="" 
    data-contractposoforgerr="" data-contractjustoforgerr="" 
    data-bankaccoforgerr="" data-bicbankoforgerr="" 
    data-contractaddoforgerr="">

    <form action="/register" method="POST">
        @csrf
        <p class="registration-form__input-item"><span class="registration-form__star">*</span> - поля, обязательные для заполнения </p>
        <p class="cursive color-green text-align-center">Для просмотра формы используйте прокрутку!</p>
        <p class="registration-form__input-item"><span class="registration-form__title">Добро пожаловать!<br>Регистрационная форма</span></p>
        
        <p class="registration-form__input-item">
            <label class="label" for="name">Имя: </label>
            <input id="name" class="registration-form__input" type="text" required  data-rule="namefieldtext" data-maxlength="30" name="name" value="{{ old('name') }}" autofocus autocomplete="name">
            <span class="registration-error">*<br>@error('name') {{ $message }} @enderror</span>
            <span class="productAddition-form__clearance">Имя пишется буквами русского алфавита, должно быть длиной от 1 до 30 символов, может содержать пробел и дефис.</span><br>
            <span id="registrationerrorname" class="registration-error"></span>
        </p>

        <p class="registration-form__input-item">
            <label class="label" for="surname">Фамилия: </label>
            <input id="surname" class="registration-form__input" type="text" required data-rule="namefieldtext" data-maxlength="30" name="surname" value = "{{ old('surname') }}" autofocus autocomplete="surname">
            <span class="registration-error">*<br>@error('surname') {{ $message }} @enderror</span>
            <span class="productAddition-form__clearance">Правила написания фамилии такие же, как и для имени (см.выше).</span><br>
            <span id="registrationerrorsurname" class="registration-error"></span>
        </p>

        <p class="registration-form__input-item">
            <label class="label" for="registrationtelnum">Укажите номер мобильного телефона: </label>
            <input id="pers_tel" class = "registration-form__input" type="tel" required placeholder="+7 (999) 123-45-67" name="pers_tel" pattern="(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}" value = "{{ old('pers_tel') }}">
            <span class="registration-error">*<br>@error('pers_tel') {{ $message }} @enderror</span>
            <span class="productAddition-form__clearance">Номер телефона вводится в формате: +7 (999) 123-45-67</span><br>
            <span id="registrationerrortelnum" class="registration-error"></span>
        </p>

        <p class="registration-form__input-item">
            <label class="label" for="email">Email (личный адрес электронной почты): </label>
            <input class = "registration-form__input" type="email" required placeholder="user@gmail.com" id="email" name="email" autofocus autocomplete="username" value="{{ old('email') }}">
            <span class="registration-error">*<br>@error('email') {{ $message }} @enderror</span>
            <span class="productAddition-form__clearance">Будет использоваться в качестве логина при авторизации, для отправки электронных кассовых чеков,  информации о  заказах...</span><br>
            <span id="registrationerrortelnum" class="registration-error"></span>
        </p>
        
{{--    Пока комментируем - подразумеваем, зачем место на сайте занимать, если поле не обязательно для заполнения - его мржно заполнить при оформлении нового заказа или в личном кабинете
        <div id="regUserdeliveryaddressfield" class="registration-form__input-item">
            <label class="label" for="registerAddr">Адрес доставки/получения заказов <br>(по умолчанию): </label>
            <div contenteditable="true" id="registerAddr" class ="registration-form__input-address" data-rules="addressfieldtext">{{ old('pers_addr') }}</div>
            <span class="registration-error">@error('pers_addr') {{ $message }} @enderror</span>
            <span class="productAddition-form__clearance">В этот адрес (если он будет здесь указан) будут отправляться заказы. Адрес можно указать при выборе транспортной компании.</span><br>
            <span id="registrationerroraddr" class="registration-error"></span>
        </div>

        <input id="pers_addr" type="hidden" name="pers_addr" value="{{ old('pers_addr') }}">
--}}

{{--    Пока комментируем - подразумеваем, зачем место на сайте занимать, если поле не обязательно для заполнения - его мржно заполнить при оформлении нового заказа или в личном кабинете
        <p class="registration-form__input-item">
            <label class="label" for="date_of_birth">Дата рождения: </label>
            <input class="registration-form__input" type="date" id="date_of_birth" name="date_of_birth" value="{{ old('date_of_birth') }}">
            <span class="registration-error">&nbsp;<br>@error('date_of_birth') {{ $message }} @enderror</span>
            <span class="productAddition-form__clearance">Если будет указана - мы будем поздравлять Вас с этим событием.</span><br>
        </p>
--}}        
        <div id="registration_org_checkbox" class="registration-form__input-item">
            <input type="checkbox" hidden id="registration_org" @checked(old('org')) name="org" value="yes">
            <label for="registration_org" class="">Я действую от имени организации</label>
        </div>

        <!-- Точка входа блока регистрации организации -->
        <div id="registration_org_block" class="registration-form__input-item d-none"></div>

        <!-- Точка входа блока ввода данных для договора -->
        <div id="registration_org_block_contract" class="registration-form__input-item registration_org_block_contract"></div>

        <div class="registration-form__input-item">
            <div class="margin-tb8px text-align-center color-red">Пожалуйста, сначала ознакомьтесь с <a href="/legal/offer" target="_blank" rel="noopener noreferrer">офертой</a></div>
            <div class="fs12px margin-bottom8px text-align-center color-red"> и <a href="/legal/privacy-policy" target="_blank" rel="noopener noreferrer">политикой конфиденциальности</a></div>
            <input type="checkbox" hidden id="registration_legal" @checked(old('legal_agreement')) name="legal_agreement" value="yes">
            <label for="registration_legal" class="">Понятно. Подтверждаю согласие</label>
            <div class="registration-error margin-tb8px margin-tb8px text-align-center">@error('legal_agreement') {{ $message }} @enderror</div>
        </div>
        
        <p class="registration-form__input-item password">
            <label class="label" for="password">Придумайте пароль: </label>
            <input id="password" class="registration-form__input" name="password" type="password" required value="{{ old('password') }}" autocomplete="new-password">
            <a href="#" class="password-control" onclick="return show_hide_password(this);"></a>
            <span class="registration-error">*<br>@error('password') {{ $message }} @enderror</span>
            <!-- <span class="productAddition-form__clearance">Пароль должен состоять как минимум из 8 символов, содержать в себе, как минимум, одну строчную и одну прописную (заглавную) буквы, иметь в своём составе, как минимум, одну цифру и один символ (косая черта/вопросительны знак...).</span><br> -->
             <span class="productAddition-form__clearance">Пароль должен состоять как минимум из 8 символов, содержать в себе, как минимум, одну строчную и одну прописную (заглавную) буквы, одну цифру...</span><br>
        </p>
        
        <p class="registration-form__input-item password">
            <label class="label" for="password_confirmation">Повторите пароль: </label>
            <input id="password_confirmation" class="registration-form__input" name="password_confirmation" type="password" required autocomplete="new-password">
            <a href="#" class="password-control" onclick="return show_hide_password_confirmation(this);"></a>
            <span class="registration-error">*<br>@error('password_confirmation') {{ $message }} @enderror</span>
        </p>
        
        <div class="d-flex flex-sa">
            <a href = "/" class = "registration-form__submit-btn" >Отмена</a>    
            <button type="submit" class="registration-form__submit-btn" name="regsubbtn" value="regsubmit">Вперёд</button>
        </div>
    </form>
</div>

<script src="{{ asset('js/register2.js') }}"></script>
<script src="{{ asset('js/show-hide-password.js') }}"></script> 
<script src="{{ asset('js/orgregister.js') }}"></script> 

</x-maket-guest>