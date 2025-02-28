"use strict";

let basketPageTitle = document.querySelector('.basketTitle');
basketPageTitle.textContent = 'Корзина покупок';

// при клике на кнопки улеличения количества товаров ... или уменьшения... не будем перезагружать страницу, а просто будем песчитывать корзину...
function recalculateTheContentsOfTheBasket() {

    let headCounterInFuction = document.querySelector('.header-basket__counter');
       
    // при переборе товаров из корзины, сразу будем суммировать количество товара и общую стоимость
    let basketProductQuantityTotalInFunction = 0;
    let basketProductPriceAmountTotalInFunction = 0;
    
    // общую скидку на товары считать:
    let basketProductDiscountTotalInFunction = 0;

    // и общую стоимость корзины по регулярным ценам:
    let basketProductPriceAmountTotalInRegularPriceInFunction = 0;
    
    
    let prodQuantityInBasketInputsInFunction = document.querySelectorAll('.basket-row__quantity-number');
    for(let prodQuantityInput of prodQuantityInBasketInputsInFunction) {

        let prodId = prodQuantityInput.dataset.productid;
        basketProductQuantityTotalInFunction += +prodQuantityInput.value;
        
        let productAmount = document.getElementById(`basketProductRowTotalAmount_${prodId}`);
        productAmount = 0;
        
        if(!prodQuantityInput.dataset.productpricewithrankdiscount && !prodQuantityInput.dataset.productdiscountperunit) {   
            // сюда попадают все товары, нет скидок по рангу... но могут быть и другие типы скидок - подумать надо
            basketProductPriceAmountTotalInFunction += (prodQuantityInput.value * prodQuantityInput.dataset.productpriceactual);
            basketProductPriceAmountTotalInRegularPriceInFunction += (prodQuantityInput.value * prodQuantityInput.dataset.productpriceregular);
            if(productAmount) { console.log('1'); productAmount += (prodQuantityInput.value * prodQuantityInput.dataset.productpriceactual); }
        } else {
            basketProductPriceAmountTotalInFunction += (prodQuantityInput.value * prodQuantityInput.dataset.productpriceforordercontent);
            basketProductPriceAmountTotalInRegularPriceInFunction += (prodQuantityInput.value * prodQuantityInput.dataset.productpriceregular);
            if(productAmount) { console.log('2'); productAmount += (prodQuantityInput.value * prodQuantityInput.dataset.productpricewithrankdiscount); }
            
            // добавляем скидку на количество товара:
            if(prodQuantityInput.dataset.productdiscountperunit) {
                basketProductDiscountTotalInFunction += prodQuantityInput.dataset.productdiscountperunit * prodQuantityInput.value;
            }
        }
        // корректируем стоимость товарной позиции в корзине:
        if(productAmount > 0) {
            productAmount.innerHTML = new Intl.NumberFormat('ru-RU').format(productAmount) + '&nbsp;&#8381;';
        }
    }

    let basketPriceNoDeliveryBlockInFunction = document.querySelector('.basket-res__no-delivery');
    let totalQuantityAndAmountBasketCostBlock = basketPriceNoDeliveryBlockInFunction.firstChild;
    // здесь оформляем итоговую стоимость товаров всего заказа:
    if((basketProductQuantityTotalInFunction == 1 || basketProductQuantityTotalInFunction % 10 == 1) && basketProductQuantityTotalInFunction != 11) {
        totalQuantityAndAmountBasketCostBlock.innerHTML = 'Всего в корзине:  ' + '<b>' + new Intl.NumberFormat('ru-RU').format(basketProductQuantityTotalInFunction) + '</b>' +' товар, ' ;
    } else if((basketProductQuantityTotalInFunction == 2 || basketProductQuantityTotalInFunction % 10 == 2 || basketProductQuantityTotalInFunction == 3 || basketProductQuantityTotalInFunction % 10 == 3 || basketProductQuantityTotalInFunction == 4 || basketProductQuantityTotalInFunction % 10 == 4) && basketProductQuantityTotalInFunction != 12 && basketProductQuantityTotalInFunction != 13  && basketProductQuantityTotalInFunction != 14) {
        totalQuantityAndAmountBasketCostBlock.innerHTML = 'Всего в корзине:  ' + '<b>' + new Intl.NumberFormat('ru-RU').format(basketProductQuantityTotalInFunction) + '</b>' +' товара, ' ;
    } else {
        totalQuantityAndAmountBasketCostBlock.innerHTML = 'Всего в корзине:  ' + '<b>' + new Intl.NumberFormat('ru-RU').format(basketProductQuantityTotalInFunction) + '</b>' +' товаров, ' ;
    }

    let basketPriceNoDeliveryBlockH3elemTotalAmountInFunction = document.querySelector('.basketPriceNoDeliveryBlockH3elemTotalAmount');
    basketPriceNoDeliveryBlockH3elemTotalAmountInFunction.innerHTML = 'на сумму: ' + new Intl.NumberFormat('ru-RU').format(basketProductPriceAmountTotalInFunction) + '&nbsp;&#8381;';

    headCounterInFuction.textContent = basketProductQuantityTotalInFunction;
    
    let finalBasketCostNoDelivery = document.querySelector('.basketTotalAmountBlockH3elem2');
    finalBasketCostNoDelivery.innerHTML = new Intl.NumberFormat('ru-RU').format(basketProductPriceAmountTotalInRegularPriceInFunction) + '&nbsp;&#8381;';

    // выводим скидку на товары:
    let productsTotalAmountDiscountPelem2 = document.querySelector('#productsTotalAmountDiscountPelem2');
    productsTotalAmountDiscountPelem2.innerHTML = new Intl.NumberFormat('ru-RU').format(basketProductDiscountTotalInFunction) + '&nbsp;&#8381;'; 

    // записываем итоговую стоимость Заказа:
    let orderTotalAmount = document.querySelector('.basketTotalAmountBlockH3elem4');
    console.log(orderTotalAmount);
    orderTotalAmount.innerHTML = new Intl.NumberFormat('ru-RU').format(basketProductPriceAmountTotalInFunction) + '&nbsp;&#8381;';
}


// выполнить проверку, если товар распродан (on_sale == 0), его нужно удалить из корзины и перенести в избранное:
let prodSoldIds = document.querySelectorAll('.basket-quantity__span-tag');

for(let prodSoldId of prodSoldIds) {
    if(prodSoldId.textContent == 0) {
        let text = 'Товар, который распродан, удалён из корзины и перенесён в Избранное!';
        makeActionConfirmation(text);
        // получаем id удаляемого из корзины товара:
        let prodIdForRemovingFromBasket = prodSoldId.dataset.soldprodid;
        // если товар распродан (в остатках 0) - удаляем товар из корзины:
        stockBasket.removeById(prodIdForRemovingFromBasket);
         // ... и переносим его в избранное:
        let product = new ProdInLocalStorage(keyFavorites, prodIdForRemovingFromBasket);
    }     
}

// активируем кнопки на удаление товара из корзины покупок:
let basketRemoveImgs = document.querySelectorAll('.basket-img__remove');
for(let basketRemoveImg of basketRemoveImgs) {
    basketRemoveImg.addEventListener('click', event => {
        let targetProductForRemovingFromBasketId = event.target.dataset.removefrombasket;
        let text = 'Товар удаляется из корзины!';
        makeActionConfirmation(text);
        stockBasket.removeById(targetProductForRemovingFromBasketId);
    });
}

// активируем кнопки на добавление товара из корзины покупок в изранное:
let basketAddToFavoritesImgs = document.querySelectorAll('.basket-img__addtofavorites');
for(let basketAddToFavoritesImg of basketAddToFavoritesImgs) {
    basketAddToFavoritesImg.addEventListener('click', event => {
        let targetProductForAddingToFavoritesFromBasketId = event.target.dataset.addtofavoritesfrombasketid;
        let text = 'Товар добавляется в раздел "Избранное!';
        makeActionConfirmation(text);
        let product = new ProdInLocalStorage(keyFavorites, targetProductForAddingToFavoritesFromBasketId);
    });
}

// при переборе товаров из корзины, сразу будем суммировать количество товара и общую стоимость
let basketProductQuantityTotal = 0;
let basketProductPriceAmountTotal = 0;
let basketProductDiscountAmountTotal = 0;
let basketProductRegularAmountTotal= 0;
let queryStringGetForTransport = '';
let choosedTransportWayId = 0;

let prodQuantityInBasketInputs = document.querySelectorAll('.basket-row__quantity-number');
for(let prodQuantityInput of prodQuantityInBasketInputs) {
    basketProductQuantityTotal += +prodQuantityInput.value;
    basketProductRegularAmountTotal += prodQuantityInput.value * prodQuantityInput.dataset.productpriceregular;
}

let basketPriceValueRowSpans = document.querySelectorAll('.basket-row__priceValue');
for(let basketPriceValueRowSpan of basketPriceValueRowSpans) {
    if(basketPriceValueRowSpan.dataset.amount){
        basketProductPriceAmountTotal += +basketPriceValueRowSpan.dataset.amount;
    }
    if(basketPriceValueRowSpan.dataset.discount){
        basketProductDiscountAmountTotal += +basketPriceValueRowSpan.dataset.discount;
    }
}

// оживляем корзину покупок в смысле изменения количества товара в корзине по клику на стрелочки (плюс/минус) или ввода конкретного значения количества товара:
let basketProductQuantityChangingAndTotalAmountDivs = document.querySelectorAll('.basket-row__quantity');
let step = 1;

