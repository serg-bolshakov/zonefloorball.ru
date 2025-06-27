<div>
    <!-- Very little is needed to make a happy life. - Marcus Aurelius -->
     Файл нужно удалить! Он не используется
</div>

<div class="registration registration-addition">
    <input id="inphiddenwitherrorinfo" type="hidden" data-nameoforgerr="{{ $nameOrgErr }}" data-innoforgerr="{{ $innOrgErr }}" data-addroforgerr="{{ $addrOrgErr }}" 
    data-telnumoforgerr="{{ $telNumOrgErr }}" data-emailoforgerr="{{ $emailOrgErr }}" data-contractsurnameoforgerr="{{ $contrSurNameOrgErr }}" data-persaddrposted=""
    data-contractnameoforgerr="{{ $contrNameOrgErr }}" data-contractpatronoforgerr="{{ $contrPatronNameOrgErr }}" data-contractposoforgerr="{{ $contrPosOrgErr }}" 
    data-contractjustoforgerr="{{ $contrJustOrgErr }}" data-bankaccoforgerr="{{ $bankaccOrgErr }}" data-bicbankoforgerr="{{ $bicBankOrgErr }}" data-contractaddoforgerr="{{ $contrAddInfoOrgErr }}">
    <form action="" method="POST">
        @csrf
        <p class="registration-form__input-item"><span class="registration-form__title">Регистрационная форма</span></p>
        <p class="registration-form__input-item"><span class="registration-form__star">*</span> - поля, обязательные для заполнения </p>
        
        <p class="registration-form__input-item">
            <label class="label" for="name">Имя: </label>
            <input id="registration-name" class="registration-form__input" type="text" required  data-rule="namefieldtext" data-maxlength="30" name="name" value="<?php if (isset ($_POST['name'])) echo $_POST['name'] ?>">
            <span class="registration-error">*<br><?= ($nameErr != '') ? $nameErr . '<br>' : ''  ?></span>
            <span class="productAddition-form__clearance">Имя пишется буквами русского алфавита, должно быть длиной от 1 до 30 символов, может содержать пробел и дефис.</span><br>
            <span id="registrationerrorname" class="registration-error"></span>
        </p>

        <p class="registration-form__input-item">
            <label class="label" for="surname">Фамилия: </label>
            <input id="registration-surname" class="registration-form__input" type="text" required data-rule="namefieldtext" data-maxlength="30" name="surname" value="<?php if (isset ($_POST['surname'])) echo $_POST['surname'] ?>">
            <span class="registration-error">*<br><?= ($surNameErr != '') ? $surNameErr . '<br>' : ''  ?></span>
            <span class="productAddition-form__clearance">Правила написания фамилии такие же, как и для имени (см.выше).</span><br>
            <span id="registrationerrorsurname" class="registration-error"></span>
        </p>

        <p class="registration-form__input-item">
            <label class="label" for="registrationtelnum">Укажите номер мобильного телефона: </label>
            <input id="registrationtelnum" class="registration-form__input" type="tel" required placeholder="+7 (999) 123-45-67" name="perstelnum" pattern="(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}" value="<?php if (isset ($_POST['perstelnum'])) echo $_POST['perstelnum'] ?>">
            <span class="registration-error">*<br><?= ($persTelNumErr != '') ? $persTelNumErr . '<br>' : ''  ?></span>
            <span class="productAddition-form__clearance">Номер телефона вводится в формате: +7 (999) 123-45-67</span><br>
            <span id="registrationerrortelnum" class="registration-error"></span>
        </p>

        <p class="registration-form__input-item">
            <label class="label" for="persemail">Email (личный адрес электронной почты): </label>
            <input class="registration-form__input" type="email" required placeholder="user@gmail.com" id="persemail" name="persemail" value = "<?php if (isset ($_POST['persemail'])) echo $_POST['persemail'] ?>">
            <span class="registration-error">*<br><?= ($persEmailErr != '') ? $persEmailErr . '<br>' : '' ?></span>
            <span class="productAddition-form__clearance">Будет использоваться в качестве логина при авторизации, для отправки электронных кассовых чеков,  информации о  заказах... Если нет почты - можно оформить покупку без регистрации.</span><br>
            <span id="registrationerrortelnum" class="registration-error"></span>
        </p>

        <div id="regUserdeliveryaddressfield" class="registration-form__input-item">
            <label class="label" for="registerAddr">Адрес доставки/получения заказов <br>(по умолчанию): </label>
            <div contenteditable="true" id="registerAddr" class="registration-form__input-address" data-rules="addressfieldtext"> <?= $_POST['persaddress'] ?? '' ?> </div>
            <span class="registration-error"><?= ($persAddrErr != '') ? $persAddrErr . '<br>' : '' ?></span>
            <span class="productAddition-form__clearance">В этот адрес (если он будет здесь указан) будут отправляться заказы. Адрес можно указать при выборе транспортной компании.</span><br>
            <span id="registrationerroraddr" class="registration-error"></span>
        </div>

        <input id="hiddenInputRegistrationPersAddress" type="hidden" name="persaddress" value="<?= $_POST['persaddress'] ?? '' ?>">

        <p class="registration-form__input-item">
            <label class="label" for="dateOfBirth">Дата рождения: </label>
            <input class="registration-form__input" type="date" id="dateOfBirth" name="dateOfBirth" valu ="<?php if (isset ($_POST['dateOfBirth'])) echo $_POST['dateOfBirth'] ?>">
            <span class="registration-error">&nbsp;<br><?= ($dateOfBirthErr != '') ? $dateOfBirthErr . '<br>' : '' ?></span>
            <span class="productAddition-form__clearance">Если будет указана - мы будем поздравлять Вас с этим событием.</span><br>
        </p>
        
        
        <!-- <div id="registration_org_checkbox" class="registration-form__input-item"> -->
            <input type="checkbox" hidden id="registration_org" <?= isset($_POST['org']) ? 'checked' : '' ?> name="org" value="yes">
            <label for="registration_org" class="">Я действую от имени организации</label>
        <!-- </div> -->

        <div id="registration_org_block" class="registration-form__input-item d-none"><!-- Точка входа блока регистрации организации --></div>
        <div id="registration_org_block_contract" class="registration-form__input-item registration_org_block_contract"><!-- Точка входа блока ввода данных для договора --></div>
        

        <p class="registration-form__input-item">
            <label class="label" for="password">Придумайте пароль: </label>
            <input class="registration-form__input" name="password" type="password" value="<?php if (isset ($_POST['password'])) echo $_POST['password'] ?>">
            <span class="registration-error">*<br>{{ $passwordErr }}</span>
        </p>
        
        
        <p class="registration-form__input-item">
            <label class="label" for="confirm">Повторите пароль: </label>
            <input class="registration-form__input" name="confirm" type="password">
            <span class="registration-error">*<br>{{ $confirmErr }}</span>
        </p>
        
        <div class="d-flex flex-sb">
            <button type="submit" class="registration-form__submit-btn" name="regsubbtn" value="regsubmit">Вперёд!</button>
            <a href = "{{ $locationString }}" class="registration-form__submit-btn" >Отменить</a>
        </div>
    </form>
</div>

<script src="{{ asset('js/register.js') }}"></script>
<!-- <script src="/project/webroot/scripts/orgregister.js"></script> -->

<script>
    "use strict"; 
    /* Алгоритм создания подтверждения адреса электронной почты:
        1. При регистрации создаём в mysql поле, в котором будем хранить уникальный ключ подтверждения e-mail адреса, - можно попробовать "соль"...
        2. отправляем на почту ссылку (или просто этот ключ) и перенаправляем пользователя на страницу, где нужно его ввести. 
        3. При вводе верного ключа (или при переходе по ссылке из письма, проверяем GET параметр и сравниваем с записью в mysql)...
        4. Обновляем запись в БД, о том что юзер успешно подтвердил регистрацию адреса электронной почты..    
    */ 
</script>
