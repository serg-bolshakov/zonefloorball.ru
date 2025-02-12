// React-компонент, который будет выполнять POST-запрос при загрузке страницы на предмет проверки существования в БД id-заказов, 
// которые есть в локальном хранилище браузера пользователя и  обновлять состояние localStorage клиента на основе ответа от сервера.

import React, { useEffect, useState } from 'react';
import axios from 'axios'; // можно использовать Inertia.js для запросов

const OrderSyncComponent = () => {
    const [globalDataOrders, setGlobalDataOrders] = useState(0);
    // const [isLoading, setIsLoading] = useState(true);        // пока здесь не нужно
    // const [isChecked, setIsChecked] = useState(false);       // не работает так, как нужно - сделал через локальное хранилище сессии

    useEffect(() => {
        // Получаем данные из локального хранилища браузера
        // console.log(localStorage.getItem('orders'));                                //  {"262":{"id":"262","quantity":"1"}}
        // console.log(typeof localStorage.getItem('orders'));                         //  string

        const localData = JSON.parse(localStorage.getItem('orders')) || {};
        
        // смотрим была ли однократная сверка состояния локального хранилища заказов браузера клиента и БД
        let isCheckedOrdersInLocalStorage = sessionStorage.getItem('ischeckedorderslocalstorage');

        // console.log(localData);                                                     //  {"262":{"id":"262","quantity":"1"}}
        // console.log(typeof localData);                                              //  object
        // console.log(Object.keys(localData));                                        //  ['262'] -> 0: "262"
        // console.log(Object.keys(localData).length);                                 //  1


        // Если данные есть в локальном хранилище, используем их
        if (Object.keys(localData).length > 0) {
            // проверяем, чтобы запрос отправлялся только один раз при заходе на страницу приложения, а не каждый раз при переходе
            if(isCheckedOrdersInLocalStorage === null) {
                console.log('!');
                // выполняем POST-запрос к серверу. Laravel ожидает CSRF-токен для всех POST-запросов => добавляем CSRF-токен в заголовки запроса axios. Для этого:
                // учитывая, что Laravel автоматически добавляет CSRF-токен в мета-тег на странице... получаем его:
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

                // Данные для отправки
                const ordersIdsJson = JSON.stringify(localData);                        //  
                
                // console.log(Object.keys(localData));                                    //  ['262']
                // console.log(Object.keys(localData).length);                             //  1
                // console.log(ordersIdsJson);                                             //  ["262"]
                // console.log(typeof ordersIdsJson);                                      //  object
                
                const formData = new FormData();
                formData.append('orderslistfromlocalstorageinheader', ordersIdsJson);

                // Отправляем POST-запрос
                axios.post('/sync-orders-list', formData, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        // 'Content-Type': 'multipart/form-data',   // Важно для FormData
                        'Content-Type': 'application/json',         // Указываем, что отправляем JSON
                    },
                })
                    .then(response => {
                        // console.log(typeof response.data); // "string" или "object"             //  object
                        // console.log(response.data); // посмотреть содержимое                    //  262:{id: '262', quantity: '1'} [[Prototype]] : Object                     
                        const orders = response.data;
                        // console.log(JSON.parse(orders));                                     //  Ошибка при загрузке данных: SyntaxError: "[object Object]" is not valid JSON
                        // разбираем в массив полученную JSON-строку id-заказов из БД:
                        // const ordersSync = JSON.parse(orders); 
                        // JSON.parse на клиенте не нужен, если мы используем Axios, так как он уже парсит JSON 
                                            
                        if(Object.keys(orders).length > 0) {
                            setGlobalDataOrders(Object.keys(orders).length);
                            localStorage.setItem('orders', JSON.stringify(orders));
                        } else {
                            setGlobalDataOrders(0);
                        }
                        
                        // setIsLoading(false);     // пока не нужно
                        // setIsChecked(true);      // не работает так, как нужно - сделал через локальное хранилище сессии
                        sessionStorage.setItem('ischeckedorderslocalstorage', Date.now());
                    })
                    .catch(error => {
                        console.error('Ошибка:', error.response ? error.response.data : error.message);
                        // setIsLoading(false);     // пока не нужно
                        // setIsChecked(true);      // не работает так, как нужно - сделал через локальное хранилище сессии
                        sessionStorage.setItem('ischeckedorderslocalstorage', Date.now());
                    });
            } else {
                setGlobalDataOrders(Object.keys(localData).length);
            }
        } else {
            setGlobalDataOrders(0);
            // setIsLoading(false);     // пока не нужно
            // setIsChecked(true);      // не работает так, как нужно - сделал через локальное хранилище сессии
            sessionStorage.setItem('ischeckedorderslocalstorage', Date.now());
        }
    }, []);
    /* всплвает эта надпись - нам это не нужно - комментируем:
    if (isLoading) {
        return <div>Загрузка...</div>;
    }
    */
    return (
        <div className="header-orders__counter header-logo__counter color-blue">
            {globalDataOrders}
        </div>
    );
};

export default OrderSyncComponent;