<h1 class="h1-tablename">Товарный ассортимент</h1>
<div class="user-productTable__nav-bar">
    <form id="lkuserchoosecategoryform" action="" method="GET">
        <div class="select_user-lk">
            <a href="" class="slct__user-lk"><?= (!empty($_GET['productCategory'])) ? 'Выбрана категория: ' . $categoryChecked : 'Показаны товары всех категорий' ?></a>
            <ul class="drop__user-lk">
                <li><a data-category="0">Выбрать все категории</a></li>
                @foreach($categories as $category) 
                    <li><a data-category="<?= $category->url_semantic ?>"><?= mb_strtolower($category->category_view) ?></a></li>
                @endforeach
            </ul>
            
            <input type="hidden" id="input" name="getproducts" value="all" >
            <input type="hidden" id="userlkselectcategory" name="productCategory" value="0" >
        </div>
    </form>
</div>

<div class="user-lk__scroll-table">
    <table id="userProductTable">
        <thead>
            <tr>
                <th>Превью</th>    
                <th>Наименование товара</th>
                <th>РРЦ</th>
                <th>Цена актуальная</th>
                <th>В продаже</th>
                <th>Выбрать</th>
                <th>Действие</th>
                <th>На складе</th>
                <th>В резерве</th>
                <th>Доступно для предзаказа</th>
                <th>Ожидаемая дата поставки на склад</th>
                <th>Артикул</th>
                <th class="hide-column">id</th>
                <th>Бренд</th>
                <th>№</th>
            </tr>
        </thead>
        <tbody>
            @foreach($products as $product)
            
            <tr>
                @if($product->productReport->on_sale > 0 || $product->productReport->in_stock > 0 || $product->productReport->reserved > 0 || $product->productReport->on_preorder || !empty($product->productReport->expected_receipt_date))
                <td class="table-img"><img src="/storage/{{ $product->productShowCaseImage->img_link }}" alt="{{ $product->title }}" title ="{{ $product->title }}"></td>  
                <td><a href="/products/card/{{ $product->prod_url_semantic }}/">{{ $product->title }}</a></td>  
                <td><input type="text" readonly class="td-right user-productTable__input-price user-productTable__targetInput-priceCorrection" 
                    data-productid="{{ $product->id }}" data-productarticle="{{ $product->article }}" data-productname="{{ $product->title }}" 
                    data-productpriceregular="{{ $product->regularPrice->price_value }}" 
                    data-productpricespecial="{{ ($product->actualPrice->price_value < $product->regularPrice->price_value) ? $product->actualPrice->price_value : '' }}" 
                    data-productpricespecialdatestart="<?php // echo $product['date_start_for_table'] ?>" 
                    data-productpricespecialdateend="{{ $product->actualPrice->date_end }}" 
                    name="regularPrice" 
                    value="<?= (number_format((int)$product->regularPrice->price_value, 0, '', ' ')) ?? '' ?>"></td>
                <td class="td-right">
                    @if($product->actualPrice->price_value < $product->regularPrice->price_value) 
                        <div class="color-red margin-bottom8px"><?php echo number_format($product->actualPrice->price_value, 0,",", " " ); ?> <sup>&#8381;</sup></div>
                        <div class="cardProduct-priceDiscountInPercentage"><nobr>-&nbsp;<?php echo $discount = ceil(100 - ($product->actualPrice->price_value) / ($product->regularPrice->price_value) * 100); ?>&#37;<nobr></div>
                    @else
                        <div class=""><?php echo number_format($product->regularPrice->price_value, 0,",", " " ); ?> <sup>&#8381;</sup></div>
                    @endif
                </td>
                
                <td class="td-center">{{ $product->productReport->on_sale }}</td>
                <td>
                    @if($product->productReport->on_sale > 0)
                    <div class="user-productTable__quantity" data-step="1" data-min="1" data-max="100">
                        <input id="inputCountForBasketFromAdminTableProdId_{{ $product->id }}" class="user-productTable__quantity-number" name="count_{{ $product->id }}" value="1">
                        <a href="" class="user-productTable__quantity-minus">−</a>
                        <a href="" class="user-productTable__quantity-plus">+</a>
                    </div>
                    @endif
                </td>

                <td>@if($product->productReport->on_sale > 0)
                    <input  readonly class="user-productTable__toBasket-input" value="В корзину" 
                    data-targetedInputId = "inputCountForBasketFromAdminTableProdId_{{ $product->id }}" data-productarticle="{{ $product->article }}"
                    data-productimglink="{{ $product->productMainImage->img_link ?? ''}}" data-onsalequantityallowed="{{ $product->productReport->on_sale }}" 
                    data-productid="{{ $product->id }}" 
                    data-productname="<?= $product->title ?>" data-productpriceactual="<?= $product->productReport->price_actual ?>" data-producturlsemantic="<?= $product->prod_url_semantic ?>" >
                    @endif
                </td>
                
                <td><?= $product->productReport->in_stock ?></td>
                <td><?= $product->productReport->reserved ?></td>
                <td><?= $product->productReport->on_preorder ?></td>
                <td><?= $product->productReport->expected_receipt_date ?></td>
                <td><?= $product->article ?></td>
                <td class="hide-column"><?= $product->id ?? '' ?></td>
                <td><?= $product->brand->brand ?? '' ?></td>
                <td id="numberoflines">{{ $loop->iteration }}</td>
                @endif
            </tr>
            @endforeach        
        </tbody>
    </table>

