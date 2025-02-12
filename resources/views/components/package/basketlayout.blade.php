<x-maket-main>

    <x-slot:title> {{ $title }} </x-slot>
    <x-slot:robots> {{ $robots }} </x-slot>
    <x-slot:description> {{ $description }} </x-slot>
    <x-slot:keywords> {{ $keywords }} </x-slot>
	
	<x-nav-bar />

    <main>
        <x-package.basket />
        <x-recently-viewed-products />
    </main>	  

</x-maket-main>

<form id="checkbasketinlocalstorageform" action="" method="POST">
    @csrf
    <input id="inputForCheckingBasketFromLacalStorage" type="hidden" name="basketlistfromlocalstorage">
</form>
<script src="{{ asset('js/basketchecklocalstorage.js') }}"></script>

{{-- Здесь рисуем для <x-package.basket /> блоки расчёта итоговых сумм по количеству и цене корзины, блок выбора транспортной компании и блок активации кнопок оформления заказа

    При заходе на страницу basket, мы получаем информацию о наличии или отсутствии сохранённых в локальном хранилище браузера id товаров и их количестве на предмет формирования страницы:
        - в хедере "цепляется" файл scripts.js, в котором описаны классы корзины, избранного и недавно просмотренных товаров, который формирует либо пустой массив id и количества товара в корзины, либо не пустой...
        - получив этот массив в basketlayout.blade.php, через basketchecklocalstorage.js, где либо формируется заголовок: "Корзина пустая", либо выполняется однократное срабатывание формы, которая
            отправляет post-запрос к БД, содержащий json-строку массива товаров из докального хранилища БД... На стороне php мы получаем инфо о товарах и возвращаем данные в представление basket.blade.php
            выполняем проверку, если товар на момент входа на страницу корзины распродан (on_sale == 0), его нужно удалить из корзины и перенести в избранное...
    На странице basket.blade.php мы имеем скрытый инпут: <input id="hiddenInputWithDataFromPhpIdInBasket" type="hidden" data-transport="<?php // echo $data['delivery_way_view'] ?? '' ?>" > 
        в котором мы в data-атрибутах собираем необходимую информацию для оформления заказа <name="hiddenInputWithDataFromPhpNameInBasket"> (transport, стоимость доставки, данные о заказчике, способо оплаты заказа)
    В файле basket.js мы определяем  скрытый инпут из html-заметки представления: let hiddenInputWithDataFromPhp = document.getElementById('hiddenInputWithDataFromPhpIdInBasket');

        в дополнение к html-разметке (let basketParentDiv = document.querySelector('.basket-wrapper');), если корзина НЕ ПУСТАЯ, рисуем блоки: 
        - изменения количества товаров в корзине
        - подсчёта итогов по количеству товаров в корзине, стоимости корзины без учёта стоимости доставки   (basketParentDiv.appendChild(basketPriceNoDeliveryBlock);)
        - блок расчёта стоимости доставки / получения заказа                                                (basketParentDiv.appendChild(basketPriceYesDeliveryBlock);)
        - блок выбора способа доставки / получения заказа                                                   (basketParentDiv.appendChild(basketChoosingDeliveryBlock);)
            // заводим блок выбора способа доставки заказа (транспортной компании): 
            здесь реализуем выпадающее меню доступных способов доставки, стилизуем ФОРМУ под инпут:         (let basketChoosingDeliveryBlock = document.createElement('div');)
                let basketChoosingDeliveryForm = document.createElement('form');
                basketChoosingDeliveryForm.setAttribute('id', 'basketChooseTansportCompanyForOrderDeliveryForm');
                basketChoosingDeliveryForm.setAttribute('method', 'GET');

                    basketChoosingDeliveryForm.appendChild(basketChoosingDeliveryBlocFormkDiv);
                basketChoosingDeliveryBlock.appendChild(basketChoosingDeliveryForm);
            basketParentDiv.appendChild(basketChoosingDeliveryBlock);

            // заводим блок кнопок для оплаты заказа или получения счёта:
            let basketTotalBlockButtons = document.createElement('div');
            basketTotalBlockButtons.className = 'basket-res__total';
                let basketTotalBlockButtonsInputelem1 = document.createElement('button');
                basketTotalBlockButtonsInputelem1.className = 'basket-button';

                // делаем кнопку неактивной, т.е. полупрозрачной:
                basketTotalBlockButtonsInputelem1.classList.contains('basket-button_disabled') ? true : basketTotalBlockButtonsInputelem1.classList.add('basket-button_disabled');

                basketTotalBlockButtonsInputelem1.setAttribute('type', 'submit');
                basketTotalBlockButtonsInputelem1.setAttribute('name', 'basket-button__get-invoice');
                basketTotalBlockButtonsInputelem1.setAttribute('value', 'Забронировать');
                basketTotalBlockButtonsInputelem1.textContent = 'Забронировать';
                
                if (basketTotalBlockButtonsInputelem1.classList.contains('basket-button_disabled')) {
                    basketTotalBlockButtonsInputelem1.addEventListener('mouseover', () => {
                        let text = 'Авторизованные пользователи могут отложить покупку и зарезервировать товары на три дня.';
                        makeClearanceMessageText(text);
                    });
                }

                basketTotalBlockButtons.appendChild(basketTotalBlockButtonsInputelem1)
                let basketTotalBlockButtonsInputelem2 = document.createElement('button');
                basketTotalBlockButtonsInputelem2.className = 'basket-button';
                
                // если не выбран способ доставки "деактивируем" кнопки: делаем их полупрозрачными:
                if (!hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid || basketPriceYesDeliveryBlockH3elemDeliveryCost.textContent == '') {
                    //console.log(!hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid);
                    //console.log(basketPriceYesDeliveryBlockH3elemDeliveryCost.textContent == '');
                    basketTotalBlockButtonsInputelem2.classList.contains('basket-button_disabled') ? true : basketTotalBlockButtonsInputelem2.classList.add('basket-button_disabled');
                } else {
                    basketTotalBlockButtonsInputelem2.classList.contains('basket-button_disabled') ? true : basketTotalBlockButtonsInputelem2.classList.remove('basket-button_disabled');
                }

                basketTotalBlockButtonsInputelem2.setAttribute('type', 'submit');
                basketTotalBlockButtonsInputelem2.setAttribute('id', 'basketbuttonmakeanorder');
                basketTotalBlockButtonsInputelem2.setAttribute('name', 'basket-button__make-payment');
                basketTotalBlockButtonsInputelem2.setAttribute('value', 'Оформить заказ');
                basketTotalBlockButtonsInputelem2.textContent = 'Оформить заказ';

                // если выбран способ доставки заказа, активируется кнопка "Оформить заказ". При нажатии на неё - выводим форму добавления данных плательщика (Фамилию и Имя, телефон и адрес):
                basketTotalBlockButtonsInputelem2.addEventListener('click', () => {
                    if (hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid) {
                    ordermakingrecipientinfodiv.style.display = "";
                    }
                });

                if (basketTotalBlockButtonsInputelem2.classList.contains('basket-button_disabled')) {
                    basketTotalBlockButtonsInputelem2.addEventListener('mouseover', () => {
                        let text = 'Пожалуйста, выберите способ<br>доставки/получения заказа.';
                        makeClearanceMessageText(text);
                    });
                }

                basketTotalBlockButtons.appendChild(basketTotalBlockButtonsInputelem2);
            basketParentDiv.appendChild(basketTotalBlockButtons);

            // РЕАЛИЗУЕМ РАБОТУ ВЫПАДАЮЩЕГО МЕНЮ при выборе способа доставки заказа:
            let basketDeliveryWayOfTransportChoosingLinkVisibleTitle = document.querySelector('.basketSelectTransportVisibleBlock');
            let basketDeliveryWayOfTransportInvisibleList = document.querySelector('.basket-select__transport-drop');
            let basketDeliveryWayChoiseInputHidden = document.querySelector('#selectTransportCompanyBasketInputHidden');
            let formBasketChooseTansportCompanyForOrderDelivery = document.querySelector('#basketChooseTansportCompanyForOrderDeliveryForm');
            formBasketChooseTansportCompanyForOrderDelivery.setAttribute('type', 'submit');
            formBasketChooseTansportCompanyForOrderDelivery.setAttribute('method', 'POST');

            let tokenHiddenInput = document.createElement('input');
            tokenHiddenInput.setAttribute('type', 'hidden');
            tokenHiddenInput.setAttribute('name', '_token');
            tokenHiddenInput.setAttribute('value', token);
            formBasketChooseTansportCompanyForOrderDelivery.appendChild(tokenHiddenInput);
                
            let selectedResult = 0;

            ...

            basketDeliveryWayChoiseInputHidden.setAttribute('name', 'transport');
                    // basketDeliveryWayChoiseInputHidden.setAttribute('value', queryStringGetForTransport); пока переделываем под ларавел, комментируем строку запроса, для формы просто оставляем id выбранного способа доставки 
                    basketDeliveryWayChoiseInputHidden.setAttribute('value', selectedResult);

                    let targetTextContent = event.target.firstElementChild ? event.target.firstElementChild.textContent : event.target.textContent;
                    basketDeliveryWayOfTransportChoosingLinkVisibleTitle.textContent = targetTextContent; // копируем в видимую часть блока выбора способа доставки товара, выбранный способ доставки
                    
                    basketDeliveryWayOfTransportInvisibleList.style.display = "none";

                    formBasketChooseTansportCompanyForOrderDelivery.submit();

        - если в корзине что-то есть и выбран способ доставки заказа (в скрытом инпуте появляются данные из БД о выбранном способе и стоимости услуг (если они определены в БД)), активируется кнопка оформить заказ (без регистрации и авторизации)
    
--}}


