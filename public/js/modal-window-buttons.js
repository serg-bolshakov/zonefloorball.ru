"use strict";
let modalTriggersBtnsInBlock = document.querySelectorAll('.modal-trigger');
let closeButtonsInBlock = document.querySelectorAll('.modal-close');

// Открываем модальное окно при клике на кнопку
modalTriggersBtnsInBlock.forEach(trigger => {
    trigger.addEventListener('click', (event) => {
        event.preventDefault(); // Отменяем стандартное поведение ссылки
        let modalId = trigger.getAttribute('data-modal');
        let modal = document.getElementById(modalId);
        modal.style.display = 'block';
    });
});

// Закрываем модальное окно при клике на крестик
closeButtonsInBlock.forEach(button => {
    button.addEventListener('click', () => {
        let modal = button.closest('.modal');
        modal.style.display = 'none';
    });
});

// Закрываем модальное окно при клике вне его области
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});