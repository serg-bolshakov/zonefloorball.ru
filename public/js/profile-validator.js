"use strict";
// проверяем поля имени и фамилии, и адреса в том числе:
checkInputedFormFields();
checkInputedAddressDiv('editdeliveryaddressfieldinprofileinput');
// делаем проверку вводимого номера мобильного телефона для физического лица:
checkInputedTelNum('inputprofilecahngingtelnum', 'profilechangingerrortelnum');

// ЧТОБЫ СДЕЛАТЬ ПРОВЕРКУ введённого адреса на корректность, - мы должны "выйти" из фокуса Дива, НО!!! ДО отправки данных на сервер - для этого реализуем чекбокс "я не робот" - это просто для того, чтобы проверить корректность введённого адреса
let editdeliveryaddressinprofilediv = document.querySelector('#editdeliveryaddressfieldinprofilediv');
let checkchangingaddringprofile = document.querySelector('#checkchangingaddringprofile');
editdeliveryaddressinprofilediv.addEventListener('click', () => {
    if(checkchangingaddringprofile.checked) {
        checkchangingaddringprofile.checked = false;
    } 
});

// если юзер удаляет данные адреса достаки заказов по умолчанию из системы (отмечеат чекбокс), - мы очищаем див с адресом:
let deletedeliveryaddressfromaccount = document.querySelector('#deletedeliveryaddressfromaccount');
// let editdeliveryaddressfieldinprofileinput = document.querySelector('#editdeliveryaddressfieldinprofileinput'); // переменная уже задекларирована в валидаторе!

deletedeliveryaddressfromaccount.addEventListener('click', () => {
    if(deletedeliveryaddressfromaccount.checked) {
        editdeliveryaddressinprofilediv.textContent = '';
        // перед отправкой запроса на сброс адреса из системы, очищаем значение скрытого инпута:
        editdeliveryaddressfieldinprofileinput.value = '';
    }     
});