for(let basketProductQuantityChangingAndTotalAmountDiv of basketProductQuantityChangingAndTotalAmountDivs) {

    basketProductQuantityChangingAndTotalAmountDiv.addEventListener('click', event => {
               
        let basketProductQuantityChangingInput = basketProductQuantityChangingAndTotalAmountDiv.firstElementChild;

        // получаем родительский див:
        let basketRowPriceCount = basketProductQuantityChangingAndTotalAmountDiv.parentElement;
        // последний элемент - это див, в котором прописывается общая стоимость товара в корзине:
        let basketRowPriceValue = basketRowPriceCount.lastElementChild;

        let targetClickedElemClass = event.target.getAttribute('class'); // смотрим куда кликнули и смотрим, если добавили или 
        
        if (targetClickedElemClass == 'basket-row__quantity-minus') {
            if (basketProductQuantityChangingInput.value <= 1) {
                basketProductQuantityChangingInput.value = 1;                    
            } else {
                basketProductQuantityChangingInput.value -= step;

                // если делать пересчёт стоимости корзины (без учёта стоимости доставки) - можно не перезагружать страницу, а считать на "чистом" JS:
                basketRowPriceValue.innerHTML = new Intl.NumberFormat('ru-RU').format(basketProductQuantityChangingInput.value * basketProductQuantityChangingInput.dataset.productpriceactual) + '&nbsp;&#8381;';
                recalculateTheContentsOfTheBasket();

                let product = new ProdInLocalStorage(keyBasket, basketProductQuantityChangingInput.dataset.productid, basketProductQuantityChangingInput.value);
                // location.reload(); // Если параметр не указан или равен false, страница перезагружается из кэша браузера. Если параметр равен true, страница перезагружается с сервера.        
            }
        }
        if (targetClickedElemClass == 'basket-row__quantity-plus') {
            if(Number(basketProductQuantityChangingInput.value) >= Number(basketProductQuantityChangingInput.dataset.productquantityallowed)) {
                basketProductQuantityChangingInput.value = Number(basketProductQuantityChangingInput.dataset.productquantityallowed);
                alert('Вы не можете положить в корзину большего количества товара, чем его есть на самом деле в наличии!'); 
            } else {
                basketProductQuantityChangingInput.value = Number(basketProductQuantityChangingInput.value) + step;
                
                // если делать пересчёт стоимости корзины (без учёта стоимости доставки) - можно не перезагружать страницу, а считать на "чистом" JS:
                basketRowPriceValue.innerHTML = new Intl.NumberFormat('ru-RU').format(basketProductQuantityChangingInput.value * basketProductQuantityChangingInput.dataset.productpriceactual) + '&nbsp;&#8381;';
                recalculateTheContentsOfTheBasket();

                let product = new ProdInLocalStorage(keyBasket, basketProductQuantityChangingInput.dataset.productid, basketProductQuantityChangingInput.value);
                // location.reload(); // Если параметр не указан или равен false, страница перезагружается из кэша браузера. Если параметр равен true, страница перезагружается с сервера.   
            }
        }

        if (targetClickedElemClass == 'basket-row__quantity-number') {
            event.target.value = '';
        }

        basketProductQuantityChangingInput.addEventListener('change', () => {  
            
            if (parseInt(basketProductQuantityChangingInput.value)) {
                                        
                if(Number(basketProductQuantityChangingInput.value) >= Number(basketProductQuantityChangingInput.dataset.productquantityallowed)) {
                    basketProductQuantityChangingInput.value = Number(basketProductQuantityChangingInput.dataset.productquantityallowed);

                    basketRowPriceValue.innerHTML = new Intl.NumberFormat('ru-RU').format(basketProductQuantityChangingInput.value * basketProductQuantityChangingInput.dataset.productpriceactual) + '&nbsp;&#8381;';
                    recalculateTheContentsOfTheBasket();
                    let product = new ProdInLocalStorage(keyBasket, basketProductQuantityChangingInput.dataset.productid, basketProductQuantityChangingInput.value);

                } else if (Number(basketProductQuantityChangingInput.value) < 1) {
                    basketProductQuantityChangingInput.value = 1;
                    
                    basketRowPriceValue.innerHTML = new Intl.NumberFormat('ru-RU').format(basketProductQuantityChangingInput.value * basketProductQuantityChangingInput.dataset.productpriceactual) + '&nbsp;&#8381;';
                    recalculateTheContentsOfTheBasket();
                    let product = new ProdInLocalStorage(keyBasket, basketProductQuantityChangingInput.dataset.productid, basketProductQuantityChangingInput.value);
                    
                } else {
                    basketProductQuantityChangingInput.value = Number(basketProductQuantityChangingInput.value);

                    basketRowPriceValue.innerHTML = new Intl.NumberFormat('ru-RU').format(basketProductQuantityChangingInput.value * basketProductQuantityChangingInput.dataset.productpriceactual) + '&nbsp;&#8381;';
                    recalculateTheContentsOfTheBasket();
                    let product = new ProdInLocalStorage(keyBasket, basketProductQuantityChangingInput.dataset.productid, basketProductQuantityChangingInput.value);
                }
            } else {
                basketProductQuantityChangingInput.value = 1;

                basketRowPriceValue.innerHTML = new Intl.NumberFormat('ru-RU').format(basketProductQuantityChangingInput.value * basketProductQuantityChangingInput.dataset.productpriceactual) + '&nbsp;&#8381;';
                recalculateTheContentsOfTheBasket();
                let product = new ProdInLocalStorage(keyBasket, basketProductQuantityChangingInput.dataset.productid, basketProductQuantityChangingInput.value);
            }    
            
        });
        
        event.preventDefault();
    });
}

// инициализируем форму ввода данных получателя заказа - (заказ ещё создаётся, не нажата кнопка "Оформить заказ")- скрытый div 
let ordermakingrecipientinfodiv = document.querySelector('#ordermakingrecipientinfodiv');

//для начала читаем из html-кода скрытый инпут с дата-атрибутами для передачи значений из рнр-кода (был ли запрошен для расчёта способ доставки заказа):
let hiddenInputWithDataFromPhp = document.getElementById('hiddenInputWithDataFromPhpIdInBasket');
let token = hiddenInputWithDataFromPhp.dataset.token;

// был ли оформлен новый заказ (покупка)
if(hiddenInputWithDataFromPhp.dataset.getneworderid) {
    console.log(hiddenInputWithDataFromPhp);
    
    // очищаем локальное хранилище браузера корзины покупок
    localStorage.removeItem(keyBasket);
    let newOrderId = hiddenInputWithDataFromPhp.dataset.getneworderid;
    // если заказ оформляет авторизованный пользователь, заказ в локальное хранилище браузера не должен записываться! Он должен быть доступен только при авторизации...
    if(!hiddenInputWithDataFromPhp.dataset.getuserid) {
        new ProdInLocalStorage(keyOrders, newOrderId); // это новый заказ в JS...
        // location.reload(true);           // перезагрузка страницы с сервера - здесь зацикливание...
    } 
    
    //location.replace(document.URL);     // location.replace() удаляет текущую страницу из истории сеанса, что означает, что пользователи не смогут вернуться к ней, нажав кнопку «Назад» в браузере. В то время как location.assign() оставляет запись в истории сеанса.
    location.replace('/');
}

// убираем из просмотра карту почты России - будет видна, когда почта будет выбрана в качестве транспортной компании:
let russianPostMapContent = document.querySelector('.russianpost-map__content');
russianPostMapContent.style.display = "none";

let russianPostMap = document.querySelector('.russianpost-map');
//russianPostMap.style.display = "none";

// Рисуем страницу корзины покупок (если корзина НЕ ПУСТАЯ):
let basketParentDiv = document.querySelector('.basket-wrapper');

