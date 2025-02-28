"use strict";

let favoritesPageTitle = document.querySelector('.basketTitle');
let favoritesProductsBlockDiv = document.querySelector('#favoritesproductsblock');

// при заходе в избранное, делаем  див с регистрацией/авторизацией невидимым, потому что эти процессы нельзя закончить из-за пезагрузки страниц (обновления количества и цен)
// let headerAuthBlockDiv = document.querySelector('#headerauthblockdiv');
// console.log(headerAuthBlockDiv);
// headerAuthBlockDiv.style.display = 'none';


// инициализируем блок цен. если товар на момент входа на страницу "избранное" закончился, то этот блок нужно будет убрать из просмотра
let favoritesBlockPrices = document.querySelectorAll('.favorites-block__price');
for (let favoritesBlockPrice of favoritesBlockPrices) {
    if (!Number(favoritesBlockPrice.dataset.favoritespriceblockisproductallowed) > 0) {
        let nextDiv = favoritesBlockPrice.firstElementChild;
        let pElem1 = nextDiv.firstElementChild;
        pElem1.textContent = 'Сегодня в продаже нет';
        let imgsDiv = nextDiv.lastElementChild;
        let imgToBasket = imgsDiv.lastElementChild;
        imgToBasket.style.display = 'none';
        let lastDiv = favoritesBlockPrice.lastElementChild;
        lastDiv.style.display = 'none';
        let pElem2 = nextDiv.nextElementSibling;
        pElem2.style.display = 'none';
    }
}

if (Object.keys(globalDataFavorites).length === 0) {
    favoritesPageTitle.textContent = 'В избранном пока ничего нет';
    favoritesProductsBlockDiv.style.display = 'none';
} 

let delProductFromFavoritesLogos = document.querySelectorAll('.favorites-img__remove');
for (let productToRemove of delProductFromFavoritesLogos) { 
    productToRemove.addEventListener('click', () => {
        let key = productToRemove.dataset.removefromfavorites;
        //console.log(productToRemove.dataset.removefromfavorites);
        stockFavorites.removeById(key);
        // события помещения товара в "избранное" или "корзину" нужно прокомментировать пользователю в виде всплывающих сообщений:
        let text = 'Товар удалён из "Избранного"';
        makeActionConfirmation(text);
    });
}

let addProductToBasketLogos = document.querySelectorAll('.favorites-img__addtobasket');
for (let productToAddToBasket of addProductToBasketLogos) {
    productToAddToBasket.addEventListener('click', (event) => {
        
        // рисуем анимацию при нажатии кнопки "добавить в корзину" оранжевый мячик в корзину... 
        makeTheWayFromButtonToLogoCounterBasket(event)
        
        let key = productToAddToBasket.dataset.addtobasketfromfavoritesid;
        new ProdInLocalStorage(keyBasket, key);

        // события помещения товара в "избранное" или "корзину" нужно прокомментировать пользователю в виде всплывающих сообщений:
        let text = 'Товар добавлен в "Корзину"';
        makeActionConfirmation(text);

        //location.reload(); - перезагрузка "работает" в функции makeActionConfirmation
    });
}


