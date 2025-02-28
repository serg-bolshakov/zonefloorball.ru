"use strict";

let divCloseEmailToConfirmNotification = document.querySelector('#divNeedToConfirmEmail');    
let imgCloseEmailToConfirmNotification = document.querySelector('#imgNeedToConfirmEmail');

if(imgCloseEmailToConfirmNotification) {
    imgCloseEmailToConfirmNotification.addEventListener('click', () => {
        divCloseEmailToConfirmNotification.style.display = 'none';
    });
}