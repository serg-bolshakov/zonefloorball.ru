"use strict";
console.log(Object.keys(globalDataOrders).length);
if(Object.keys(globalDataOrders).length > 0) {
    
    let checkOrdersInLocalStorageForm = document.querySelector('#checkordersinlocalstorageform');
    let inputFormOrders = document.querySelector('#inputForCheckingOrdersFromLacalStorage');
    inputFormOrders.setAttribute('value', ordersIdsJson);
    // console.log(ordersIdsJson);
    // выполняем однократное срабатывание формы для передачи post-запросом id-шников избранного для их выборки из БД.Для этого:
    let isCheckedOrdersInLocalStorage = sessionStorage.getItem('ischeckedorderslocalstorage');
    if (isCheckedOrdersInLocalStorage === null) {
        let timeSessionStart = Date.now();
        sessionStorage.setItem('ischeckedorderslocalstorage', timeSessionStart);
        checkOrdersInLocalStorageForm.submit();
    }
    // после перезагрузки страницы, хранилище сессии удаляется и снова генерируется нужный POST-запрос при заходе на страницу basket...
    window.onload = function(){sessionStorage.removeItem('ischeckedorderslocalstorage');} 
} else {
    // console.log('NO'); - сюда мы вообще никогда не попадём, потому что, если строка заказов равна нулю, из БД не идут id-заказов и html-странице orders.blade.php стоит else...
    let ordersPageTitle = document.querySelector('.basketTitle');
    ordersPageTitle.textContent = 'У вас пока нет покупок или заказов';
}