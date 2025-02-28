"use strict";

// проверяем поля имени и фамилии, и адреса в том числе:
checkInputedFormFields();
checkInputedAddressDiv('hiddenInputRegistrationPersAddress');
// делаем проверку вводимого номера мобильного телефона для физического лица:
checkInputedTelNum('registrationtelnum', 'registrationerrortelnum');