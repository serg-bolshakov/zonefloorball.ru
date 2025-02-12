<?php   
    //var_dump($data); 
    //var_dump($data['categoryChecked']);
    //print_r($_GET);
    //var_dump($_REQUEST);
?>
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
            console.log(quantityProductFromProfileToBasket);

            // добавляем выбранный товар в корзину:
            new ProdInLocalStorage(keyBasket, productIdFromProfilePersonToBasket, quantityProductFromProfileToBasket);

            // для того, чтобы "отметить" после перезагрузки, что положено в корзину:
            sessionStorage.setItem('inputCountForBasketFromAdminTableProdId_' + productIdFromProfilePersonToBasket, quantityProductFromProfileToBasket);
            //sessionStorage.setItem('key', 'text');

            // события помещения товара в "избранное" или "корзину" нужно прокомментировать пользователю в виде всплывающих сообщений:
            let text = 'Товар помещён в "Корзину для покупок"';
            makeActionConfirmation(text);
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



<style type="text/css">

.user-productTable__nav-bar {
    display: flex;
    flex-wrap: wrap;
}

.select_user-lk {
    margin: 0 8px 8px 0;
}

#adminProductTablePriceEditHintPElem {
  display: none;
  width: 300px;
  background-color: rgb(248, 248, 228);
  /* opacity: 1; */
  position: fixed;
  z-index: 2;
  top: 1%;
  left: 28%;
  /* transform: translate(50%, -50%); */
  padding: 8px;
  font-family: 'Noto Sans';
  font-weight: 400;
  font-style: normal;
  font-size: 12px;
  color: rgba(0, 0, 0);
  text-align:left;
  border-radius: 8px;
  border: 1px solid #cecece;
}

/*стилизовать будем небольшим скриптом, с обыкновенным списком: 
Он выпадает при нажатии кнопку, а при нажатии на пункт из списка его значение копируется
в первоначальную кнопку по которой нажимали и в input hidden.*/
.slct__user-lk {
	display: block;
    border-radius: 5px;
    border: 1px solid #cecece;
    background-color: transparent;
    text-decoration: none;
    width: 285px;
    padding: 5px 15px 5px 10px;
    color: #110f0f;
    font-family: Inter;
    font-size: 12px;
    background-position: 290px -145px;
    /* обрезаем текст, чтобы не вылезал за рамку */
    overflow: hidden;
    white-space:nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;	
    margin-bottom: 8px;
}
.slct__user-lk.active {
	border-radius: 5px 5px 0 0;
	border-bottom: none;
}
.drop__user-lk {
	margin: 0;
	padding: 0;
	width: 310px;
	/* border: 1px solid #cecece; */
    border: 1px solid green;
	/* border-top: none; */
    border-radius: 8px;
	display: none;
	position: absolute;
	background: #fff;
    z-index: 4;
}
.drop__user-lk li {
	list-style: none;
	border-top: 1px dotted #e8e8e8;
	cursor: pointer;
	display: block;
    font-family: Inter;
    font-size: 12px;
	padding: 4px 15px 4px 25px;
	background-position: 10px -119px;
}
.drop__user-lk li a {
	color: #444;
}
.drop__user-lk li:hover {
	background-color: #e8e8e8;
}
.drop__user-lk li:hover a {
	color: blue;
}

.user-lk__scroll-table {
	height: 500px;
	overflow: auto;
	margin-top: 0px;
	margin-bottom: 20px;
	border-bottom: 1px solid #eee;
    position: relative;
    font-family: Inter;
    font-size: 8px;
    /* white-space: nowrap; */
    scrollbar-width: thin;
    /* scroll-padding-inline: 20px; */
    -webkit-overflow-scrolling: touch; /*Плавная прокрутка на мобильных устройствах - но нам это здесь в общем не нужно...*/
}

.user-lk__scroll-table a {
    text-decoration: none;
    color: #444;
}

.user-lk__scroll-table a:hover {
    color: blue;
}

.user-lk__scroll-table thead th {
    position: sticky;
    top: 0;
	font-weight: bold;
	text-align: left;
	border: none;
	padding: 8px 8px;
	background: #f9a34b;
	font-size: 12px;
    z-index: 2;
    text-align: center;
}

.user-lk__scroll-table table tbody td:nth-child(1) { 
    background: #f3f3f3;
    position: sticky; 
    left: 0;
    z-index: 1;
}

.user-lk__scroll-table th:nth-child(1) {
    position: sticky; 
    left: 0;
    z-index: 3;
}

.user-lk__scroll-table table tbody td {
	border-left: 1px solid #ddd;
	border-right: 1px solid #ddd;
	padding: 10px 15px;
	font-size: 14px;
	vertical-align: top;
}

.user-lk__scroll-table table tbody tr:nth-child(even){
	background: #f3f3f3;
}

/* Стили для скролла ::-webkit-scrollbar { width: 6px; }  */

::-webkit-scrollbar-track {
	box-shadow: inset 0 0 6px rgba(0,0,0,0.3); 
} 
::-webkit-scrollbar-thumb {
	box-shadow: inset 0 0 6px rgba(0,0,0,0.3); 
}

.td-center {
    text-align: center;
}

.td-left {
    text-align: left;
}

.td-right {
    text-align: end;
}

.hide-column { 
    display: flexbox; 
}

.user-productTable__input-price {
    outline: none;
    border: none;
    width: 50px;
    background: none;
    font-size: 14px;
	font-weight: 400;
}

.user-productTable__input-date {
    padding: 4px;
    border: thin solid #ddd;
    border-radius: 8px;
}

.user-productTable__quantity {
	position: relative;
	text-align: left;
	padding: 0;
	width: 110px;
	border: 1px solid #ddd;
	display: inline-block;
}
.user-productTable__quantity-minus, .user-productTable__quantity-plus {
    user-select: none;
	position: absolute;
	top: 0;
	width: 30px;
	height: 22px;
	line-height: 22px;
	display: block;
	background: #faf4f2;
	font-size: 20px;
	font-weight: 600;
	text-align: center;
	font-family: arial;
	color: #3e1e02;
	text-decoration: none;
}
.user-productTable__quantity-minus {
	left: 0;
	border-right: 1px solid #ddd;
}
.user-productTable__quantity-plus {
	right: 0;
	border-left: 1px solid #ddd;
}
.user-productTable__quantity-minus:hover, .user-productTable__quantity-plus:hover {
	background: #fffcfb;
}
.user-productTable__quantity-minus:active, .user-productTable__quantity-plus:active {
	background: #e8e4e2;
}
.user-productTable__quantity-number{
	display: inline-block;
	font-size: 14px;
	color: #000;
	line-height: 22px;
	height: 22px;
	padding: 0;
	margin: 0 0 0 31px;
	background: #fff;
	outline: none;
	border: none;
	width: 47px;
	text-align: center;
}

.user-productTable__toBasket-input {
  cursor: pointer;
  user-select: none;
  text-align: center;
  width: 80px;
  height: 28px;
  font-family: 'Noto Sans';
  font-weight: 600;
  font-size: 12px;
  color: white;
  border: 1px solid rgba(0, 253, 0);
  border-radius: 4px;
  background-color: #0275d8;
}

</style>