if (Object.keys(globalDataBasket).length > 0) {

    // проверяем был ли определён способ доставки и если в качестве доставки была выбрана почта России - делаем блок выбора пункта доставки на карте видимым:
    if(hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid && hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid == 3) {
        russianPostMapContent.style.display = "";
        // и убираем поле ввода адреса доставки из формы добавления информации о заказе (если пользователь не авторизован):
        let basketordermakingdeliveryaddressfieldDiv = document.querySelector('#basketordermakingdeliveryaddressfield');
        basketordermakingdeliveryaddressfieldDiv.style.display = 'none';
    }
  
    let deliveryWayCode = 0;

    if(hiddenInputWithDataFromPhp.dataset.transport) {
        deliveryWayCode = hiddenInputWithDataFromPhp.dataset.transport;
    }

    let basketPriceNoDeliveryBlock = document.createElement('div');
    basketPriceNoDeliveryBlock.className = 'basket-res__no-delivery';
        let basketPriceNoDeliveryBlockH3elemQuantity = document.createElement('h3');
        if((basketProductQuantityTotal == 1 || basketProductQuantityTotal % 10 == 1) && basketProductQuantityTotal != 11) {
            basketPriceNoDeliveryBlockH3elemQuantity.innerHTML = 'Всего в корзине:  ' + '<b>' + new Intl.NumberFormat('ru-RU').format(basketProductQuantityTotal) + '</b>' +' товар, ' ;
        } else if((basketProductQuantityTotal == 2 || basketProductQuantityTotal % 10 == 2 || basketProductQuantityTotal == 3 || basketProductQuantityTotal % 10 == 3 || basketProductQuantityTotal == 4 || basketProductQuantityTotal % 10 == 4) && basketProductQuantityTotal != 12 && basketProductQuantityTotal != 13  && basketProductQuantityTotal != 14) {
            basketPriceNoDeliveryBlockH3elemQuantity.innerHTML = 'Всего в корзине:  ' + '<b>' + new Intl.NumberFormat('ru-RU').format(basketProductQuantityTotal) + '</b>' +' товара, ' ;
        } else {
            basketPriceNoDeliveryBlockH3elemQuantity.innerHTML = 'Всего в корзине:  ' + '<b>' + new Intl.NumberFormat('ru-RU').format(basketProductQuantityTotal) + '</b>' +' товаров, ' ;
        }

        basketPriceNoDeliveryBlock.appendChild(basketPriceNoDeliveryBlockH3elemQuantity);

        let basketPriceNoDeliveryBlockH3elemTotalAmount = document.createElement('h3');
        basketPriceNoDeliveryBlockH3elemTotalAmount.className = 'basketPriceNoDeliveryBlockH3elemTotalAmount'; // для корректировки стоимости Почтой России
        basketPriceNoDeliveryBlockH3elemTotalAmount.innerHTML = 'на сумму: ' + new Intl.NumberFormat('ru-RU').format(basketProductPriceAmountTotal) + '&nbsp;&#8381;';
        basketPriceNoDeliveryBlock.appendChild(basketPriceNoDeliveryBlockH3elemTotalAmount);
    basketParentDiv.appendChild(basketPriceNoDeliveryBlock);

    let productsTotalAmountDiscount = document.createElement('div');
    productsTotalAmountDiscount.className = 'd-flex';
        let productsTotalAmountDiscountPelem1 = document.createElement('p');
        productsTotalAmountDiscountPelem1.className = 'margin-tb12px';
        productsTotalAmountDiscountPelem1.classList.add('fs12');
        productsTotalAmountDiscountPelem1.innerHTML = 'Скидка на товар составила:';  
        productsTotalAmountDiscount.appendChild(productsTotalAmountDiscountPelem1);

        let productsTotalAmountDiscountPelem2 = document.createElement('p');
        productsTotalAmountDiscountPelem2.setAttribute('id', 'productsTotalAmountDiscountPelem2');
        productsTotalAmountDiscountPelem2.className = 'margin-tb12px';
        productsTotalAmountDiscountPelem2.classList.add('fs12');
        productsTotalAmountDiscountPelem2.classList.add('padding-left16px');
        productsTotalAmountDiscountPelem2.innerHTML = new Intl.NumberFormat('ru-RU').format(basketProductDiscountAmountTotal) + '&nbsp;&#8381;';  
        productsTotalAmountDiscount.appendChild(productsTotalAmountDiscountPelem2);

    basketParentDiv.appendChild(productsTotalAmountDiscount);

    // рисуем блок выбора и оформления доставки:
    let basketPriceYesDeliveryBlock = document.createElement('div');
    basketPriceYesDeliveryBlock.className = 'basket-res__delivery';
        let basketPriceYesDeliveryBlockH3elemDelivery = document.createElement('h3');
        basketPriceYesDeliveryBlockH3elemDelivery.className = 'basketPriceYesDeliveryBlockH3elemDelivery';
        
        if(!hiddenInputWithDataFromPhp.dataset.transport) {
            basketPriceYesDeliveryBlockH3elemDelivery.innerHTML = '<i>Цена заказа без учёта стоимости доставки.</i>';
        } else {
            basketPriceYesDeliveryBlockH3elemDelivery.textContent = 'Стоимость доставки:';
        }
        basketPriceYesDeliveryBlock.appendChild(basketPriceYesDeliveryBlockH3elemDelivery);

        let basketPriceYesDeliveryBlockH3elemDeliveryCost = document.createElement('h3');
        basketPriceYesDeliveryBlockH3elemDeliveryCost.className = 'basketPriceYesDeliveryBlockH3elemDeliveryCost';
        let basketDeliveryCost = '0';
        
        if(!hiddenInputWithDataFromPhp.dataset.transport) {
            basketPriceYesDeliveryBlockH3elemDeliveryCost.textContent = '';
        } else if(hiddenInputWithDataFromPhp.dataset.transportcost > 0) {
            basketDeliveryCost = hiddenInputWithDataFromPhp.dataset.transportcost;
            basketPriceYesDeliveryBlockH3elemDeliveryCost.innerHTML = new Intl.NumberFormat('ru-RU').format(basketDeliveryCost) + '&nbsp;&#8381;';
        } else if(hiddenInputWithDataFromPhp.dataset.transportcost == 0 && hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid == 3) {
            basketPriceYesDeliveryBlockH3elemDeliveryCost.innerHTML = '';
            basketPriceYesDeliveryBlockH3elemDelivery.textContent = 'Для расчёта стоимости доставки выберите отделение почты России на карте:';
        } else {
            basketPriceYesDeliveryBlockH3elemDeliveryCost.innerHTML = new Intl.NumberFormat('ru-RU').format(basketDeliveryCost) + '&nbsp;&#8381;';
        }
        
        basketPriceYesDeliveryBlock.appendChild(basketPriceYesDeliveryBlockH3elemDeliveryCost);
    basketParentDiv.appendChild(basketPriceYesDeliveryBlock);

    // заводим блок выбора способа доставки заказа (транспортной компании):
    let basketChoosingDeliveryBlock = document.createElement('div');
    basketChoosingDeliveryBlock.className = 'd-flex';
        let basketChoosingDeliveryForm = document.createElement('form');
        basketChoosingDeliveryForm.setAttribute('id', 'basketChooseTansportCompanyForOrderDeliveryForm');
        basketChoosingDeliveryForm.setAttribute('method', 'GET');
            let basketChoosingDeliveryBlocFormkDiv = document.createElement('div');
            basketChoosingDeliveryBlocFormkDiv.className = 'selectTransportCompanyBasket';
                let basketChoosingDeliveryBlocFormkDivAelem = document.createElement('a');
                basketChoosingDeliveryBlocFormkDivAelem.className = 'basketSelectTransportVisibleBlock';
                if(deliveryWayCode == 0) {
                    basketChoosingDeliveryBlocFormkDivAelem.textContent = 'Выбрать способ доставки или получения заказа';
                } else {
                    basketChoosingDeliveryBlocFormkDivAelem.textContent = hiddenInputWithDataFromPhp.dataset.transport;
                }
                
                basketChoosingDeliveryBlocFormkDiv.appendChild(basketChoosingDeliveryBlocFormkDivAelem);

                let basketChoosingDeliveryBlocFormkDivULelem = document.createElement('ul');
                basketChoosingDeliveryBlocFormkDivULelem.className = 'basket-select__transport-drop';
                    let basketChoosingDeliveryBlocFormkDivLIelem1 = document.createElement('li');
                        let basketChoosingDeliveryBlocFormkDivLIelem1A1 = document.createElement('a');
                        basketChoosingDeliveryBlocFormkDivLIelem1A1.dataset.transport = '1';
                        basketChoosingDeliveryBlocFormkDivLIelem1A1.textContent = 'Самовывоз товара со склада продавца';
                        basketChoosingDeliveryBlocFormkDivLIelem1.appendChild(basketChoosingDeliveryBlocFormkDivLIelem1A1);
                    basketChoosingDeliveryBlocFormkDivULelem.appendChild(basketChoosingDeliveryBlocFormkDivLIelem1);

                    let basketChoosingDeliveryBlocFormkDivLIelem2 = document.createElement('li');
                        let basketChoosingDeliveryBlocFormkDivLIelem2A2 = document.createElement('a');
                        basketChoosingDeliveryBlocFormkDivLIelem2A2.dataset.transport = '2';
                        basketChoosingDeliveryBlocFormkDivLIelem2A2.textContent = 'Доставка по городу Нижнему Новгороду транспортом продавца';
                        basketChoosingDeliveryBlocFormkDivLIelem2.appendChild(basketChoosingDeliveryBlocFormkDivLIelem2A2);
                    basketChoosingDeliveryBlocFormkDivULelem.appendChild(basketChoosingDeliveryBlocFormkDivLIelem2);

                    let basketChoosingDeliveryBlocFormkDivLIelem3 = document.createElement('li');
                        let basketChoosingDeliveryBlocFormkDivLIelem3A3 = document.createElement('a');
                        basketChoosingDeliveryBlocFormkDivLIelem3A3.dataset.transport = '3';
                        basketChoosingDeliveryBlocFormkDivLIelem3A3.textContent = 'Почта России';
                        basketChoosingDeliveryBlocFormkDivLIelem3.appendChild(basketChoosingDeliveryBlocFormkDivLIelem3A3);
                    basketChoosingDeliveryBlocFormkDivULelem.appendChild(basketChoosingDeliveryBlocFormkDivLIelem3);
                   
                basketChoosingDeliveryBlocFormkDiv.appendChild(basketChoosingDeliveryBlocFormkDivULelem);

                let basketChoosingDeliveryBlocFormkDivInputHidden = document.createElement('input');
                basketChoosingDeliveryBlocFormkDivInputHidden.setAttribute('type', 'hidden');
                basketChoosingDeliveryBlocFormkDivInputHidden.setAttribute('id', 'selectTransportCompanyBasketInputHidden');
                basketChoosingDeliveryBlocFormkDivInputHidden.setAttribute('name', 'choosedTransportCompanyForOrderDelivery');
                basketChoosingDeliveryBlocFormkDivInputHidden.setAttribute('value', '0');
                basketChoosingDeliveryBlocFormkDiv.appendChild(basketChoosingDeliveryBlocFormkDivInputHidden);
            basketChoosingDeliveryForm.appendChild(basketChoosingDeliveryBlocFormkDiv);
           
        basketChoosingDeliveryBlock.appendChild(basketChoosingDeliveryForm);
    basketParentDiv.appendChild(basketChoosingDeliveryBlock);
  
    // заводим блок расчёта итоговой суммы к оплате:
    let basketTotalAmountBlock = document.createElement('div');
    
    basketTotalAmountBlock.className = 'basket-res__total';
        console.log(Number(basketProductRegularAmountTotal) > Number(basketProductPriceAmountTotal));
        if(Number(basketProductRegularAmountTotal) > Number(basketProductPriceAmountTotal)) {
            let basketTotalAmountBlockH3elem2 = document.createElement('h3');
            basketTotalAmountBlockH3elem2.className = 'basketTotalAmountBlockH3elem2'; 
            basketTotalAmountBlockH3elem2.classList.add('line-through');
            basketTotalAmountBlockH3elem2.innerHTML = new Intl.NumberFormat('ru-RU').format(Number(basketDeliveryCost) + Number(basketProductRegularAmountTotal)) + '&nbsp;&#8381;';
            basketTotalAmountBlock.appendChild(basketTotalAmountBlockH3elem2);
    
            let basketTotalAmountBlockH3elem3 = document.createElement('h3');
            basketTotalAmountBlockH3elem3.textContent = 'Итого';
            basketTotalAmountBlock.appendChild(basketTotalAmountBlockH3elem3);
    
            let basketTotalAmountBlockH3elem4 = document.createElement('h3');
            basketTotalAmountBlockH3elem4.className = 'basketTotalAmountBlockH3elem4';
            basketTotalAmountBlockH3elem4.classList.add('color-red');
            basketTotalAmountBlockH3elem4.innerHTML = new Intl.NumberFormat('ru-RU').format(Number(basketDeliveryCost) + Number(basketProductPriceAmountTotal)) + '&nbsp;&#8381;';
            basketTotalAmountBlock.appendChild(basketTotalAmountBlockH3elem4);
        } else {
            let basketTotalAmountBlockH3elem2 = document.createElement('h3');
            basketTotalAmountBlockH3elem2.className = 'basketTotalAmountBlockH3elem2'; 
            basketTotalAmountBlockH3elem2.textContent = 'Итого на сумму: ';
            basketTotalAmountBlock.appendChild(basketTotalAmountBlockH3elem2);

            let basketTotalAmountBlockH3elem3 = document.createElement('h3');
            basketTotalAmountBlockH3elem3.textContent = '';
            basketTotalAmountBlock.appendChild(basketTotalAmountBlockH3elem3);

            let basketTotalAmountBlockH3elem4 = document.createElement('h3');
            basketTotalAmountBlockH3elem4.className = 'basketTotalAmountBlockH3elem4';
            basketTotalAmountBlockH3elem4.innerHTML = new Intl.NumberFormat('ru-RU').format(Number(basketDeliveryCost) + Number(basketProductPriceAmountTotal)) + '&nbsp;&#8381;';
            basketTotalAmountBlock.appendChild(basketTotalAmountBlockH3elem4);
        }

    basketParentDiv.appendChild(basketTotalAmountBlock);

    // заводим блок кнопок для оплаты заказа или получения счёта:
    let basketTotalBlockButtons = document.createElement('div');
    basketTotalBlockButtons.className = 'basket-res__total';
    basketTotalBlockButtons.classList.add('margin-top12px');

        let basketTotalBlockButtonsInputelem1 = document.createElement('button');
        basketTotalBlockButtonsInputelem1.className = 'basket-button';

        // делаем кнопку неактивной, т.е. полупрозрачной:
        // basketTotalBlockButtonsInputelem1.classList.contains('basket-button_disabled') ? true : basketTotalBlockButtonsInputelem1.classList.add('basket-button_disabled');
        // basketTotalBlockButtonsInputelem1.classList.contains('d-none') ? true : basketTotalBlockButtonsInputelem1.classList.add('d-none');

        // basketTotalBlockButtonsInputelem1.setAttribute('type', 'submit');
        basketTotalBlockButtonsInputelem1.setAttribute('name', 'basket-button__get-invoice');
        basketTotalBlockButtonsInputelem1.textContent = 'Отменить';
        
        if (!hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid || basketPriceYesDeliveryBlockH3elemDeliveryCost.textContent == '') {
            basketTotalBlockButtonsInputelem1.addEventListener('click', () => {window.location.href = '/';});
        } else {
            if(hiddenInputWithDataFromPhp.dataset.getusertypeid) {
                //
            } else { // выбран способ доставки, т.е. заказ пошёв в стадию оформления и если заказ оформляет неавторизованный пользователь, выбирает отмену (для него нет текста "хочу дешевле), то:
                basketTotalBlockButtonsInputelem1.addEventListener('click', () => {
                    window.location.href = '/';
                }) 
            }
        }

        basketTotalBlockButtons.appendChild(basketTotalBlockButtonsInputelem1);
        
        let basketTotalBlockButtonsInputelem2 = document.createElement('button');
        basketTotalBlockButtonsInputelem2.className = 'basket-button';
        
        // если не выбран способ доставки "деактивируем" кнопку, делаем её полупрозрачной:
        if (!hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid || basketPriceYesDeliveryBlockH3elemDeliveryCost.textContent == '') {
            basketTotalBlockButtonsInputelem2.classList.contains('basket-button_disabled') ? true : basketTotalBlockButtonsInputelem2.classList.add('basket-button_disabled');
        } else {
            if(hiddenInputWithDataFromPhp.dataset.getusertypeid) {  // ПРОБУЕМ изменить value соседней кнопки, когда эта кнопка становится активной и пользователь авторизован!!!
                basketTotalBlockButtonsInputelem1.textContent = 'Хочу дешевле';
                basketTotalBlockButtonsInputelem1.addEventListener('click', (event) => {
                    event.preventDefault(); // Отменяем стандартное поведение формы
                    let myModalWantCheaper = document.querySelector('#myModalWantCheaper');
                    let myModalWantCheaperCloseSpan = document.querySelector('#myModalWantCheaperCloseSpan');
                    let confirmWantCheaperButton = document.querySelector('#confirmWantCheaperButton');
                    let exitMakingOrderButton = document.querySelector('#exitMakingOrderButton');
                    // Открываем модальное окно при нажатии на кнопку
                    myModalWantCheaper.style.display = "block";

                    // Закрываем модальное окно при клике вне его области
                    window.onclick = function(event) {
                        if (event.target == myModalWantCheaper) {
                            myModalWantCheaper.style.display = "none";
                        }
                    }

                    // Обработчик для кнопки подтверждения в модальном окне
                    confirmWantCheaperButton.onclick = function() {
                        myModalWantCheaper.style.display = "none";
                    }

                    // Обработчик для кнопки подтверждения в модальном окне
                    exitMakingOrderButton.onclick = function() {
                        myModalWantCheaper.style.display = "none";
                        window.location.href = '/'; // Переадресация после подтверждения
                    }
                });
            } else { // сюда попадает НЛО, которое хочет "Оформить заказ" - мы должны предупредить его, что история заказа будет только в браузере текущего устройства:
                //
            }
            basketTotalBlockButtonsInputelem2.classList.contains('basket-button_disabled') ? true : basketTotalBlockButtonsInputelem2.classList.remove('basket-button_disabled');
        }

        basketTotalBlockButtonsInputelem2.setAttribute('type', 'submit');
        basketTotalBlockButtonsInputelem2.setAttribute('id', 'basketbuttonmakeanorder');
        basketTotalBlockButtonsInputelem2.setAttribute('name', 'basket-button__make-payment');
        basketTotalBlockButtonsInputelem2.setAttribute('value', 'Оформить заказ');
        basketTotalBlockButtonsInputelem2.textContent = 'Оформить заказ';

        // если выбран способ доставки заказа, активируется кнопка "Оформить заказ". При нажатии на неё - выводим форму "ВВедите данные получателя заказа" - добавления данных плательщика (Фамилию и Имя, телефон и адрес):
        if(hiddenInputWithDataFromPhp.dataset.getusertypeid) { // если пользователь авторизован...
            basketTotalBlockButtonsInputelem2.addEventListener('click', () => {
                if (hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid) {
                ordermakingrecipientinfodiv.style.display = "block";
                }
            });
        } else {
            basketTotalBlockButtonsInputelem2.addEventListener('click', (event) => {
                event.preventDefault(); // Отменяем стандартное поведение формы
                
                let myModalBeRegisteredOrNotToBe = document.getElementById('myModalBeRegisteredOrNotToBe');
                let confirmBeRegisteredOrNotToBeButton = document.querySelector('#confirmBeRegisteredOrNotToBeButton');
                let exitMakingOrderToBeReficterdButton = document.querySelector('#exitMakingOrderToBeReficterdButton');
                
                if(hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid > 0) {
                    // Открываем модальное окно при нажатии на кнопку... только, если выбран способ доставки заказа: 
                    myModalBeRegisteredOrNotToBe.style.display = "block";

                    // Закрываем модальное окно при клике вне его области
                    window.onclick = function(event) {
                        if (event.target == myModalBeRegisteredOrNotToBe) {
                            myModalBeRegisteredOrNotToBe.style.display = "none";
                        }
                    }

                    // Обработчик для кнопки подтверждения в модальном окне
                    confirmBeRegisteredOrNotToBeButton.onclick = function() {
                        myModalBeRegisteredOrNotToBe.style.display = "none";
                        if (hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid) {
                            ordermakingrecipientinfodiv.style.display = "block";
                        }
                    }

                    // Обработчик для кнопки подтверждения в модальном окне
                    exitMakingOrderToBeReficterdButton.onclick = function() {
                        myModalBeRegisteredOrNotToBe.style.display = "none";
                        window.location.href = '/products/basket'; // Переадресация после отмены решения об оформлении заказа без авторизации:
                    }
                }
            });
        }

        if (basketTotalBlockButtonsInputelem2.classList.contains('basket-button_disabled')) {
            basketTotalBlockButtonsInputelem2.addEventListener('click', () => {
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
    let formBasketChooseTansportCompanyForOrderDelivery = document.querySelector('#basketChooseTansportCompanyForOrderDeliveryForm'); // хм... как-то сейчас непонятно, что я сделал пару месяцев назад: выше была здесь создана форма выбора способа доствки заказа, определён метод GET... здесь эта форма присвоена другой переменно с методом post... но именно здесь срабатывает и отправляется запрос в БД о выбранном способе...
    formBasketChooseTansportCompanyForOrderDelivery.setAttribute('type', 'submit');
    formBasketChooseTansportCompanyForOrderDelivery.setAttribute('method', 'POST');

    let tokenHiddenInput = document.createElement('input');
    tokenHiddenInput.setAttribute('type', 'hidden');
    tokenHiddenInput.setAttribute('name', '_token');
    tokenHiddenInput.setAttribute('value', token);
    formBasketChooseTansportCompanyForOrderDelivery.appendChild(tokenHiddenInput);
        
    let selectedResult = 0;

    basketDeliveryWayOfTransportChoosingLinkVisibleTitle.addEventListener('click', event => {
        // выпадающий блок скрыт - делаем его видимым
        basketDeliveryWayOfTransportInvisibleList.style.display == "block" ? basketDeliveryWayOfTransportInvisibleList.style.display = "none" : basketDeliveryWayOfTransportInvisibleList.style.display = "block";
        // Выделяем ссылку открывающую selectTransportCompanyBasket 
        basketDeliveryWayOfTransportInvisibleList.addEventListener('click', event => {  
            
            // Работаем с событием клика по элементам выпадающего списка ... выбираем код элемента списка по которому кликнули
            selectedResult = event.target.firstElementChild;

            if(selectedResult) {
                selectedResult = selectedResult.dataset.transport;
            } else {
                selectedResult = event.target;
                selectedResult = selectedResult.dataset.transport;
            }
            
            basketDeliveryWayChoiseInputHidden.setAttribute('name', 'transport');
            basketDeliveryWayChoiseInputHidden.setAttribute('value', selectedResult);

            let targetTextContent = event.target.firstElementChild ? event.target.firstElementChild.textContent : event.target.textContent;
            basketDeliveryWayOfTransportChoosingLinkVisibleTitle.textContent = targetTextContent; // копируем в видимую часть блока выбора способа доставки товара, выбранный способ доставки
            
            basketDeliveryWayOfTransportInvisibleList.style.display = "none";

            formBasketChooseTansportCompanyForOrderDelivery.submit();

            // Предотвращаем обычное поведение ссылки при клике
            // event.preventDefault();        // пока закомментировали - пробуем при клике на выбранную транспортную компанию, делать GET-запрос на получение из БД размеры упаковки выбранного товара для расчёта стоимости заказа...
        });
             
        event.preventDefault();
    });

    // записываем в переменную поле для ошибок при записи полей формы:
    let nameError = document.querySelector('#ordermakingbuyerinforerrorname');
    let surnameError = document.querySelector('#ordermakingbuyerinforerrorsurname');
    let telNumError = document.querySelector('#ordermakingbuyerinforerrortel');
    // console.log(surnameError);
    // выбираем все инпуты, у которых есть дата-атрибут data-rule:
    let inputsWithDataRule = document.querySelectorAll('input[data-rule]');
    // перебираем циклом полученные инпуты и навешиваем на каждый событие, по которому мы будем валидировать форму:
    for (let input of inputsWithDataRule) {
        input.addEventListener('blur', function() {
            let rule = this.dataset.rule;
            let value = this.value;
            let check;
            let errorText = '';
            this.classList.add('invalid');
            // берём текущего родителя элемена, а затем последний элемент - это и будет наш искомый span, в который мы будем записывать текст ошибки:
            let parent = this.parentElement;
            let span = parent.lastElementChild;

            switch (rule) {
                case 'namefieldtext':
                    let length = value.length;
                    let maxlength = +this.dataset.maxlength;
                    let checkLength = length <= maxlength;
                    if(!checkLength) {
                        errorText = 'Длина текста не может превышать 30 символов!';
                    }
                    let checkVocabulary = /^[а-яА-ЯёЁ\s-]+$/.test(value);
                    if(!checkVocabulary) {
                        errorText = 'Пожалуйста, укажите данные на русском языке';
                    }
                    check = checkLength && checkVocabulary;
                break;
            }

            if(check) {
                this.classList.remove('invalid');
                this.classList.add('valid');
                span.textContent = '';
            } else {
                this.classList.remove('valid');
                span.textContent = errorText;
            }
        });
    }    

    // делаем скрипт для маски ввода номера телефона в форму:
    let basketAddRecipientInfoInputTel = document.querySelector('#basketAddRecipientInfoTel');      // выше или ниже было объявлено так: let tel = document.querySelector('#basketAddRecipientInfoTel');  - надо будет убедиться, что именно так и нужно было сделать...
        
    if(basketAddRecipientInfoInputTel) {
        // console.log (basketAddRecipientInfoInputTel);        // сюда попадаем сразу при формировании страницы... т.е. всегда...
        basketAddRecipientInfoInputTel.addEventListener("input", makePatternForTelNum, false);  // Параметр useCapture (не обязательный) в значении true показывает всплытие
        basketAddRecipientInfoInputTel.addEventListener("focus", makePatternForTelNum, false);  // событий от внутреннего элемента до внешнего,
        basketAddRecipientInfoInputTel.addEventListener("blur", makePatternForTelNum, false);   // при значении false - от внешнего до внутреннего элемента.
        basketAddRecipientInfoInputTel.addEventListener("keydown", makePatternForTelNum, false) // При передаче параметра useCapture его имя опускается и записывает просто true или false.
    }

    let keyCode;
    let telValue = '';
    let telValueView = ''; // +7 (910) 123-45-67)

    // если номер телефона передаётся строкой из БД, проверку ввода не делаем, а просто подставляем данное значение:
    if (hiddenInputWithDataFromPhp.dataset.usertelnum) {
        telValue = 71234567890;
        telValueView = hiddenInputWithDataFromPhp.dataset.usertelnum;
    }

    function makePatternForTelNum(event) {
        telNumError.textContent = '';
        event.keyCode && (keyCode = event.keyCode);
        let pos = this.selectionStart;
        if (pos < 4) event.preventDefault();
        let matrix = "+7 (___) ___-__-__";
        let i = 0;
        let code = matrix.replace(/\D/g, "");
        telValue = this.value.replace(/\D/g, "");
        
        let new_value = matrix.replace(/[_\d]/g, function(a) {
            //console.log(a);
            return i < telValue.length ? telValue.charAt(i++) || code.charAt(i) : a;
        });
        telValueView = new_value;
        i = new_value.indexOf("_");
        //console.log('i: ' + i);

        if (i != -1) {
            i < 5 && (i = 4);
            new_value = new_value.slice(0, i); 
        }      

        let reg = matrix.substring(0, this.value.length + 1).replace(/_+/g,     // добавляем единичку, чтобы "захватить" дефис...
            function(a) {
                return "\\d{1," + a.length + "}"
            }).replace(/[+()]/g, "\\$&");
            // console.log('reg: ' + reg);
        reg = new RegExp("^" + reg + "$");
        
        if (!reg.test(this.value) || this.value.length < 10 || keyCode > 47 && keyCode < 58) this.value = new_value;
        // console.log('this.value: ' + this.value);
        if (event.type == "blur" && telValue.length < 11)  {
            telNumError.textContent = 'Неверно указан номер телефона! Повторите ввод.';
            this.value = matrix;
        } 
        
        if (telValue.length == 11) {
            this.classList.remove('invalid');
            this.classList.add('valid');
        }
        
    }

    // Пробуем копировать содержимое дива под адрес в value инпута:
    let deliveryAddressInput = document.querySelector('#hiddenInputOrderDeliveryAddress');
    // deliveryAddressInput.value = '';
       
    let basketAddRecipientInfoAddress = document.querySelector('#basketAddRecipientInfoAddr');              // это див, в который записывается адрес... НЕ инпут!
    // если выбрали самовывоз со склада, мы должны прописать в это поле адрес склада и сделать его "только для просмотра":
    if (hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid == 1) {
        deliveryAddressInput.value = basketAddRecipientInfoAddress.innerHTML = '603057, г. Нижний Новгород, ул.&nbsp;Бекетова, 3"А". Пн&nbsp;-&nbsp;Пт: 08:00&nbsp;-&nbsp;17:00, <br>без перерыва на обед. <br>Сб&nbsp;-&nbsp;Вс: выходные дни. <br>Добро пожаловать!';
        basketAddRecipientInfoAddress.setAttribute('readonly', true);
        basketAddRecipientInfoAddress.setAttribute('contenteditable', false);
    } else if (hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid == 3) {   // если выбрали доставку почтой... 
        deliveryAddressInput.value = basketAddRecipientInfoAddress.innerHTML = '';
        basketAddRecipientInfoAddress.setAttribute('readonly', true);
        basketAddRecipientInfoAddress.setAttribute('contenteditable', false);
    }
    
    // адрес доставки мы записываем в див, не в инпут! чтобы сделать проверку введённого адреса на данном этапе, записываем в переменную спан, где будет выводиться инф-ия об ошибке: 
    let addrError = document.querySelector('#ordermakingbuyerinforerroraddr');
    addrError.textContent = '';

    function checkAddr() {
        let basketAddRecipientInfoAddress = document.querySelector('#basketAddRecipientInfoAddr');
        // с помощью регулярки проверяем, что адрес не пустой, написан на русском языке, может иметь цифры, пробелы, точки, дефис:
        let checkAddress = /^[а-яА-ЯёЁ\d\s.,"!:)(/-]+$/.test(basketAddRecipientInfoAddress.textContent);
        return checkAddress;
    }

    // инициализируем блок "Проверьте ваш заказ":
    let makingAnOrderBlock = document.querySelector('#orderfrombasketdiv');
    // console.log(hiddenInputWithDataFromPhp.dataset.getusertypeid);
    let basketFormConfirmRecientInfoInput = document.querySelector('#basketFormConfirmRecientInfoInput');                   // это кнопка "Подтвердить"
    // смотрим кто кликнул на кнопку "Подтвердить" Заказ оформляется от имени организации или от авторизованного юридического лица, или от безымянного
    basketFormConfirmRecientInfoInput.addEventListener('click', () => {
        // если юридическое лицо:
        if(hiddenInputWithDataFromPhp.dataset.getusertypeid && hiddenInputWithDataFromPhp.dataset.getuserid && hiddenInputWithDataFromPhp.dataset.getusertypeid == '2') {
            // адрес доставки мы записываем в див, не в инпут! чтобы сделать проверку введённого адреса на данном этапе, записываем в переменную спан, где будет выводиться инф-ия об ошибке: 
            let addrError = document.querySelector('#ordermakingbuyerinforerroraddr');
            addrError.textContent = '';
            
            // если на предыдущем шаге либо отсутствовала запись, либо эта запись не прошла проверку, - убираем класс invalid:
            basketAddRecipientInfoAddress.classList.remove('invalid');

            let checkAddress = /^[а-яА-ЯёЁ\d\s.,"!:)(/-]*$/.test(basketAddRecipientInfoAddress.textContent);
            
            // если проверка не пройдена, добавим класс invalid и изменим текст ошибки:
            if(!checkAddress) {
                deliveryAddressInput.value = '';
            }   else {
                deliveryAddressInput.value = basketAddRecipientInfoAddress.textContent;
            } 

            /*
                для POST-запроса на добавление нового заказа формируем запись (будет использована, когда будет нажата кнопка "Оплатить")
                let divPostMakingUnregisteredUserNewOrderInfo = document.querySelector('#basketdivforhiddeninputsmakingneworder');
                let newOrderInputOrderDeliveryAddress = document.createElement('input');
                newOrderInputOrderDeliveryAddress.setAttribute('type', 'hidden');
                newOrderInputOrderDeliveryAddress.setAttribute('name', 'orderDeliveryAddress'); 
                newOrderInputOrderDeliveryAddress.setAttribute('value', deliveryAddressInput.value);   
                divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderDeliveryAddress);

                let newOrderInputOrderRecipientName = document.createElement('input');
                newOrderInputOrderRecipientName.setAttribute('type', 'hidden');
                newOrderInputOrderRecipientName.setAttribute('name', 'orderRecipientName'); 
                newOrderInputOrderRecipientName.setAttribute('value', nameName.value);   
                divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderRecipientName);

                let newOrderInputOrderRecipientSurname = document.createElement('input');
                newOrderInputOrderRecipientSurname.setAttribute('type', 'hidden');
                newOrderInputOrderRecipientSurname.setAttribute('name', 'orderRecipientSurname'); 
                newOrderInputOrderRecipientSurname.setAttribute('value', surname.value);   
                divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderRecipientSurname);

                let newOrderInputOrderRecipientNames = document.createElement('input');
                newOrderInputOrderRecipientNames.setAttribute('type', 'hidden');
                newOrderInputOrderRecipientNames.setAttribute('name', 'orderRecipientNames'); 
                newOrderInputOrderRecipientNames.setAttribute('value', surname.value + ' ' + nameName.value);   
                divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderRecipientNames);

                let newOrderInputOrderRecipientTel = document.createElement('input');
                newOrderInputOrderRecipientTel.setAttribute('type', 'hidden');
                newOrderInputOrderRecipientTel.setAttribute('name', 'orderRecipientTel');

                newOrderInputOrderRecipientTel.setAttribute('value', tel.value);   
                divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderRecipientTel);
            */
            if(deliveryAddressInput.value.length > 0 && checkAddress) {   
                //КОПИРУЕМ ВВЕДЁННОЕ значение адреса с следующую форму подтверждения и оплаты заказа
                let orderAddressDiv = document.querySelector('#basketCheckRecipientInfoAddr');
                orderAddressDiv.textContent = deliveryAddressInput.value;
                ordermakingrecipientinfodiv.style.display = "";
                makingAnOrderBlock.style.display = 'block';
            } else if (deliveryAddressInput.value.length == 0 && checkAddress) { 
                // console.log(basketAddRecipientInfoAddress.textContent == '');
                basketAddRecipientInfoAddress.classList.add('invalid');
                basketAddRecipientInfoAddress.focus();
                addrError.textContent = 'Данное поле должно быть заполнено!';
            } else if (deliveryAddressInput.value == '' && !checkAddress) { 
                // basketAddRecipientInfoAddress.focus();
                addrError.textContent = 'Адрес пишется на русском языке, может содержать цифры, пробелы, точки, запятые и дефисы...';
                basketAddRecipientInfoAddress.classList.add('invalid');
            }

            // для POST-запроса на добавление нового заказа формируем запись (будет использована, когда будет нажата кнопка "Оплатить")
            let divPostMakingUnregisteredUserNewOrderInfo = document.querySelector('#basketdivforhiddeninputsmakingneworder');
            let newOrderInputOrderDeliveryAddress = document.createElement('input');
            newOrderInputOrderDeliveryAddress.setAttribute('type', 'hidden');
            newOrderInputOrderDeliveryAddress.setAttribute('name', 'orderDeliveryAddress'); 
            newOrderInputOrderDeliveryAddress.setAttribute('value', deliveryAddressInput.value);   
            divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderDeliveryAddress);


        } else if(hiddenInputWithDataFromPhp.dataset.getusertypeid && hiddenInputWithDataFromPhp.dataset.getuserid && hiddenInputWithDataFromPhp.dataset.getusertypeid == '1') {
            // адрес доставки мы записываем в див, не в инпут! чтобы сделать проверку введённого адреса на данном этапе, записываем в переменную спан, где будет выводиться инф-ия об ошибке: 
            let addrError = document.querySelector('#ordermakingbuyerinforerroraddr');
            addrError.textContent = '';
            
            // если на предыдущем шаге либо отсутствовала запись, либо эта запись не прошла проверку, - убираем класс invalid:
            basketAddRecipientInfoAddress.classList.remove('invalid');

            let checkAddress = /^[а-яА-ЯёЁ\d\s.,"!:)(/-]*$/.test(basketAddRecipientInfoAddress.textContent);
            
            // если проверка не пройдена, добавим класс invalid и изменим текст ошибки:
            if(!checkAddress) {
                deliveryAddressInput.value = '';
            }   else {
                deliveryAddressInput.value = basketAddRecipientInfoAddress.textContent;
            } 

            if(deliveryAddressInput.value.length > 0 && checkAddress) {   
                //КОПИРУЕМ ВВЕДЁННОЕ значение адреса с следующую форму подтверждения и оплаты заказа
                let orderAddressDiv = document.querySelector('#basketCheckRecipientInfoAddr');
                orderAddressDiv.textContent = deliveryAddressInput.value;
                ordermakingrecipientinfodiv.style.display = "";
                makingAnOrderBlock.style.display = 'block';
            } else if (deliveryAddressInput.value.length == 0 && checkAddress) { 
                // console.log(basketAddRecipientInfoAddress.textContent == '');
                basketAddRecipientInfoAddress.classList.add('invalid');
                basketAddRecipientInfoAddress.focus();
                addrError.textContent = 'Данное поле должно быть заполнено!';
            } else if (deliveryAddressInput.value == '' && !checkAddress) { 
                // basketAddRecipientInfoAddress.focus();
                addrError.textContent = 'Адрес пишется на русском языке, может содержать цифры, пробелы, точки, запятые и дефисы...';
                basketAddRecipientInfoAddress.classList.add('invalid');
            }

            // для POST-запроса на добавление нового заказа формируем запись (будет использована, когда будет нажата кнопка "Оплатить")
            let divPostMakingUnregisteredUserNewOrderInfo = document.querySelector('#basketdivforhiddeninputsmakingneworder');
            let newOrderInputOrderDeliveryAddress = document.createElement('input');
            newOrderInputOrderDeliveryAddress.setAttribute('type', 'hidden');
            newOrderInputOrderDeliveryAddress.setAttribute('name', 'orderDeliveryAddress'); 
            newOrderInputOrderDeliveryAddress.setAttribute('value', deliveryAddressInput.value);   
            divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderDeliveryAddress);
        }
        
        else {
            // здесь обрабатываем неавторизованных пользователей:
            // объявляем переменные, которые будут использованы при подтверждении заказа:
            let surname = document.querySelector('#basket-order__recipient-surname');
            let nameName = document.querySelector('#basket-order__recipient-name');
            let tel = document.querySelector('#basketAddRecipientInfoTel');         // ниже или выше мы тоже объявляем let basketAddRecipientInfoInputTel = document.querySelector('#basketAddRecipientInfoTel'); - надо будет убедиться, что так и нужно было сделать...
                       
            // если на предыдущем шаге либо отсутствовала запись, либо эта запись не прошла проверку, - убираем класс invalid:
            basketAddRecipientInfoAddress.classList.remove('invalid');

            // с помощью регуряки проверяем, что адрес не пустой, написан на русском языке, может иметь цифры, пробелы, точки, дефис:
            let checkAddress = checkAddr();
            
            // если проверка не пройдена, добавим класс invalid и изменим текст ошибки:       
            
            if(surname.value && nameName.value && !nameError.textContent && !surnameError.textContent && telValue.length == 11 && checkAddress) {   
                
                //КОПИРУЕМ ВВЕДЁННОЕ значение номера телефона в следующую форму подтверждения и оплаты заказа
                let orderTel = document.querySelector('#orderBuyerTelNum');
                orderTel.textContent = tel.value;
                
                //КОПИРУЕМ ВВЕДЁННОЕ значение ФИ в следующую форму подтверждения и оплаты заказа
                let orderBuyerNames = document.querySelector('#orderBuyerNames');
                orderBuyerNames.textContent = surname.value + ' ' + nameName.value;

                //КОПИРУЕМ ВВЕДЁННОЕ значение адреса с следующую форму подтверждения и оплаты заказа
                let orderAddressDiv = document.querySelector('#basketCheckRecipientInfoAddr');
                orderAddressDiv.innerHTML = basketAddRecipientInfoAddress.textContent;
                deliveryAddressInput.value = basketAddRecipientInfoAddress.textContent;

                basketTotalBlockButtonsInputelem2.classList.contains('basket-button_disabled') ? true : basketTotalBlockButtonsInputelem2.classList.add('basket-button_disabled');
                ordermakingrecipientinfodiv.style.display = "";
                makingAnOrderBlock.style.display = 'block';

            } else if (nameName.value == '') {
                nameError.textContent = 'Данное поле должно быть заполнено!';
                nameName.focus();
            } else if (surname.value == '') {
                surnameError.textContent = 'Данное поле должно быть заполнено!';
                surname.focus();
            } else if (telValue.length != 11) {
                // console.log(tel.value);
                tel.focus();
                telNumError.textContent = 'Данное поле должно быть заполнено!';
            } else if(!checkAddress && basketAddRecipientInfoAddress.textContent == '') {
                basketAddRecipientInfoAddress.classList.add('invalid');
                addrError.textContent = 'Поле обязательно для заполнения!';
                basketAddRecipientInfoAddress.focus();
                deliveryAddressInput.value = '';
            } else if (!checkAddress) {
                basketAddRecipientInfoAddress.classList.add('invalid');
                addrError.textContent = 'Адрес пишется на русском языке, может содержать цифры, пробелы, точки и дефисы!';
                basketAddRecipientInfoAddress.textContent = '';
                deliveryAddressInput.value = '';    
                basketAddRecipientInfoAddress.focus();
            }
            
            // если пользователь создаёт заказ и хочет зарезервировать товары на три (для физических лиц), мы должны вывести информационное сообщение об этом:
            let makereserveforpersoninbasketbutton = document.querySelector('#idmakereserveforpersoninbasket');
            // console.log(makereserveforpersoninbasketbutton);
            if(makereserveforpersoninbasketbutton) {
                makereserveforpersoninbasketbutton.addEventListener('click', () => {
                    console.log('click');
                    let textForNewReserve = 'Резерв действителен для оплаты в течение 3-х дней. Выбранные товары зарезервированы для вас на складе по указанным в документе ценам. Благодарим за обращение в нашу компанию. Надеемся на взаимовыгодное сотрудничество.';
                    makeActionConfirmation(textForNewReserve);
                });
            }

            // для POST-запроса на добавление нового заказа формируем запись (будет использована, когда будет нажата кнопка "Оплатить")
            let divPostMakingUnregisteredUserNewOrderInfo = document.querySelector('#basketdivforhiddeninputsmakingneworder');
            let newOrderInputOrderDeliveryAddress = document.createElement('input');
            newOrderInputOrderDeliveryAddress.setAttribute('type', 'hidden');
            newOrderInputOrderDeliveryAddress.setAttribute('name', 'orderDeliveryAddress'); 
            newOrderInputOrderDeliveryAddress.setAttribute('value', deliveryAddressInput.value);   
            divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderDeliveryAddress);

            let newOrderInputOrderRecipientName = document.createElement('input');
            newOrderInputOrderRecipientName.setAttribute('type', 'hidden');
            newOrderInputOrderRecipientName.setAttribute('name', 'orderRecipientName'); 
            newOrderInputOrderRecipientName.setAttribute('value', nameName.value);   
            divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderRecipientName);

            let newOrderInputOrderRecipientSurname = document.createElement('input');
            newOrderInputOrderRecipientSurname.setAttribute('type', 'hidden');
            newOrderInputOrderRecipientSurname.setAttribute('name', 'orderRecipientSurname'); 
            newOrderInputOrderRecipientSurname.setAttribute('value', surname.value);   
            divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderRecipientSurname);

            let newOrderInputOrderRecipientNames = document.createElement('input');
            newOrderInputOrderRecipientNames.setAttribute('type', 'hidden');
            newOrderInputOrderRecipientNames.setAttribute('name', 'orderRecipientNames'); 
            newOrderInputOrderRecipientNames.setAttribute('value', surname.value + ' ' + nameName.value);   
            divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderRecipientNames);

            let newOrderInputOrderRecipientTel = document.createElement('input');
            newOrderInputOrderRecipientTel.setAttribute('type', 'hidden');
            newOrderInputOrderRecipientTel.setAttribute('name', 'orderRecipientTel'); 
            newOrderInputOrderRecipientTel.setAttribute('value', telValueView);   
            divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderRecipientTel);
        }
    });

    // выводим в форму проверки заказа товары, которые были выбраны для покупки:
    let basketPreorderedProductsInCheckingDiv = document.querySelector('#basketpreorderedproductscheckingdiv');
    for(let prodQuantityInput of prodQuantityInBasketInputs) {

        let productTitleDiv = document.createElement('div');
        productTitleDiv.className = 'basket-order__product-item';
            let productTitleDivH3 = document.createElement('h3');
            productTitleDivH3.textContent = prodQuantityInput.dataset.productname;
            productTitleDiv.appendChild(productTitleDivH3);

            let productTitleDivP = document.createElement('p');
            productTitleDivP.className = 'basket-order__product-clearance';
                let productTitleDivPSpan1 = document.createElement('span');
                productTitleDivPSpan1.className = 'basket-order__product-clearance-span';
                if(!prodQuantityInput.dataset.productpricewithrankdiscount) {
                    productTitleDivPSpan1.innerHTML = prodQuantityInput.value + '&nbsp;' + 'шт. по цене: ' + new Intl.NumberFormat('ru-RU').format(prodQuantityInput.dataset.productpriceactual) + '&nbsp&#8381; на сумму: ';
                } else if(prodQuantityInput.dataset.productpricewithrankdiscount) {
                    productTitleDivPSpan1.innerHTML = prodQuantityInput.value + '&nbsp;' + 'шт. по цене: ' + new Intl.NumberFormat('ru-RU').format(prodQuantityInput.dataset.productpricewithrankdiscount) + '&nbsp&#8381; на сумму: ';
                }
                productTitleDivP.appendChild(productTitleDivPSpan1);

                let productTitleDivPSpan2 = document.createElement('span');
                productTitleDivPSpan2.className = 'basket-order__product-clearance-span';
                if(!prodQuantityInput.dataset.productpricewithrankdiscount) {
                    productTitleDivPSpan2.innerHTML = new Intl.NumberFormat('ru-RU').format(prodQuantityInput.dataset.productpriceactual * prodQuantityInput.value) + '&nbsp;&#8381;';
                } else if(prodQuantityInput.dataset.productpricewithrankdiscount) {
                    productTitleDivPSpan2.innerHTML = new Intl.NumberFormat('ru-RU').format(prodQuantityInput.dataset.productpricewithrankdiscount * prodQuantityInput.value) + '&nbsp;&#8381;';
                }
                productTitleDivP.appendChild(productTitleDivPSpan2);             
            productTitleDiv.appendChild(productTitleDivP);

            if(prodQuantityInput.dataset.productpricewithrankdiscount) {
                let productTitleDiscountDivP = document.createElement('p');
                productTitleDiscountDivP.className = 'basket-order__product-clearance';
                
                let productTitleDiscountDivPSpan1 = document.createElement('span');
                    productTitleDiscountDivPSpan1.className = 'basket-order__product-clearance-span';
                    productTitleDiscountDivPSpan1.innerHTML = 'Применена скидка на товар: ';
                    productTitleDiscountDivP.appendChild(productTitleDiscountDivPSpan1);

                let productTitleDiscountDivPSpan2 = document.createElement('span');
                    productTitleDiscountDivPSpan2.className = 'basket-order__product-clearance-span';
                    productTitleDiscountDivPSpan2.innerHTML = new Intl.NumberFormat('ru-RU').format((prodQuantityInput.dataset.productpriceactual * prodQuantityInput.value) - (prodQuantityInput.dataset.productpricewithrankdiscount * prodQuantityInput.value)) + '&nbsp;&#8381;';
                    productTitleDiscountDivP.appendChild(productTitleDiscountDivPSpan2);
                
                productTitleDiv.appendChild(productTitleDiscountDivP);
            } else if(prodQuantityInput.dataset.productpricewithactiondiscount) {
                let productTitleDiscountDivP = document.createElement('p');
                productTitleDiscountDivP.className = 'basket-order__product-clearance';
                
                let productTitleDiscountDivPSpan1 = document.createElement('span');
                    productTitleDiscountDivPSpan1.className = 'basket-order__product-clearance-span';
                    productTitleDiscountDivPSpan1.innerHTML = 'Применена скидка на товар: ';
                    productTitleDiscountDivP.appendChild(productTitleDiscountDivPSpan1);

                let productTitleDiscountDivPSpan2 = document.createElement('span');
                    productTitleDiscountDivPSpan2.className = 'basket-order__product-clearance-span';
                    productTitleDiscountDivPSpan2.innerHTML = new Intl.NumberFormat('ru-RU').format((prodQuantityInput.dataset.productpriceregular * prodQuantityInput.value) - (prodQuantityInput.dataset.productpriceactual * prodQuantityInput.value)) + '&nbsp;&#8381;';
                    productTitleDiscountDivP.appendChild(productTitleDiscountDivPSpan2);
                
                productTitleDiv.appendChild(productTitleDiscountDivP);
            }

        basketPreorderedProductsInCheckingDiv.appendChild(productTitleDiv);
        // если не применены никакие скидки, то:
        // if(!prodQuantityInput.dataset.productdiscounttypeid) {
        //     queryStringGetForTransport += ('&productId_'+ prodQuantityInput.dataset.productid + '=' + prodQuantityInput.dataset.productid + '&quantityProdId_' + prodQuantityInput.dataset.productid + '=' + prodQuantityInput.value + '&priceProdId_' + prodQuantityInput.dataset.productid + '=' + prodQuantityInput.dataset.productpriceforordercontent);
        // } else {
        //    queryStringGetForTransport += ('&productId_'+ prodQuantityInput.dataset.productid + '=' + prodQuantityInput.dataset.productid + '&quantityProdId_' + prodQuantityInput.dataset.productid + '=' + prodQuantityInput.value + '&priceProdId_' + prodQuantityInput.dataset.productid + '=' + prodQuantityInput.dataset.productpriceforordercontent+ '&discountTypeProdId' + '=' + prodQuantityInput.dataset.productdiscounttypeid + '&discountSummProdId' + '=' + prodQuantityInput.dataset.productdiscountperproductline + '&prodPriceRegular' + '=' + prodQuantityInput.dataset.productpriceregular);
        // }
        queryStringGetForTransport += ('&productId_'+ prodQuantityInput.dataset.productid + '=' + prodQuantityInput.dataset.productid + '&quantityProdId_' + prodQuantityInput.dataset.productid + '=' + prodQuantityInput.value + '&priceProdId_' + prodQuantityInput.dataset.productid + '=' + prodQuantityInput.dataset.productpriceforordercontent+ '&discountTypeProdId' + '=' + prodQuantityInput.dataset.productdiscounttypeid + '&discountSummProdId' + '=' + prodQuantityInput.dataset.productdiscountperproductline + '&prodPriceRegular' + '=' + prodQuantityInput.dataset.productpriceregular);
    }

    // копируем общую стоимость товара в форму проверки Заказа:
    let basketpreorderedproductscheckingtotalproductsamountpelem = document.querySelector('#basketpreorderedproductscheckingtotalproductsamountpelem');
    basketpreorderedproductscheckingtotalproductsamountpelem.classList.add('basket-order__product-clearance');

    let nameOfPriceTotalBasketNoDelivery = document.createElement('span');
    nameOfPriceTotalBasketNoDelivery.className = 'basket-order__product-clearance-span';
    nameOfPriceTotalBasketNoDelivery.textContent = 'Всего товаров на сумму:';
    basketpreorderedproductscheckingtotalproductsamountpelem.appendChild(nameOfPriceTotalBasketNoDelivery);

    let valueOfPriceTotalBasketNoDelivery = document.createElement('span');
    valueOfPriceTotalBasketNoDelivery.className = 'basket-order__product-clearance-span';
    valueOfPriceTotalBasketNoDelivery.classList.add('color-red');
    valueOfPriceTotalBasketNoDelivery.innerHTML = new Intl.NumberFormat('ru-RU').format(basketProductPriceAmountTotal) + '&nbsp&#8381;';
    basketpreorderedproductscheckingtotalproductsamountpelem.appendChild(valueOfPriceTotalBasketNoDelivery);

    // записываем в Заказ выбранный способ доставки
    let orderDeliveyWayDiv = document.querySelector('.basket-order__delivery-way');
    let deliveryCostPelem = document.querySelector('#basketpreorderedproductscheckingdeliverycostpelem');

    orderDeliveyWayDiv.innerHTML = 'Выбранный способ доставки/получения заказа:</p>' + basketChoosingDeliveryBlocFormkDivAelem.textContent; 
    deliveryCostPelem.classList.add('basket-order__product-clearance');

    let nameOfDeliveryCost = document.createElement('span');
    nameOfDeliveryCost.className = 'basket-order__product-clearance-span';
    nameOfDeliveryCost.textContent = 'Стоимость доставки/получения: ';
    deliveryCostPelem.appendChild(nameOfDeliveryCost);

    let valueOfDeliveryCost = document.createElement('span');
    valueOfDeliveryCost.setAttribute('id', 'valueofdeliverycostspan');
    valueOfDeliveryCost.className = 'basket-order__product-clearance-span';
    valueOfDeliveryCost.innerHTML = basketPriceYesDeliveryBlockH3elemDeliveryCost.textContent ?? hiddenInputWithDataFromPhp.dataset.transportcost;

    deliveryCostPelem.appendChild(valueOfDeliveryCost);
    
    // в консоль выводилась ошибка: ReferenceError: basketTotalAmountBlockH3elem4 is not defined в строке 1110
    let basketTotalAmountBlockH3elem4;
    if (!basketTotalAmountBlockH3elem4) {
        basketTotalAmountBlockH3elem4 = document.querySelector('.basketTotalAmountBlockH3elem4');
    }

    // записываем итоговую стоимость Заказа:
    let orderTotalAmount = document.querySelector('#orderTotalAmount');
    orderTotalAmount.textContent = basketTotalAmountBlockH3elem4.textContent;

    // записываем итоговую стоимость корзины по регулярным ценам и зачёркиваем эту цифру:
    let orderTotalRegular = document.querySelector('#orderTotalRegular');
    orderTotalRegular.innerHTML = new Intl.NumberFormat('ru-RU').format(basketProductRegularAmountTotal) + '&nbsp&#8381;';

    // записываем итоговую скидку:
    let orderTotalDiscount = document.querySelector('#orderTotalDiscount');
    orderTotalDiscount.textContent = productsTotalAmountDiscountPelem2.textContent;

    // для POST-запроса на добавление нового заказа формируем запись (будет использована, когда будет нажата кнопка "Оплатить"), ранее инициализировали в другой переменной, добавили реквизиты получателя (ФИ, телефон)
    let divPostMakingUnregisteredUserNewOrderInfo = document.querySelector('#basketdivforhiddeninputsmakingneworder');
 /*   
    let newOrderInputOrderDeliveryAddress = document.createElement('input');
    newOrderInputOrderDeliveryAddress.setAttribute('type', 'hidden');
    newOrderInputOrderDeliveryAddress.setAttribute('name', 'orderDeliveryAddress'); 
    newOrderInputOrderDeliveryAddress.setAttribute('value', basketAddRecipientInfoAddress.innerHTML);   
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderDeliveryAddress);
    console.log(newOrderInputOrderDeliveryAddress);

    let newOrderInputOrderRecipientName = document.createElement('input');
    newOrderInputOrderRecipientName.setAttribute('type', 'hidden');
    newOrderInputOrderRecipientName.setAttribute('name', 'orderRecipientName'); 
    newOrderInputOrderRecipientName.setAttribute('value', nameName.value);   
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderRecipientName);

    let newOrderInputOrderRecipientSurname = document.createElement('input');
    newOrderInputOrderRecipientSurname.setAttribute('type', 'hidden');
    newOrderInputOrderRecipientSurname.setAttribute('name', 'orderRecipientSurname'); 
    newOrderInputOrderRecipientSurname.setAttribute('value', surname.value);   
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderRecipientSurname);

    let newOrderInputOrderRecipientNames = document.createElement('input');
    newOrderInputOrderRecipientNames.setAttribute('type', 'hidden');
    newOrderInputOrderRecipientNames.setAttribute('name', 'orderRecipientNames'); 
    newOrderInputOrderRecipientNames.setAttribute('value', orderBuyerNames.value);   
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderRecipientNames);

    let newOrderInputOrderRecipientTel = document.createElement('input');
    newOrderInputOrderRecipientTel.setAttribute('type', 'hidden');
    newOrderInputOrderRecipientTel.setAttribute('name', 'orderRecipientTel');

    newOrderInputOrderRecipientTel.setAttribute('value', tel.value);   
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderRecipientTel);
*/
    let newOrderSellerId = document.createElement('input');
    newOrderSellerId.setAttribute('type', 'hidden');
    newOrderSellerId.setAttribute('name', 'orderSellerId'); // значение 1 (user - ИП Большаков) или 2 (org - ООО "Ладья") 
    if(hiddenInputWithDataFromPhp.dataset.getusertypeid && hiddenInputWithDataFromPhp.dataset.getusertypeid == '2' && hiddenInputWithDataFromPhp.dataset.isuserpaytaxes && hiddenInputWithDataFromPhp.dataset.isuserpaytaxes == '1') {
        newOrderSellerId.setAttribute('value', '1');   // пока захардкодим... Ладья не будет участвовоать в распродажах... :) 
    } else {
        newOrderSellerId.setAttribute('value', '1');
    }
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderSellerId);

    let newOrderInputOrderclientTypeId = document.createElement('input');
    newOrderInputOrderclientTypeId.setAttribute('type', 'hidden');
    newOrderInputOrderclientTypeId.setAttribute('name', 'orderClientTypeId'); // значение 1 (user - физлицо) или 2 (org - юрлицо) 
    if(hiddenInputWithDataFromPhp.dataset.getusertypeid && hiddenInputWithDataFromPhp.dataset.getusertypeid == '2') {
        newOrderInputOrderclientTypeId.setAttribute('value', '2');    
    } else {
        newOrderInputOrderclientTypeId.setAttribute('value', '1');
    }
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderclientTypeId);

    let newOrderInputOrderclientRankId = document.createElement('input');
    newOrderInputOrderclientRankId.setAttribute('type', 'hidden');
    newOrderInputOrderclientRankId.setAttribute('name', 'orderClientRankId'); // значение 1 - 10 (8 - unregistered) getuserstatusid
    if(hiddenInputWithDataFromPhp.dataset.getuserstatusid) {
        let userStatusId = hiddenInputWithDataFromPhp.dataset.getuserstatusid;
        newOrderInputOrderclientRankId.setAttribute('value', userStatusId);    
    } else {
        newOrderInputOrderclientRankId.setAttribute('value', '8');
    }
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderclientRankId);

    let newOrderInputOrderClientId = document.createElement('input');
    newOrderInputOrderClientId.setAttribute('type', 'hidden');
    newOrderInputOrderClientId.setAttribute('name', 'orderClientId'); // значение создаётся (при заказах без регистрации покупателя отправляем значение "ноль" - это значит, что юзера нужно создать!), либо передаётся параметром про оформлении заказа авторизованным пользователем
    if(hiddenInputWithDataFromPhp.dataset.getuserid) {
        let userForOrderId = hiddenInputWithDataFromPhp.dataset.getuserid;
        newOrderInputOrderClientId.setAttribute('value', userForOrderId);    
    } else {
        newOrderInputOrderClientId.setAttribute('value', '0');
    }
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderClientId);

    let newOrderInputOrderAmount = document.createElement('input');
    newOrderInputOrderAmount.setAttribute('type', 'hidden');
    newOrderInputOrderAmount.setAttribute('name', 'orderProductsAmount'); 
    newOrderInputOrderAmount.setAttribute('value', basketProductPriceAmountTotal);
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderAmount);

    let newOrderInputOrderDeliveryCost = document.createElement('input');
    newOrderInputOrderDeliveryCost.setAttribute('type', 'hidden');
    newOrderInputOrderDeliveryCost.setAttribute('name', 'orderDeliveryCost'); 
    newOrderInputOrderDeliveryCost.setAttribute('value', basketDeliveryCost);
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderDeliveryCost);

    let newOrderInputIsIncludesTaxes = document.createElement('input');
    newOrderInputIsIncludesTaxes.setAttribute('type', 'hidden');
    newOrderInputIsIncludesTaxes.setAttribute('name', 'isOrderAmountIncludesTaxes'); 
    if(hiddenInputWithDataFromPhp.dataset.isuserpaytaxes) {
        newOrderInputIsIncludesTaxes.setAttribute('value', '1');    
    } else {
        newOrderInputIsIncludesTaxes.setAttribute('value', '0');
    }
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputIsIncludesTaxes);

    let newOrderInputOrderPaymentMethodId = document.createElement('input');
    newOrderInputOrderPaymentMethodId.setAttribute('type', 'hidden');
    newOrderInputOrderPaymentMethodId.setAttribute('name', 'orderPaymentMethodId'); 
    if(hiddenInputWithDataFromPhp.dataset.paymentmethod) {
        let paymentMethodFromBasket = hiddenInputWithDataFromPhp.dataset.paymentmethod;
        newOrderInputOrderPaymentMethodId.setAttribute('value', paymentMethodFromBasket);    
    } else {
        newOrderInputOrderPaymentMethodId.setAttribute('value', '2');   // (2 - online, 3 - cash, 4 - bank_transfer)
    }
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderPaymentMethodId);

    let newOrderInputOrderTransportId = document.createElement('input');
    newOrderInputOrderTransportId.setAttribute('type', 'hidden');
    newOrderInputOrderTransportId.setAttribute('name', 'orderTransportId'); 
    newOrderInputOrderTransportId.setAttribute('value', hiddenInputWithDataFromPhp.dataset.sqldeliverymethodid);   // (1 - pickup, 2 - delivery_by_seller, 3 - russian_post)
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderTransportId);

    let newOrderInputOrderContent = document.createElement('input');
    newOrderInputOrderContent.setAttribute('type', 'hidden');
    newOrderInputOrderContent.setAttribute('name', 'orderContent'); 
    newOrderInputOrderContent.setAttribute('value', queryStringGetForTransport);   
    divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderContent);

    // для работы с почтой РФ
    // записывает див скрытых инпутов, для передачи post-запроса на создание нового заказа:
    
    // let divPostMakingUnregisteredUserNewOrderInfo = document.querySelector('#basketdivforhiddeninputsmakingneworder');
    // let newOrderInputOrderclientTypeId = document.createElement('input');
    // newOrderInputOrderclientTypeId.setAttribute('type', 'hidden');
    // newOrderInputOrderclientTypeId.setAttribute('name', 'orderClientTypeId'); // значение 1 (user - физлицо) или 2 (org - юрлицо) 
    // newOrderInputOrderclientTypeId.setAttribute('value', '1');
    // divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderclientTypeId);
}

