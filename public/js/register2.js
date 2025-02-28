"use strict";
// проверяем поля имени и фамилии, и адреса в том числе:
checkInputedFormFields();
checkInputedAddressDiv('pers_addr');
// делаем проверку вводимого номера мобильного телефона для физического лица:
checkInputedTelNum('pers_tel', 'registrationerrortelnum');