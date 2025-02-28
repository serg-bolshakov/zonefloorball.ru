"use strict";

// console.log(globalDataFavorites);
let totalQuantityProductsInFavorites = Object.keys(globalDataFavorites).length; // количество ключей (товаров) в объекте локального хранилища избранных товаров
let headerFavoritesProductCounter = document.querySelector('.header-favorites__counter');
headerFavoritesProductCounter.textContent  = totalQuantityProductsInFavorites;
if (totalQuantityProductsInFavorites == 0) {
headerFavoritesProductCounter.style.display = 'none';
}  

// эту хрень с подсчётом количества товаров в корзине нужно пересмотреть... хотя... кажется именно здесь оно и верно! в случае выше мы просто пересчитываем количество РАЗНЫХ товаров, здесь именно КОЛИЧЕСТВО!
let totalQuantityProductsInBasket = 0;
for (let keyAsId in globalDataBasket) {
  //console.log(globalDataBasket[keyAsId]);
  totalQuantityProductsInBasket += Number(globalDataBasket[keyAsId]['quantity']);
  //console.log(totalQuantityProductsInBasket);
};
//console.log(totalQuantityProductsInBasket);

let headerBasketProductCounter = document.querySelector('.header-basket__counter');
headerBasketProductCounter.textContent = totalQuantityProductsInBasket;
(totalQuantityProductsInBasket == 0) ? (headerBasketProductCounter.style.display = 'none') : (headerBasketProductCounter.style.display = '');


/* пока комментируем... 26.12.2024 - пробуем получить данные напрямую и "проверенные", т.е. актуальную инфрмацию из БД... - посмотрим что получится...
  let totalQuantityOrders = Object.keys(globalDataOrders).length; 
  //console.log(Object.keys(globalDataOrders).length);

  let headerOrdersCounter = document.querySelector('.header-orders__counter');
  if(headerOrdersCounter) {
    headerOrdersCounter.textContent  = totalQuantityOrders;
    (totalQuantityOrders == 0) ? (headerOrdersCounter.style.display = 'none') : (headerOrdersCounter.style.display = '');
  }
*/

let totalQuantityOrdersInput = document.querySelector('#idsOrdersInUserLocalStorage');

let totalQuantityOrders = 0;
if(totalQuantityOrdersInput.value != '') {
  let totalQuantityOrdersArr = JSON.parse(totalQuantityOrdersInput.value);
  totalQuantityOrders = Object.keys(totalQuantityOrdersArr).length;
}

let headerOrdersCounter = document.querySelector('.header-orders__counter');
if(headerOrdersCounter) {
  headerOrdersCounter.textContent  = totalQuantityOrders;
  (totalQuantityOrders == 0) ? (headerOrdersCounter.style.display = 'none') : (headerOrdersCounter.style.display = '');
}

// если нужно удалить id-каких-то заказов из локального хранилища, то это нужно сделать:

if(totalQuantityOrdersInput.dataset.idsordersinuserlocalstoragetodel != '') {
  let idsrdersInUserLocalStorageToDelArr = JSON.parse(totalQuantityOrdersInput.dataset.idsordersinuserlocalstoragetodel);
  // Фильтруем первый массив, оставляя только те элементы, которых нет во втором массиве
  // let filteredArr1 = arr1.filter(item => !arr2.includes(item));

  // а потом подумал: зачем что-то фильтровать? есть же текущее актуальное состояние - можно просто перезаписать значение локального хранилища:
  idsrdersInUserLocalStorageToDelArr.forEach(element => {
    stockOrder.removeById(element);
  });
}

/*
    Метод filter позволяется отфильтровать элементы массива, оставив только подходящие под определенное условие элементы. 
    Метод в параметре получает функцию, которая выполнится для каждого элемента массива. Своим результатом метод возвращает новый массив, 
    в который войдут только те элементы, для которых переданная функции вернет true.

    let новый массив = массив.filter(function(элемент, индекс, массив) {
      код
      return true или false
    });
*/


/* как сравнить два массива и удалить из них элементы с одинаковым значением javascript
  function removeCommonElements(arr1, arr2) {
  
  // Фильтруем первый массив, оставляя только те элементы, которых нет во втором массиве
  const filteredArr1 = arr1.filter(item => !arr2.includes(item));
  // Фильтруем второй массив, оставляя только те элементы, которых нет в первом массиве
  const filteredArr2 = arr2.filter(item => !arr1.includes(item));
  
  // Возвращаем оба отфильтрованных массива
  return [filteredArr1, filteredArr2];
}

const array1 = [1, 2, 3, 4, 5];
const array2 = [3, 4, 5, 6, 7];

const [result1, result2] = removeCommonElements(array1, array2);

console.log(result1); // [1, 2]
console.log(result2); // [6, 7]
*/

// "перенёс" я этот блок в файл scripts.js ... НО там его не видно!!! и флеш-сообщение не выводится: в консоли: console.log(flashMessageInHeader) => null... так что перепрописываю его здесь (этот блок кода)
let flashMessageInHeader2 = document.querySelector('#flashmessage');

if(isValue(flashMessageInHeader2.innerHTML)) {
  flashMessageInHeader2.style.display = 'block'; 
  setTimeout(function() {
		flashMessageInHeader2.style.display = '';    
	}, 3000);
}
