"use strict";

if(Object.keys(globalDataBasket).length > 0) {
    let checkBasketInLocalStorageForm = document.querySelector('#checkbasketinlocalstorageform');
    let inputFormBasket = document.querySelector('#inputForCheckingBasketFromLacalStorage');
    inputFormBasket.setAttribute('value', basketJson);


    // выполняем однократное срабатывание формы для передачи post-запросом id-шников избранного для их выборки из БД.Для этого:
    let isCheckedBasketInLocalStorage = sessionStorage.getItem('ischeckedbasketlocalstorage');

    if (isCheckedBasketInLocalStorage === null) {
        let timeSessionStart = Date.now();
        sessionStorage.setItem('ischeckedbasketlocalstorage', timeSessionStart);
        checkBasketInLocalStorageForm.submit();
    }
    // после перезагрузки страницы, хранилище сессии удаляется и снова генерируется нужный POST-запрос при заходе на страницу basket...
    window.onload = function(){sessionStorage.removeItem('ischeckedbasketlocalstorage');} 
} else {
    let basketPageTitle = document.querySelector('.basketTitle');
    basketPageTitle.textContent = 'Корзина пока пустая';
}