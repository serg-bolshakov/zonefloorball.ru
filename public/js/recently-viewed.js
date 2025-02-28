"use strict";
// Рисуем страницу Недавно просмотренных...
//alert('!');
let inputHiddenWithInfoForRecentViewed = document.querySelector('.product-info__recently-viewed');

if(inputHiddenWithInfoForRecentViewed) {
    
    let idForListViewedProducts = inputHiddenWithInfoForRecentViewed.dataset.recentviewedid;
    let nameForListViewedProducts = inputHiddenWithInfoForRecentViewed.dataset.recentviewedtitle;
    let priceRegularForListViewedProducts = inputHiddenWithInfoForRecentViewed.dataset.recentviewedpriceregular;
    let priceSpecialForListViewedProducts = inputHiddenWithInfoForRecentViewed.dataset.recentviewedpricespecial;
    let urlForListViewedProducts = inputHiddenWithInfoForRecentViewed.dataset.recentviewedurl;
    let imgMainForListViewedProducts = inputHiddenWithInfoForRecentViewed.dataset.recentviewedimgmain;
    let imgShowCaseForListViewedProducts = inputHiddenWithInfoForRecentViewed.dataset.recentviewedimgshowcase;
    // console.log(imgMainForListViewedProducts);
    let newProductForRecentlyViewedList = new ProductInRecentlyViewed(keyRecentlyViewedProducts, idForListViewedProducts,
        nameForListViewedProducts, priceRegularForListViewedProducts, priceSpecialForListViewedProducts,
        urlForListViewedProducts, imgMainForListViewedProducts, imgShowCaseForListViewedProducts);
}

if(Object.keys(globalDataRecentlyViewedProducts).length > 0) {  
    let productViewedPageContentDiv = document.querySelector('.page-products__viewed-content');
    
    let titleNameDiv = document.createElement('h2');
    titleNameDiv.className = 'basketTitle';
    titleNameDiv.textContent = 'Вы интересовались...';
    productViewedPageContentDiv.appendChild(titleNameDiv);

    let parentDiv = document.querySelector('.product-card__recently-viewed');  
        for(let key in globalDataRecentlyViewedProducts) {
            let elem = globalDataRecentlyViewedProducts[key];
            let assortimentCardBlock = document.createElement('div');
            assortimentCardBlock.className = 'assortiment-card__block';
                let assortimentCardBlockProductImg = document.createElement('div');
                assortimentCardBlockProductImg.className = 'assortiment-card__block-productImg';
                    let productImgLinkMain = document.createElement('a');
                    productImgLinkMain.setAttribute('href', '/products/card/' + elem['url']);
                        let productImgLinkSorceMain = document.createElement('img');
                        productImgLinkSorceMain.setAttribute('src', '/storage/' + elem['img_link_showcase']);
                        productImgLinkSorceMain.setAttribute('alt', elem.name);
                        productImgLinkSorceMain.setAttribute('title', elem.name);
                    productImgLinkMain.appendChild(productImgLinkSorceMain);
                assortimentCardBlockProductImg.appendChild(productImgLinkMain);
            assortimentCardBlock.appendChild(assortimentCardBlockProductImg);

                let assortimentCardBlockProductInfoDiv = document.createElement('div');
                assortimentCardBlockProductInfoDiv.className = 'assortiment-card__block-productInfo';
                    let productNameDiv = document.createElement('div');
                    productNameDiv.className = 'assortiment-card_productName';
                        let productNameLinkAelem = document.createElement('a');
                        productNameLinkAelem.setAttribute('href', '/products/card/' + elem['url']);
                        productNameLinkAelem.textContent = elem.name;
                    productNameDiv.appendChild(productNameLinkAelem);
                assortimentCardBlockProductInfoDiv.appendChild(productNameDiv);

                    let productPriceDiv = document.createElement('div');
                    productPriceDiv.className = 'assortiment-card_productPrice';
                    
                    if(elem['price_special']) {
                        let priceActual = document.createElement('p');
                        priceActual.className = 'priceCurrentSale';
                        priceActual.innerHTML = new Intl.NumberFormat('ru-RU').format(Number(elem['price_special'])) + '&nbsp;<sup>&#8381;</sup>';
                        productPriceDiv.appendChild(priceActual);

                        let priceRegular = document.createElement('p');
                        priceRegular.className = 'priceBeforSale';
                        priceRegular.innerHTML = new Intl.NumberFormat('ru-RU').format(Number(elem['price_regular'])) + '&nbsp;<sup>&#8381;</sup>';
                        productPriceDiv.appendChild(priceRegular);
/*
                        let priceDiscount = document.createElement('p');
                        priceDiscount.className = 'priceDiscountInPercentage';
                        priceDiscount.innerHTML = '-&nbsp;' + (100 - (Math.ceil(Number(elem['price_special']) * 100 / Number(elem['price_regular'])))) +'&#37;';
                        productPriceDiv.appendChild(priceDiscount);
*/
                    } else {
                        let priceActual = document.createElement('p');
                        priceActual.className = 'priceCurrent';
                        priceActual.innerHTML = new Intl.NumberFormat('ru-RU').format(Number(elem['price_regular'])) + '&nbsp;<sup>&#8381;</sup>';
                        productPriceDiv.appendChild(priceActual);
                    }     
                assortimentCardBlockProductInfoDiv.appendChild(productPriceDiv);
            
            assortimentCardBlock.appendChild(assortimentCardBlockProductInfoDiv);
            parentDiv.appendChild(assortimentCardBlock);
        }
    productViewedPageContentDiv.appendChild(parentDiv);
}