function getChoosedAddressInfoTariffAndDeliveryTime(data) {
        
    // сразу корректируем расчёт стоимости заказа в корзине:
    // let newDeliveryCost = data['cashOfDelivery']/100;
    let newDeliveryCost = Math.round(data['cashOfDelivery']/100);       // Чтобы округлить число до ближайшего целого значения воспользуемся методом Math.round

    // ... и делаем активной кнопку "Оформить заказ" - убираем полупрозрачность: 
    let basketTotalBlockButtonsInputelem2 = document.querySelector('#basketbuttonmakeanorder');
    basketTotalBlockButtonsInputelem2.classList.contains('basket-button_disabled') ? basketTotalBlockButtonsInputelem2.classList.remove('basket-button_disabled') : true;
    
    // получаем стоимость корзины без учёта стоимости доставки:
    let basketPriceNoDeliveryBlockH3elemTotalAmount = document.querySelector('.basketPriceNoDeliveryBlockH3elemTotalAmount');
    let orderAmountPriceNoDelivery = (basketPriceNoDeliveryBlockH3elemTotalAmount.textContent).replace(/\D/g, '');

    // изменим текст Доставка
    let basketPriceYesDeliveryBlockH3elemDelivery = document.querySelector('.basketPriceYesDeliveryBlockH3elemDelivery');
    basketPriceYesDeliveryBlockH3elemDelivery.textContent = 'Доставка Почтой России:';

    // укажем расчётную стоимость доставки Почтой России 
    let basketPriceYesDeliveryBlockH3elemDeliveryCost = document.querySelector('.basketPriceYesDeliveryBlockH3elemDeliveryCost');
    basketPriceYesDeliveryBlockH3elemDeliveryCost.innerHTML = new Intl.NumberFormat('ru-RU').format(newDeliveryCost) + '&nbsp;&#8381;';
    
    // элемент, содержащий итоговую стоимость заказа с учетом стоимости доставки (без скидки)
    let orderTotalRegular = document.querySelector('#orderTotalRegular');
    console.log((orderTotalRegular.textContent).replace(/\D/g, ''));
    let basketTotalAmountBlockH3elem2 = document.querySelector('.basketTotalAmountBlockH3elem2'); 
    basketTotalAmountBlockH3elem2.innerHTML = new Intl.NumberFormat('ru-RU').format(Number(newDeliveryCost) + Number((orderTotalRegular.textContent).replace(/\D/g, ''))) + '&nbsp;&#8381;';
    // console.log(basketTotalAmountBlockH3elem2.textContent);

    // элемент, содержащий итоговую стоимость заказа с учетом стоимости доставки (со скидкой)
    let basketTotalAmountBlockH3elem4 = document.querySelector('.basketTotalAmountBlockH3elem4'); 
    basketTotalAmountBlockH3elem4.innerHTML = new Intl.NumberFormat('ru-RU').format(Number(newDeliveryCost) + Number(orderAmountPriceNoDelivery)) + '&nbsp;&#8381;';
    // console.log(basketTotalAmountBlockH3elem4.textContent);
    
    const paramsContainer = document.querySelector('.map__params');
    paramsContainer.innerHTML = '';

    for (const key in data) {
        const param = document.createElement('div');
        const paramValue = document.createElement('span');

        param.className = 'map__params-item';
        param.textContent = `${key}: `;

        paramValue.textContent = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];

        param.appendChild(paramValue);
        paramsContainer.appendChild(param);
    }
    // console.log(paramsContainer);    

    // делаем нужную для нас выборку адреса, чтобы вставить адрес доставки в соответствующий див для оформления заказа:
    let indexTo, regionTo, areaTo, cityTo, addressTo;

    for (let key in data) {
        // console.log(key);
        let value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
        // console.log(value);
        // console.log(typeof value);
        if(key == 'indexTo') {
            indexTo = value;
        } else if (key == 'regionTo') {
            regionTo = value;
        } else if (key == 'areaTo') {
            // console.log(data[key]);
            // console.log(typeof data[key]);
            areaTo = value;
            // console.log(value);
            // console.log(typeof value);
        } else if (key == 'cityTo') {
            cityTo = value;
        } else if (key == 'addressTo') {
            addressTo = value;
        }      
    }

    // собираем адрес доставки для подтверждения в заказ:
    let orderAddressDiv = '';
    if(isValue(indexTo)) {orderAddressDiv = orderAddressDiv + indexTo + ', ';}
    if(isValue(regionTo)) {orderAddressDiv = orderAddressDiv + regionTo + ', ';}
    if(isValue(areaTo)) {orderAddressDiv = orderAddressDiv + areaTo + ', ';}
    if(isValue(cityTo)) {orderAddressDiv = orderAddressDiv + cityTo + ', ';}
    if(isValue(addressTo)) {orderAddressDiv = orderAddressDiv + addressTo;}
    
    // в нашем случае Почта РФ возвращает нам строку! Строка не пустая! если значение пустое, - то строка будет такой: 'null', поэтому функция возвращает нам true, даже, если значение null - это будет непустая строка... поэтому очищаем адресную строку регулярным выражением... и это будет правильно... уфф... 
    orderAddressDiv = orderAddressDiv.replace(/null, /g, '');
    
    let basketAddRecipientInfoAddress = document.querySelector('#basketAddRecipientInfoAddr');
    let deliveryAddressInput = document.querySelector('#hiddenInputOrderDeliveryAddress');    // дублирование записи! Это потому что в функции для расчёта значений Почты России - без дублирования нельзя!
    deliveryAddressInput.value = basketAddRecipientInfoAddress.innerHTML = orderAddressDiv;

        // для POST-запроса на добавление нового заказа формируем запись (будет использована, когда будет нажата кнопка "Оплатить")
        let divPostMakingUnregisteredUserNewOrderInfo = document.querySelector('#basketdivforhiddeninputsmakingneworder');
        
        let newOrderInputOrderDeliveryAddress = document.createElement('input');
        newOrderInputOrderDeliveryAddress.setAttribute('type', 'hidden');
        newOrderInputOrderDeliveryAddress.setAttribute('name', 'orderDeliveryAddress'); 
        newOrderInputOrderDeliveryAddress.setAttribute('value', deliveryAddressInput.value);   
        divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderDeliveryAddress);

        let newOrderInputOrderDeliveryCost = document.createElement('input');
        newOrderInputOrderDeliveryCost.setAttribute('type', 'hidden');
        newOrderInputOrderDeliveryCost.setAttribute('name', 'orderDeliveryCost'); 
        newOrderInputOrderDeliveryCost.setAttribute('value', newDeliveryCost);
        divPostMakingUnregisteredUserNewOrderInfo.appendChild(newOrderInputOrderDeliveryCost);

    // и дублируем цену в подтверждении заказа:
    let valueOfDeliveryCost = document.querySelector('#valueofdeliverycostspan');
    valueOfDeliveryCost.innerHTML = basketPriceYesDeliveryBlockH3elemDeliveryCost.innerHTML;

    // и общую стоимость заказа:
    let orderTotalAmount = document.querySelector('#orderTotalAmount');
    orderTotalAmount.textContent = basketTotalAmountBlockH3elem2.textContent;

    //  На входе получаем следующий массив данных console.log(data):
    //     {id: 29727, mailType: 'PARCEL_CLASS_1', pvzType: 'russian_post', indexTo: '603038', cashOfDelivery: 34200, …}
    //     addressTo: "ул Котова 2"
    //     areaTo: р-н Брюховецкий
    //     cashOfDelivery: 34200
    //     cityTo: "г Нижний Новгород / ст-ца Переясловская"
    //     deliveryDescription: {description: '1 день', values: {…}}
    //         id: 29727
    //         indexTo: "603038"
    //         location: null
    //         mailType: "PARCEL_CLASS_1"
    //         pvzType: "russian_post"
    //         regionTo: "край Краснодарский"
    //         weight: "500"
    //     [[Prototype]]: Object    
}        

