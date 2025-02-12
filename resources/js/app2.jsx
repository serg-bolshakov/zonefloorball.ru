import './bootstrap';

// настраиваем (31.01.2025) Inertia.js, здесь происходит инициализация Inertia.js и React
import { createInertiaApp } from '@inertiajs/react';        // клиентская часть 
import { createRoot } from 'react-dom/client';

import Header from './Components/Header'; // Импортируем компонент Header

// Ждем, пока DOM полностью загрузится
//document.addEventListener('DOMContentLoaded', () => {
const headerContainer = document.querySelector('.header-orders__counter');

if (headerContainer) {
    const headerRoot = createRoot(headerContainer);
    headerRoot.render(<Header />);
}
//});

const element = document.querySelector('#app');
if(element) {

    // создается Inertia-приложение, которое будет рендерить React-компоненты на странице
    createInertiaApp({
        resolve: name => import(`./Pages/${name}`).then(module => module.default),
        setup({ el, App, props }) {
            const root = createRoot(el);
            root.render(<App {...props} />);    // рендерит корневой компонент App в созданный корневой элемент, передавая ему все свойства (props), которые были получены из серверной части
        },
    });
}

/*

Ошибка: @inertiajs_react.js?v=3a136544:4487 Uncaught (in promise) TypeError: Cannot read properties of null (reading 'dataset')
Получается так, что Inertia.js ожидает, что компонент будет рендериться в контейнере, который уже существует в DOM. А у нас получается что мы пытаетемся рендерить компонент в элемент, 
который либо не существует, либо не имеет нужных атрибутов... Тогда:

// Ждем, пока DOM полностью загрузится

document.addEventListener('DOMContentLoaded', () => {
    // создается Inertia-приложение, которое будет рендерить React-компоненты на странице
    createInertiaApp({
        resolve: name => import(`./Pages/${name}`).then(module => module.default),
        setup({ el, App, props }) {
            const root = createRoot(el);
            root.render(<App {...props} />);    // рендерит корневой компонент App в созданный корневой элемент, передавая ему все свойства (props), которые были получены из серверной части
            console.log(root);
            
            // Рендерим Header отдельно
            const headerContainer = document.querySelector('.header-orders__counter');
            if (headerContainer) {
                const headerRoot = createRoot(headerContainer);
                headerRoot.render(<Header />);
            }
        },
    });
});
*/
/* что здесь происходит:
    1) импорт библиотек
        - createInertiaApp — это функция из библиотеки @inertiajs/react, которая помогает создать Inertia-приложение. 
          Inertia — это библиотека, которая позволяет создавать одностраничные приложения (SPA) 
          с использованием серверного рендеринга (SSR) или клиентского рендеринга.
        
        - createRoot — это функция из react-dom/client, которая используется для создания корневого элемента, 
          в который будет рендериться React-приложение. 
          
    2) Создание Inertia-приложения. Параметры createInertiaApp:
        - resolve — это функция, которая определяет, как будут загружаться React-компоненты для каждой страницы. В данном случае:
            - name — это имя страницы, которое передается из серверной части (например, Home, About и т.д.).
            - import(\./Pages/${name}`) — это динамический импорт, который загружает компонент страницы из папки./Pages` на основе переданного имени.
            - .then(module => module.default) — после загрузки модуля, возвращается его экспорт по умолчанию (обычно это React-компонент).
        - setup — это функция, которая настраивает рендеринг приложения. Она принимает объект с тремя свойствами:
            - el — это DOM-элемент, в который будет рендериться приложение (обычно это элемент с id app в вашем HTML-файле).
            - App — это корневой React-компонент, который будет отрендерен.
            - props — это свойства, которые будут переданы в компонент App.

    Что происходит внутри setup: 
        1) Создание корневого элемента:
            - createRoot(el) создает корневой элемент для React-приложения, используя переданный DOM-элемент el.
        2) Рендеринг приложения:
            - root.render(<App {...props} />) рендерит корневой компонент App в созданный корневой элемент, передавая ему все свойства (props), которые были получены из серверной части.
*/