/*
// Рисуем страницу Избранного:
let favoritesParentDiv = document.querySelector('.basket-wrapper');

let favoritesPageTitle = document.createElement('h1');
favoritesPageTitle.className = 'basketTitle';

if (Object.keys(globalDataFavorites).length === 0) {
    favoritesPageTitle.textContent = 'В избранном пока ничего нет';
    favoritesParentDiv.appendChild(favoritesPageTitle);

} else {
    favoritesPageTitle.textContent = 'Избранное';
    favoritesParentDiv.appendChild(favoritesPageTitle);
    // при переборе товаров из избранного, сразу будем суммировать количество товара:
    let favoritesProductQuantityTotal = 0;

    for (let key in globalDataFavorites) {
        //console.log(globalDataFavorites[key]);

        let favoritesRowProduct = document.createElement('div');
        favoritesRowProduct.className = 'basket-row__product';
      
            let favoritesRowProductDivImg = document.createElement('div');
            favoritesRowProductDivImg.className = 'basket-row__block';
                let favoritesRowProductDivSimpleLine = document.createElement('div');
                favoritesRowProductDivSimpleLine.className = 'basket-row__new-block-line';
                favoritesRowProductDivImg.appendChild(favoritesRowProductDivSimpleLine);
                
                let favoritesRowProductDivImgAElem = document.createElement('a');
                favoritesRowProductDivImgAElem.setAttribute('href', '/products/card/' + globalDataFavorites[key].url + '/');
                    let favoritesProductImgLink = document.createElement('img');
                    favoritesProductImgLink.setAttribute('src', '/project/webroot/' + globalDataFavorites[key].img_link);
                    favoritesProductImgLink.setAttribute('alt', globalDataFavorites[key].name);
                    favoritesProductImgLink.setAttribute('title', 'Кликните, чтобы перейти в карточку товара');
                    favoritesRowProductDivImgAElem.appendChild(favoritesProductImgLink);
                favoritesRowProductDivImg.appendChild(favoritesRowProductDivImgAElem);
            favoritesRowProduct.appendChild(favoritesRowProductDivImg);

            let favoritesRowProductDivName = document.createElement('div');
            favoritesRowProductDivName.className = 'basket-row__block';
                let favoritesProductName = document.createElement('h3');
                favoritesProductName.textContent = globalDataFavorites[key].name;
                favoritesRowProductDivName.appendChild(favoritesProductName);
            favoritesRowProduct.appendChild(favoritesRowProductDivName);
            
            let favoritesProductQuantity = 1; // хардкодим количество товара в избранное "по умолчанию", чтобы работал класс нового продукта
            let favoritesRowProductDivPriceAndQuantity = document.createElement('div');
            favoritesRowProductDivPriceAndQuantity.className = 'basket-row__block';
                let instockAndDelFromFavoritesLogoLinkDiv = document.createElement('div');
                instockAndDelFromFavoritesLogoLinkDiv.className = 'basket-res__total';
                    let favoritesProductQuantityPelem = document.createElement('p'); 
                    let favoritesProductQuantityAllowed = globalDataFavorites[key].allowed;
                    favoritesProductQuantityPelem.innerHTML = 'в наличии: <span class="basket-quantity__span-tag">' + favoritesProductQuantityAllowed + '</span> шт.';
                instockAndDelFromFavoritesLogoLinkDiv.appendChild(favoritesProductQuantityPelem);

                    let productInFavoritesLogoDivs = document.createElement('div');
                    productInFavoritesLogoDivs.className = 'basket-delete__product-div';
                        let delProductFromFavoritesLogo = document.createElement('img');
                        delProductFromFavoritesLogo.setAttribute('src', '/project/webroot/icons/icon _trash 2 outline_.png');
                        delProductFromFavoritesLogo.setAttribute('alt', 'icon _trash 2 outline_.png');
                        delProductFromFavoritesLogo.setAttribute('title', 'Удалить товар из Избранного');
                        delProductFromFavoritesLogo.addEventListener('click', () => {
                            //console.log(stockFavorites);
                            //console.log(localStorage.getItem('productsForFavorites'));
                            stockFavorites.removeById(key);
                            location.reload();
                        });
                    productInFavoritesLogoDivs.appendChild(delProductFromFavoritesLogo);
                
                    let addProductToBasketLogo = document.createElement('img');
                    addProductToBasketLogo.setAttribute('src', '/project/webroot/icons/icon _shopping cart outline_.png');
                    addProductToBasketLogo.setAttribute('alt', 'icon _shopping cart outline_.png');
                    addProductToBasketLogo.setAttribute('title', 'Добавить выбранный товар в корзину');
                    addProductToBasketLogo.addEventListener('click', () => {
                        let product = new ProductInTheBasket(keyBasket, globalDataFavorites[key].id, 
                            globalDataFavorites[key].article, globalDataFavorites[key].name, 
                            globalDataFavorites[key].price, globalDataFavorites[key].quantity, 
                            globalDataFavorites[key].url, globalDataFavorites[key].img_link, 
                            globalDataFavorites[key].allowed);
                        location.reload();
                    });
                    productInFavoritesLogoDivs.appendChild(addProductToBasketLogo);
                instockAndDelFromFavoritesLogoLinkDiv.appendChild(productInFavoritesLogoDivs);
                    
            favoritesRowProductDivPriceAndQuantity.appendChild(instockAndDelFromFavoritesLogoLinkDiv);

                let favoritesProductPriceAndQuantityPelem = document.createElement('p');
                favoritesProductPriceAndQuantityPelem.textContent = 'по лучшей цене:';
            favoritesRowProductDivPriceAndQuantity.appendChild(favoritesProductPriceAndQuantityPelem);
        
                let favoritesProductPriceDivelem = document.createElement('div');
                favoritesProductPriceDivelem.className = 'basket-row__priceValue';
                let favoritesProductPrice = globalDataFavorites[key].price;
                let favoritesProductPriceView = new Intl.NumberFormat('ru-RU').format(favoritesProductPrice); // В России в качестве разделителя целой и дробной части используется запятая, а в качестве разделителя разрядов - пробел
                favoritesProductPriceDivelem.innerHTML = favoritesProductPriceView + ' &#8381;';
            favoritesRowProductDivPriceAndQuantity.appendChild(favoritesProductPriceDivelem);   
        favoritesRowProduct.appendChild(favoritesRowProductDivPriceAndQuantity);
   
        let lineDiv = document.createElement('div');
        lineDiv.className = 'favorites-line__div';
        favoritesRowProduct.appendChild(lineDiv);  
        
        let favoritesTotalInfoBlockkH3elemMayBeChanged = document.createElement('h3');
        favoritesTotalInfoBlockkH3elemMayBeChanged.innerHTML = '... прошло немного времени... количество товара в продаже и цены могли измениться...';
        //favoritesRowProduct.appendChild(favoritesTotalInfoBlockkH3elemMayBeChanged);
            let favoritesTotalBlockButtonsInputelem1 = document.createElement('button');
            favoritesTotalBlockButtonsInputelem1.className = 'favorites-button';
            favoritesTotalBlockButtonsInputelem1.setAttribute('type', 'submit');
            favoritesTotalBlockButtonsInputelem1.setAttribute('name', 'favorites-button__check-price-quantity-product');
            favoritesTotalBlockButtonsInputelem1.setAttribute('value', 'Проверить ->');
            favoritesTotalBlockButtonsInputelem1.innerHTML = ' &rArr;&nbsp;Проверить';
            favoritesTotalInfoBlockkH3elemMayBeChanged.appendChild(favoritesTotalBlockButtonsInputelem1);
        favoritesRowProduct.appendChild(favoritesTotalInfoBlockkH3elemMayBeChanged);
        favoritesProductQuantityTotal += 1;
        favoritesParentDiv.appendChild(favoritesRowProduct);
    }
    //console.log(favoritesProductQuantityTotal);
}
*/