// чтобы после обновления страницы мы оставались на том же месте прокрутки:
// Запомним, где мы остановились.
window.onbeforeunload = () => sessionStorage.setItem('scrollPos', window.scrollY);

// Добро пожаловать обратно! Мы сохранили нашу позицию.
window.onload = () => window.scrollTo(0, sessionStorage.getItem('scrollPos') || 0);

// Делаем модальное окно вместо alert(): Получаем элементы:

// кнопка: "Получить счёт" / "Зарезервировать" / "Хрен редьки не слаще"
    let reserveBtn = document.getElementById('idmakereserveinbasket');
// модальное окно, которое появляется при нажатии кнопки "Зарезервировать" или "получить счёт"
//  - для каждого типа - свой текст и своя кнопка: button id="confirmReserve для подтверждения внутри:
    let modalReserve = document.getElementById('myModalReserve');                       
    let myModalCloseReserveSpan = document.getElementById('myModalCloseReserveSpan');   // крестик, который закрывает окно, указанное выше
    let confirmReserveBtn = document.getElementById('confirmReserve');                         // кнопка подтверждения резерва

// кнопка "оплатить" - верна и для юрлиц и для физлиц... 
    let payBtn = document.getElementById('idpayfororderinbasket');
// модальное окно с кнопкой подтверждения после нажатия кнопки "Оплатить" - для юриков и физиков свой текст модального окна:
    let modalPayment = document.getElementById('myModalPayment');
    let myModalClosePaymentSpan = document.getElementById('myModalClosePaymentSpan');   // крестик, который закрывает окно, указанное выше
    let confirmPaymentBtn = document.getElementById('confirmPayment');                  // кнопка подтверждения оплаты

