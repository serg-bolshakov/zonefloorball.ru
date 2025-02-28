"use strict";
// смотрим на входе было запрошено какое-либо действие после просмотра вариантов в заказе
let hiddenInputWithDataFromPhpOrders = document.querySelector('#hiddenInputWithDataFromPhpOrders');

// если есть обновленная строка id-шников заказов, - нужно удалить из локального хранилища старую и записать актуальные значения... или просто обновить...
// пока не реализовано... была какая-то мысль... но улетела... 26.12.2024
let updatedOrdersList = hiddenInputWithDataFromPhpOrders.dataset.updatedorderslist;
if(updatedOrdersList) {
    // console.log(updatedOrdersList);
    // console.log(typeof updatedOrdersList);
    // console.log(typeof (localStorage.getItem('orders')));
    // localStorage.removeItem('orders');
    // localStorage.setItem('orders', updatedOrdersList);
}

// инициализируем блок просмотра контента заказа и изначально убираем его из видимой части
let hiddenOrderContentDiv = document.querySelector('#orderCheckContentDiv');

let orderSelectedAction = hiddenInputWithDataFromPhpOrders.dataset.getorderactionselected;
if(orderSelectedAction && orderSelectedAction == 'order-check-content') {
    // если есть запрос на просмотр контента заказа - делаем блок видимым:
    hiddenOrderContentDiv.style.display = "block";
    let closeImgOrderConfirmation = document.querySelector('.close-img__order-confirmation');
    closeImgOrderConfirmation.addEventListener('click', () => {
        hiddenOrderContentDiv.style.display = "none";
        // console.log(url); перезагружаем страницу, чтобы убрать гет-запрос из адресной строки:
        // location.replace(document.URL);  // что location.replace() удаляет текущую страницу из истории сеанса, что означает, что пользователи не смогут вернуться к ней, нажав кнопку «Назад» в браузере. В то время как location.assign() оставляет запись в истории сеанса.
        // Проверяем, есть ли параметры в URL
        // JavaScript позволяет динамически изменять URL страницы. В нашем случае мы проверяем, есть ли параметры в URL, и если они есть, удаляем их, заменяя текущий URL на новый без параметров.
        if (window.location.search) {
            // Удаляем параметры из URL
            let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({path: newUrl}, '', newUrl);
        }
    });
};

// получаем таблицу в переменную
let ordersTable = document.querySelector('#ordersTable');
if(ordersTable) {
    ordersTable.addEventListener('click', event => {
        event.preventDefault();
        let clickedElem = event.target; 

        // проверяем, что кликнули именно в этом столбце (Действия):
        let clickedTargetCol = clickedElem.closest('.select');
        if(clickedTargetCol) {
            /* выпадающий блок скрыт - делаем его видимым*/
            let selectedListResult = clickedElem.nextElementSibling;
            if (selectedListResult.style.display == "block") {
                selectedListResult.style.display = "none";
                clickedElem.textContent = 'Посмотреть варианты';
            } else {
                selectedListResult.style.display = "block";
                clickedElem.textContent = 'Закрыть просмотр';
            }

            console.log(selectedListResult);
            /* Выделяем ссылку открывающую ordersselect */
            selectedListResult.addEventListener('click', event => {
                event.stopImmediatePropagation();       // остановим всплытие
                event.preventDefault();                 /* Предотвращаем обычное поведение ссылки при клике */

                /* Работаем с событием клика по элементам выпадающего списка ... выбираем код элемента списка по которому кликнули */ 
                let selectResult = event.target.firstElementChild;
                let selectedAction = '';
                if(selectResult) {
                    selectedAction = selectResult.getAttribute('data-action');
                } else {
                    selectResult = event.target;
                    selectedAction = selectResult.getAttribute('data-action');
                }

                // последний тег в диве select - это инпут, который формирует строку запроса после submit - его значением value должно стать - выбор пользователем конкретного действия (просмотр заказа / отмена / ...) 
                let ordersParentDivSelectedAction = selectResult.closest('.select');
                let ordersLastInputSelectedAction = ordersParentDivSelectedAction.lastElementChild;
                ordersLastInputSelectedAction.value = selectedAction;

                let formOrdersSelectAction = selectResult.closest('.form'); // Метод closest ищет ближайший родительский элемент, подходящий под указанный CSS селектор, при этом сам элемент тоже включается в поиск.

                formOrdersSelectAction.submit();
                
                // /* Предотвращаем обычное поведение ссылки при клике */
                event.preventDefault();        
            });
        }
    });
}