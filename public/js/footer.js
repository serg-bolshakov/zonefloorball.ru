"use strict";
// Скрипт будет открывать и закрывать модальные окна.
// Получаем все элементы для модальных окон
let modalTriggersBtns = document.querySelectorAll('.modal-trigger');
let closeButtons = document.querySelectorAll('.modal-close');
let scrollToTopButton = document.querySelector('.scroll-to-top');

// Получаем все ссылки и модальные окна
let modalLinks = document.querySelectorAll('.modal-link');

/*
    // Открываем модальное окно при клике на кнопку
    modalTriggersBtns.forEach(trigger => {
        trigger.addEventListener('click', () => {
            let modalId = trigger.getAttribute('data-modal');
            let modal = document.getElementById(modalId);
            modal.style.display = 'block';
        });
    });

    // Закрываем модальное окно при клике на крестик
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            let modal = button.closest('.modal');
            console.log(modal);
            modal.style.display = 'none';
        });
    });

    // Закрываем модальное окно при клике вне его области
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
*/

// Функция для открытия модального окна
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        history.pushState(null, '', `#${modalId}`); // Добавляем хэш в URL
    }
}

// Функция для закрытия модального окна
function closeModal(modal) {
    modal.style.display = 'none';
    history.pushState(null, '', window.location.pathname); // Убираем хэш из URL
}

/* history.pushState — 
    это метод JavaScript, который позволяет управлять историей браузера. Он добавляет новую запись в историю браузера без перезагрузки страницы. Это часть History API, которая часто используется в одностраничных приложениях (SPA) для изменения URL без полной перезагрузки страницы.
    Параметры history.pushState:
    Метод принимает три параметра:
    - state (первый параметр): Это объект, который можно использовать для хранения данных, связанных с новой записью в истории.
        В нашем случае передаётся null, потому что нам не нужно сохранять дополнительные данные.
    - title (второй параметр): Это заголовок новой записи в истории. Большинство браузеров игнорируют этот параметр, поэтому обычно передаётся пустая строка ('').
    - url (третий параметр): Это новый URL, который будет отображаться в адресной строке браузера.
        В нашем случае мы добавляем хэш (#) и modalId (например, #about-us), чтобы изменить URL без перезагрузки страницы.
*/

// Обработчик для ссылок
modalLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // Отменяем стандартное поведение ссылки
        let modalId = link.getAttribute('href').substring(1); // Получаем ID модального окна
        openModal(modalId); // Открываем модальное окно
    });
});

// Обработчик для закрытия модального окна
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        let modal = button.closest('.modal');
        closeModal(modal);
    });
});

// Закрываем модальное окно при клике вне его области
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target);
    }
});

// Открываем модальное окно при загрузке страницы, если в URL есть хэш
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1); // Получаем хэш из URL
    if (hash) {
        openModal(hash); // Открываем модальное окно, если хэш совпадает с ID
    }
});

// Функция для инициализации стрелочки в модальном окне
function initScrollToTop(modalContent, scrollToTopButton) {
    // Проверка прокрутки
    function checkScroll() {
        if (modalContent.scrollTop > 100) {
            scrollToTopButton.classList.add('visible');
        } else {
            scrollToTopButton.classList.remove('visible');
        }
    }

    // Обработчик прокрутки
    modalContent.addEventListener('scroll', checkScroll);

    // Обработчик клика по стрелочке
    scrollToTopButton.addEventListener('click', () => {
        modalContent.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

document.querySelectorAll('.modal').forEach(modal => {
    let modalContent = modal.querySelector('.modal-content');
    let scrollToTopButton = modal.querySelector('.scroll-to-top');
    if(modalContent && scrollToTopButton) {
        initScrollToTop(modalContent, scrollToTopButton);
    }
});