// это скрытый инпут, который хранит значение нажатой кнопки: pay / reserve
let actionButtonField = document.getElementById('actionButton');

// Переменная для хранения нажатой кнопки
let clickedButton = null;

// если  НЛО всё-таки жмёт кнопку "Зарезервировать", а ему это не должно быть доступно, то должны открыть соответствующее меню:
if(reserveBtn && !hiddenInputWithDataFromPhp.dataset.getuserid) {
    let exitBtn = document.querySelector('#exitMakingOrderWhenNloWantsToReservButton');
    let continiueBtn = document.querySelector('#goAheadMakingOrderWhenNloWantsToReservButton');
    let myModalTryToReserveByNloDiv = document.getElementById('myModalTryToReserveByNlo');

    // Открываем модальное окно для кнопки "Зарезервировать"
    reserveBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Отменяем стандартное поведение формы
        myModalTryToReserveByNloDiv.style.display = "block"; // Показываем модальное окно
    });

     // Закрываем модальное окно при клике вне его области
     window.onclick = function(event) {
        console.log(event);
        if (event.target == myModalTryToReserveByNloDiv) {
            myModalTryToReserveByNloDiv.style.display = "none";
        }
    }

    // Обработчик для кнопки подтверждения выхода в модальном окне
    exitBtn.onclick = function() {
        myModalTryToReserveByNloDiv.style.display = "none";
        window.location.href = '/products/basket'; // Переадресация после отмены решения об оформлении заказа без авторизации:
    }

    // Обработчик для кнопки подтверждения в модальном окне
    continiueBtn.onclick = function() {
        myModalTryToReserveByNloDiv.style.display = "none";
    }
} else if(reserveBtn && hiddenInputWithDataFromPhp.dataset.getuserid) {
    // инициализируем требуемой модальное окно
    let myModalReserveDiv = document.getElementById('myModalReserve');

    // Открываем модальное окно для кнопки "Зарезервировать"
    reserveBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Отменяем стандартное поведение формы
        clickedButton = "reserve"; // Запоминаем, что нажата кнопка "Зарезервировать"
        myModalReserveDiv.style.display = "block"; // Показываем модальное окно
    });

    // Закрываем модальное окно при клике вне его области
    window.onclick = function(event) {
        if (event.target == myModalReserveDiv) {
            myModalReserveDiv.style.display = "none";
        }
    }

    // Закрываем модальное окно при клике на крестик
    myModalCloseReserveSpan.onclick = closeBasketModalWindow(myModalReserveDiv);

    // Если пользователь авторизован - он может зарезервировать товары на три дня... Отправляем форму при нажатии на кнопку "Хорошо"
    if(confirmReserveBtn) {
        confirmReserveBtn.onclick = function() {
            myModalReserveDiv.style.display = "none"; // Скрываем модальное окно

            // Устанавливаем значение скрытого поля в зависимости от нажатой кнопки
            if (clickedButton === "reserve") {
                actionButtonField.value = "reserve";
            } else if (clickedButton === "pay") {
                actionButtonField.value = "pay";
            }
            // Отправляем форму
            document.getElementById("basketOrderConfirmationForm").submit();
        }
    }
}


