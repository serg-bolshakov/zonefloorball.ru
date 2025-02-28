"use strict";

let buttonFromProductCardPutProductForFavorites = document.querySelector('#buttonFromProductCardPutProductForFavorites');
if(buttonFromProductCardPutProductForFavorites) {
    buttonFromProductCardPutProductForFavorites.addEventListener('click', ()=> {
        
        let productForFavoritesFromProductCard = document.querySelector('#hiddenInputFromProductCardWithInfoForBasket');
        let choosedItemForFavoritesProdIdFromProductCard = productForFavoritesFromProductCard.dataset.productid;
        
        let product = new ProdInLocalStorage(keyFavorites, choosedItemForFavoritesProdIdFromProductCard);
        //console.log(product);

        // события помещения товара в "избранное" или "корзину" нужно прокомментировать пользователю в виде всплывающих сообщений:
        let text = 'Товар добавлен в "Избранное"';
        makeActionConfirmation(text);

    });
}

let productForBasketFromProductCard = document.querySelector('#hiddenInputFromProductCardWithInfoForBasket');
let buttonFromProductCardPutProductForBasket = document.querySelector('#buttonFromProductCardPutProductForBasket');

// рисуем путь заказа до корзины ... в виде мячика оранжевого...
if(buttonFromProductCardPutProductForBasket) {
    buttonFromProductCardPutProductForBasket.addEventListener('click', (event) => {
        
        // рисуем анимацию при нажатии кнопки "добавить в корзину" оранжевый мячик в корзину... 
        makeTheWayFromButtonToLogoCounterBasket(event)
            
        let choosedItemForBasketProdIdFromProductCard = productForBasketFromProductCard.dataset.productid;
        let product = new ProdInLocalStorage(keyBasket, choosedItemForBasketProdIdFromProductCard);

        // события помещения товара в "избранное" или "корзину" нужно прокомментировать пользователю в виде всплывающих сообщений:
        let text = 'Товар помещён в "Корзину для покупок"';
        makeActionConfirmation(text);

    });
}