</div>

<script>
    "use strict";
    
    // чтобы после обновления страницы мы оставались на том же месте прокрутки:
    // Запомним, где мы остановились.
    window.onbeforeunload = () => sessionStorage.setItem('scrollPos', window.scrollY);

    // Добро пожаловать обратно! Мы сохранили нашу позицию.
    window.onload = () => window.scrollTo(0, sessionStorage.getItem('scrollPos') || 0);
    
    let hiddenCols = document.querySelectorAll('.hide-column');
    for (let hiddenCol of hiddenCols) {
        hiddenCol.style.display = "none";
    }

    // делаем блок поля для выборки количества товаров:
    let adminProductTableQuantityDivs = document.querySelectorAll('.user-productTable__quantity');
    for(let adminProductTableQuantityDiv of adminProductTableQuantityDivs) {
        adminProductTableQuantityDiv.addEventListener('click', event => {
            let step = 1;
            let targetParentElem = event.target.parentElement; // определяем родительский див
            let targetElemQuantity = targetParentElem.firstElementChild;  // input дива, куда вводится количество товара
            let possibleProductQuantity = targetParentElem.parentElement.previousElementSibling;
            //console.log(possibleProductQuantity.textContent);
            let targetClickedElemClass = event.target.getAttribute('class'); // смотрим куда кликнули и смотрим, если добавили или 
            if (targetClickedElemClass == 'user-productTable__quantity-minus') {
                if (Number(targetElemQuantity.value) <= 1) {
                    targetElemQuantity.value = 1;
                    //alert('Вы не можете положить в корзину отрицательное число товара!'); 
                } else {
                    targetElemQuantity.value -= step;
                }
            }
            if (targetClickedElemClass == 'user-productTable__quantity-plus') {
                if(Number(targetElemQuantity.value) >= possibleProductQuantity.textContent) {
                    targetElemQuantity.value = possibleProductQuantity.textContent;
                    //alert('Вы не можете положить в корзину большего количества товара, чем его на самом деле в наличии!'); 
                } else {
                    targetElemQuantity.value = Number(targetElemQuantity.value) + step;
                }
            }

            if (targetClickedElemClass == 'user-productTable__quantity-number') {
                   event.target.value = '';
                   event.target.focus();
            }

            targetElemQuantity.addEventListener('change', () => {
                if (parseInt(targetElemQuantity.value)) {
                    if(Number(targetElemQuantity.value) >= possibleProductQuantity.textContent) {
                        targetElemQuantity.value = possibleProductQuantity.textContent;
                        alert('Вы не можете положить в корзину большего количества товара, чем его на самом деле в наличии!'); 
                    } else if (Number(targetElemQuantity.value) <= 1) {
                        targetElemQuantity.value = 1;
                    } else {
                        targetElemQuantity.value = Number(targetElemQuantity.value);
                    }
                } else {
                    targetElemQuantity.value = 1;
                }
            });
            
            event.preventDefault();
        });
    }
    
    // Select
    let adminAllproductsSelectCategoryLink = document.querySelector('.slct__user-lk');
    let adminAllproductsSelectCategoryList = document.querySelector('.drop__user-lk');
    let adminAllproductsSelectCategoryChoiceInput = document.querySelector('#userlkselectcategory');
    let form   = document.querySelector('#lkuserchoosecategoryform');
    
    adminAllproductsSelectCategoryLink.addEventListener('click', event => {
        
        /* выпадающий блок скрыт - делаем его видимым*/
        adminAllproductsSelectCategoryList.style.display == "block" ? adminAllproductsSelectCategoryList.style.display = "none" : adminAllproductsSelectCategoryList.style.display = "block";
        
        /* Выделяем ссылку открывающую select */
        adminAllproductsSelectCategoryList.addEventListener('click', event => {
            
            /* Работаем с событием клика по элементам выпадающего списка ... выбираем код элемента списка по которому кликнули */ 
            let selectResult = event.target.firstElementChild;
            if(selectResult) {
                selectResult = selectResult.getAttribute('data-category');
            } else {
                selectResult = event.target;
                selectResult = selectResult.getAttribute('data-category');
            }
            
            adminAllproductsSelectCategoryChoiceInput.setAttribute('value', selectResult);
            adminAllproductsSelectCategoryLink.textContent = event.target.textContent;
            adminAllproductsSelectCategoryList.style.display = "none";
            let choice = adminAllproductsSelectCategoryChoiceInput.getAttribute('value');
            form.submit();
               
            /* Предотвращаем обычное поведение ссылки при клике */
            event.preventDefault();        
        });
        
        event.preventDefault();
    });  

    // укладываем выбранный товар в корзину покупок:
    let productTableInProfile = document.querySelector('#userProductTable');
    productTableInProfile.addEventListener('click', event => {
        let target = event.target.getAttribute('class'); // определяем родительский див
        if (target == "user-productTable__toBasket-input") {
            let productIdFromProfilePersonToBasket = event.target.getAttribute('data-productid');
            
            // смотрим количество выбранного для корзины товара:
            let inputProductFromProfileToBasket = document.getElementById('inputCountForBasketFromAdminTableProdId_' + productIdFromProfilePersonToBasket);
            let quantityProductFromProfileToBasket = inputProductFromProfileToBasket.value;

            // добавляем выбранный товар в корзину:
            new ProdInLocalStorage(keyBasket, productIdFromProfilePersonToBasket, quantityProductFromProfileToBasket);

            // для того, чтобы "отметить" после перезагрузки, что положено в корзину:
            sessionStorage.setItem('inputCountForBasketFromAdminTableProdId_' + productIdFromProfilePersonToBasket, quantityProductFromProfileToBasket);
            //sessionStorage.setItem('key', 'text');

            // события помещения товара в "избранное" или "корзину" нужно прокомментировать пользователю в виде всплывающих сообщений:
            let text = 'Товар помещён в "Корзину для покупок"';
            makeActionConfirmation(text);

            // рисуем анимацию при нажатии кнопки "добавить в корзину" оранжевый мячик в корзину... 
            makeTheWayFromButtonToLogoCounterBasket(event)
        }
    });

    // сделали так, что при перезагрузке страницы сохранялись данные инпута, если они были изменены... (при клике на кнопку "добавить в корзину" у администратора):
    document.addEventListener("DOMContentLoaded", function() {
        for(let key in sessionStorage) {
            console.log(key);
            console.log(sessionStorage[key]);
            let elem = document.getElementById(key);
            if(elem) {
                elem.value = sessionStorage[key];
                elem.style.backgroundColor = '#0275d8';
                elem.style.color = 'white';
                elem.style.borderRadius = 4 + 'px';
            }
        }
    }); 
</script>