if(modalReserve && modalPayment) {
    // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    
    // Открываем модальное окно для кнопки "Оплатить"
    payBtn.onclick = function(event) {
        event.preventDefault(); // Отменяем стандартное поведение формы
        clickedButton = "pay"; // Запоминаем, что нажата кнопка "Оплатить"
        modalPayment.style.display = "block"; // Показываем модальное окно
    }

    // Закрываем модальное окно при нажатии на крестик
    myModalClosePaymentSpan.onclick = function() {
        modalPayment.style.display = 'none';
    }

    // Закрываем модальное окно при клике вне его области
    window.onclick = function(event) {
        if (event.target == modalReserve) {
            modalReserve.style.display = 'none';
        } 
        
        if (event.target == modalPayment) {
            modalPayment.style.display = 'none';
        }
    }

    // Отправляем форму при нажатии на кнопку "Хорошо"
    if(confirmPaymentBtn) {
        confirmPaymentBtn.onclick = function() {
            modalPayment.style.display = 'none'; // Скрываем модальное окно

            // Устанавливаем значение скрытого поля в зависимости от нажатой кнопки
            if (clickedButton === 'reserve') {
                actionButtonField.value = 'reserve';
            } else if (clickedButton === 'pay') {
                actionButtonField.value = 'pay';
            }

            // Отправляем форму
            document.getElementById('basketOrderConfirmationForm').submit();
        }
    }

    /*
    
    // Открываем модальное окно для кнопки "Зарезервировать"
    reserveBtn.onclick = function(event) {
        event.preventDefault(); // Отменяем стандартное поведение формы
        clickedButton = "reserve"; // Запоминаем, что нажата кнопка "Зарезервировать"
        modalReserve.style.display = "block"; // Показываем модальное окно
    }

    // Закрываем модальное окно при нажатии на крестик
    myModalCloseReserveSpan.onclick = function() {
        modalReserve.style.display = "none";
    }

    

    
        */
}


// Функция для открытия модального окна в корзине
function openDasketModalWindow(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// Функция для закрытия модального окна в корзине
function closeBasketModalWindow(modal) {
    if (modal) {
        modal.style.display = 'none';
    }
}