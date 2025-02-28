"use strict";

let inputFormFavorites = document.querySelector('#inputForCheckingFavoritesFromLacalStorage');
inputFormFavorites.setAttribute('value', idFavoritesArr);
let checkFavoritesInLocalStorageForm = document.querySelector('#checkfavoritesinlocalstorageform');

// выполняем однократное срабатывание формы для передачи post-запросом id-шников избранного для их выборки из БД.Для этого:
let isCheckedFavoritesInLocalStorage = sessionStorage.getItem('ischeckedfavoriteslocalstorage');

if (isCheckedFavoritesInLocalStorage === null) {
    let timeSessionStart = Date.now();
    sessionStorage.setItem('ischeckedfavoriteslocalstorage', timeSessionStart);
    checkFavoritesInLocalStorageForm.submit();
}

// после перезагрузки страницы, хранилище сессии удаляется и снова генерируется нужный POST-запрос при заходе на страницу favorites...
window.onload = function(){sessionStorage.removeItem('ischeckedfavoriteslocalstorage');} 

