"use strict";
console.log(Object.keys(globalDataOrders).length);
if(Object.keys(globalDataOrders).length > 0) {
    
    let checkOrdersInLocalStorageForm = document.querySelector('#checkordersinlocalstorageforminheader');
    let inputFormOrders = document.querySelector('#inputForCheckingOrdersFromLacalStorageinheader');
    inputFormOrders.setAttribute('value', ordersIdsJson);

    // выполняем однократное срабатывание формы для передачи post-запросом id-шников избранного для их выборки из БД.Для этого:
    let isCheckedOrdersInLocalStorage = sessionStorage.getItem('ischeckedorderslocalstorage');
    // console.log('YES'); - при ручном (пока ручном) удалении из базы данных "неопознанных" (неавторизованных) заказов. 
    // У пользователя в браузере-счётчике заказов (из локального хранилища) всё равно остаётся какая-то цифра... 
    // Проверку счётчика заказов и корректировку id-строки нужно делать в индексном файле!? 26.12.2024
    if (isCheckedOrdersInLocalStorage === null) {
        let timeSessionStart = Date.now();
        sessionStorage.setItem('ischeckedorderslocalstorage', timeSessionStart);
        checkOrdersInLocalStorageForm.submit();
    }
    // после перезагрузки страницы, хранилище сессии удаляется и снова генерируется нужный POST-запрос при заходе на страницу basket...
    window.onload = function(){sessionStorage.removeItem('ischeckedorderslocalstorage');} 
}