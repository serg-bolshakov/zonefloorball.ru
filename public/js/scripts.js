"use strict"

// записываем в переменную значение строки запроса браузера
let url = new URL(document.URL);

class ProductInRecentlyViewed {
    #id;
    #name;
    #price_regular;
    #price_special;
    #url;
    #img_link_main;
    #img_link_showcase;
    #time;
    #stock;

    constructor(key, id, name, price_regular, price_special, url, img_link_main, img_link_showcase) {
        this.#id = id;
        this.#name = name;
        this.#price_regular = price_regular;
        this.#price_special = price_special;
        this.#url = url;
        this.#img_link_main = img_link_main;
        this.#img_link_showcase = img_link_showcase;
        this.#time = Date.now();  
        this.#stock = new Stock(key, id); 
                
        this.#save();
    }
  
    restore(data) {
      
        this.#setId(data.id);
        this.#setName(data.name);
        this.#setPriceRegular(data.price_regular);
        this.#setPriceSpecial(data.price_special);
        this.#setUrl(data.url);  
        this.#setImgLinkMain(data.img_link_main);  
        this.#setImgLinkShowcase(data.img_link_showcase);
        this.#setTime(data.time);

        this.#save();
    }

    #save() {
        let data = {
            id: this.#getId(),
            name: this.#getName(),
            price_regular: this.#getPriceRegular(),
            price_special: this.#getPriceSpecial(),
            url: this.#getUrl(),
            img_link_main: this.#getImgLinkMain(),
            img_link_showcase: this.#getImgLinkShowcase(),
            time: this.#getTime(),
        };
        
        this.#stock.save(data);
    }

    #setId(value)               { this.#id = value; }
    #getId()                    { return this.#id;  }

    #setName(value)             { this.#name = value;}
    #getName()                  { return this.#name; }

    #setPriceRegular(value)     { this.#price_regular = value; }
    #getPriceRegular()          { return this.#price_regular;  }

    #setPriceSpecial(value)     { this.#price_special = value; }
    #getPriceSpecial()          { return this.#price_special;  }

    #setUrl(value)              { this.#url = value;}
    #getUrl()                   { return this.#url; }
    
    #setImgLinkMain(value)      { this.#img_link_main = value;  }
    #getImgLinkMain()           { return this.#img_link_main;   }

    #setImgLinkShowcase(value)  { this.#img_link_showcase = value; }
    #getImgLinkShowcase()       { return this.#img_link_showcase;  }

    #setTime(value)             { this.#time = value; }
    #getTime()                  { return this.#time;  }
}

/* работает с конкретным продуктом по его id... 
   позволяет хранить массивы и объекты в локальном хранилище - преобразует в строки в формат JSON и потом извлекает... добавляет в хранилище...
*/
class Stock {
    #id;
    #storage;

    constructor(key, id = null) {
        this.#storage = new Storage(key);
        this.#id = id;
    }

    save(value) {
        let data = this.#extract();
        data[this.#id] = value;         // value - это строка от конкретного товара вида 3: {name: '...', price: 240, quantity: 81, allowed: 1}
        this.#compact(data);
    }

    remove() {
        let data = this.#extract();
        delete data[this.#id];
        this.#compact(data);
    }

    removeById(id) {
        let data = this.#extract();
        delete data[id];
        this.#compact(data);
    }

    get() {
        let data = this.#extract();
        if (data[this.#id] !== undefined) {
            return data[this.#id];
        } else {
            return undefined;
        }
    }

    getAll() {
        return this.#extract();
    }

    #compact(data) {
        this.#storage.save(JSON.stringify(data));
    }

    #extract() {
        let data = this.#storage.get();
        
        if (data === null) {
            return {};
        } else {
            return JSON.parse(data);
        }
    }
}

class Storage {
    #key;

    constructor(key) {
        this.#key = key;
    }
    
    save(data) {
        localStorage.setItem(this.#key, data);  // сохраняет строку data с ключом this.#key в локальном хранилище браузера... этот ключ передаётся при создании хранилища
    }
    
    get() {
        return localStorage.getItem(this.#key);
    }
}

class ProdInLocalStorage {
    #id;
    #stock;
    #quantity;

    constructor(key, id, quantity = '1') {
        this.#id = id;
        this.#quantity = quantity;
        this.#stock = new Stock(key, id); 
                
        this.#save();
    }
  
    restore(data) {
        this.#setId(data.id);
        this.#setQuantity(data.quantity);
        this.#save();

    }

    #save() {
        let data = {
            id: this.#getId(),
            quantity: this.#getQuantity(),
        };
        
        this.#stock.save(data);
    }

    #setId(value)   { this.#id = value; }
    #getId()        { return this.#id;  }

    #setQuantity(value)   { this.#quantity = value; }
    #getQuantity()        { return this.#quantity;  }

    watchQuantityOrdered() {   
        this.#save();
    }
}

function makeActionConfirmation(text) {
    // создаём див, в котором будем выводить это сообщение:
    let info = document.createElement('div');
    info.classList.add('flash-message');  
    info.textContent = text;
    info.style.display = 'block'; // делаем его видимым..
    // добавляем этот див в наше окно браузера:
    document.body.appendChild(info);
    // через какое-то время удаляем этот див с сообщением и обновляем страницу:
    setTimeout (
        () => {
            info.remove();
            //location.replace(document.URL);
            location.reload();
        }, 1500
    );         
}

function makeClearanceMessageText(text) {
    // инициализируем Див, в кот. будем выводить флеш-сообщения скриптов:
    let flashMessage = document.querySelector('#flashmessage');
    console.log(flashMessage);
    flashMessage.innerHTML = text;
    let img = document.createElement('img');
    img.setAttribute('src', '/storage/icons/icon-close.png');
    img.setAttribute('alt', 'close');
    img.setAttribute('title', 'Супер! Понятно. Закрыть');
    img.classList.add('close-img');

    flashMessage.appendChild(img);
    flashMessage.style.display = 'block';

    img.addEventListener('click', () => {
        flashMessage.textContent = '';
        flashMessage.style.display = '';
    });
}

let keyFavorites = 'productsForFavorites';
let stockFavorites = new Stock(keyFavorites);
let globalDataFavorites = stockFavorites.getAll();

let idFavoritesString = '';
let idFavoritesArr = [];
if(globalDataFavorites) {
    for (let keyAsId in globalDataFavorites) {
        //console.log(keyAsId);
        idFavoritesString = idFavoritesString + keyAsId + ', ';
        idFavoritesArr.push(keyAsId);
        let product = new ProdInLocalStorage(keyFavorites, keyAsId);
        product.restore(globalDataFavorites[keyAsId]);
    };
}
//localStorage.removeItem(keyFavorites);

/* для обновления данных по остаткам товаров в продаже и их цене из БД для товаров которые находятся в "избранном" локального хранилища браузера:
    1) сразу, в момент загрузки сайта, когда получаем их локального хранилища объект избранных товаров (globalDataFavorites) и перебираем по ключам, - сразу записываем эти ключи в строку idFavoritesString 
    3) запишем эту строку в data-атрибут инпута, который мы считаем в рнр после того как мы сабмитим один раз форму
    4) выполним запрос к БД и получим актуальную информацию о количестве данного товара в продаже и его цене
    5) передадит эту информацию в виде массива $data для заполнения соответствующих полей в избранном...
    приступим!
*/

// удалим последнюю запятую в строке ключей (всместе с пробелом):
idFavoritesString = idFavoritesString.slice(0, -2);

let keyRecentlyViewedProducts = 'productsForRecentlyViewed';
let stockRecentlyViewedProducts = new Stock(keyRecentlyViewedProducts);
let globalDataRecentlyViewedProducts = stockRecentlyViewedProducts.getAll();

/* отсортируем объект в порядке возрастания значений по времени - это можно сделать в массиве:
- создаём пустой массив... заполняем его объектами... сортируем... удаляем самый ранний (если длина объекта более 6-ти штук): */
if(Object.keys(globalDataRecentlyViewedProducts).length > 6) {

    let arrGlobalDataRecentlyViewedProducts = [];
    
    for (let elem in globalDataRecentlyViewedProducts) {
        arrGlobalDataRecentlyViewedProducts.push(globalDataRecentlyViewedProducts[elem]);
    }

    arrGlobalDataRecentlyViewedProducts.sort(function(a, b) {
        return a.time - b.time;
    });

    let latestViewedProductId = arrGlobalDataRecentlyViewedProducts[0].id;
    
    // удаляем его из хранилища:
    stockRecentlyViewedProducts.removeById(latestViewedProductId);
    globalDataRecentlyViewedProducts = stockRecentlyViewedProducts.getAll();
}

for (let keyAsId in globalDataRecentlyViewedProducts) {
    let product = new ProductInRecentlyViewed(keyRecentlyViewedProducts, keyAsId);
    product.restore(globalDataRecentlyViewedProducts[keyAsId]);
};

//при загрузке (переходе) страницы-корзины, прочитываем её содержимое из локального хранилища и проверяем его на пустоту:
let keyBasket = 'productsForBasket';           //  это такая строка... именно в таком виде будем сохранять в локальное хранилище - именно в этом ключе мы будем хранить все продукты корзины покупок!
let stockBasket = new Stock(keyBasket);
let globalDataBasket = stockBasket.getAll();

let basketJson = JSON.stringify(globalDataBasket);
//console.log(basketJson);
let basketIdsStr = (Object.keys(globalDataBasket)).join(','); // массив id-шников приводим к строке... для его передачи в post-запросе... в качестве параметра для выборки...

for (let keyAsId in globalDataBasket) {
    let product = new ProdInLocalStorage(keyBasket, keyAsId);
    product.restore(globalDataBasket[keyAsId]);
};
//localStorage.removeItem(keyBasket);


//при загрузке (переходе) страницы заказов, прочитываем её содержимое из локального хранилища и проверяем его на пустоту:
let keyOrders = 'orders';           //  это такая строка... именно в таком виде будем сохранять в локальное хранилище - именно в этом ключе мы будем хранить все заказы!

// если пользователь авторизован, - строка (ключ) должна быть откорректирована. Проверяем:
/*
let hiddenInputWithDataFromPhpHeader = document.querySelector('#hiddenInputWithDataFromPhpIdInHeader');
if(hiddenInputWithDataFromPhpHeader.dataset.getusertypeid && hiddenInputWithDataFromPhpHeader.dataset.getuserid) {
keyOrders = keyOrders + hiddenInputWithDataFromPhpHeader.dataset.getusertypeid + hiddenInputWithDataFromPhpHeader.dataset.getuserid;
}
*/
// console.log(localStorage);
// console.log(keyOrders);

let stockOrder = new Stock(keyOrders);
let globalDataOrders = stockOrder.getAll();
let ordersIdsJson = JSON.stringify(Object.keys(globalDataOrders));

// пишем функцию, которая проверяет, имеет ли переменная какое-либо значение или она является null, undefined или пустым значением:
function isValue(val){
    return (val !== undefined && val != null && val != '');
}

function checkInputedTelNum(inputId, telNumErrorMessageField) {
    // делаем скрипт для маски ввода номера телефона в форму:
    let inputTel = document.querySelector('#' + inputId + '');
    let telNumError = document.querySelector('#' + telNumErrorMessageField + '');
    inputTel.addEventListener("input", makePatternForTelNum, false);  // Параметр useCapture (не обязательный) в значении true показывает всплытие
    inputTel.addEventListener("focus", makePatternForTelNum, false);  // событий от внутреннего элемента до внешнего,
    inputTel.addEventListener("blur", makePatternForTelNum, false);   // при значении false - от внешнего до внутреннего элемента.
    inputTel.addEventListener("keydown", makePatternForTelNum, false) // При передаче параметра useCapture его имя опускается и записывает просто true или false.
    let keyCode;
    let telValue = ''; // именно это значение номера телефона будем передавать в БД (71234567890)
    
    function makePatternForTelNum(event) {
        telNumError.textContent = '';
        event.keyCode && (keyCode = event.keyCode);
        let pos = this.selectionStart;
        if (pos < 4) event.preventDefault();
        let matrix = "+7 (___) ___-__-__";
        let i = 0;
        let code = matrix.replace(/\D/g, "");
        telValue = this.value.replace(/\D/g, "");
        let new_value = matrix.replace(/[_\d]/g, function(a) {
            return i < telValue.length ? telValue.charAt(i++) || code.charAt(i) : a;
        });

        i = new_value.indexOf("_");
        
        if (i != -1) {
            i < 5 && (i = 4);
            new_value = new_value.slice(0, i); 
        }      

        let reg = matrix.substring(0, this.value.length + 1).replace(/_+/g,     // добавляем единичку, чтобы "захватить" дефис...
            function(a) {
                return "\\d{1," + a.length + "}"
            }).replace(/[+()]/g, "\\$&");
        
        reg = new RegExp("^" + reg + "$");
        
        if (!reg.test(this.value) || this.value.length < 10 || keyCode > 47 && keyCode < 58) this.value = new_value;
        
        if (event.type == "blur" && telValue.length < 11)  {
            telNumError.textContent = 'Неверно указан номер телефона! Повторите ввод.';
            this.value = matrix;
        } 
        
        if (telValue.length == 11) {
            this.classList.remove('invalid');
            this.classList.add('valid');
        }
    }
}

//делаем проверку правильности ввода текта в поля формы для имени и фамилии, дописали и проверку адреса в диве... :
function checkInputedFormFields(hiddenInputId = null) {
    
    //выбираем все инпуты, у которых есть дата-атрибут data-rule:
    let inputsWithDataRule = document.querySelectorAll('input[data-rule]');
    
    // выбираем не только инпуты с дата-атрибутом, но и дивы, и всё остальное:
    //let inputsWithDataRule = document.querySelectorAll('[data-rule]');
    
    // перебираем циклом полученные инпуты и навешиваем на каждый событие, по которому мы будем валидировать форму:
    for (let input of inputsWithDataRule) {
        input.addEventListener('blur', function() {
            let rule = this.dataset.rule;
            let value = this.value;
            let textContent = this.textContent ?? '';
            let check;
            let length, maxlength, checkLength, checkVocabulary;
            let errorText = '';
            this.classList.add('invalid');
            // берём текущего родителя элемента, а затем последний элемент - это и будет наш искомый span, в который мы будем записывать тект ошибки:
            let parent = this.parentElement;
            let span = parent.lastElementChild;
            
            switch (rule) {
                case 'namefieldtext':
                    length = value.length;
                    maxlength = +this.dataset.maxlength;
                    checkLength = length <= maxlength;
                    if(!checkLength) {
                        errorText = 'Длина текста не может превышать 30 символов!';
                    }
                    checkVocabulary = /^[а-яА-ЯёЁ\s'-]+$/.test(value);
                    if(!checkVocabulary) {
                        errorText = 'Пожалуйста, укажите данные на русском языке';
                        input.addEventListener('focus', clearField); 
                    }
                    check = checkLength && checkVocabulary;
                break;

                case 'nameorgfieldtext':
                    length = value.length;
                    maxlength = +this.dataset.maxlength;
                    checkLength = length <= maxlength;
                    if(!checkLength) {
                        errorText = 'Длина текста не может превышать 255 символов!';
                    }
                    checkVocabulary = /^[a-zA-Zа-яА-ЯёЁ\d\s.,"!:)(/№-]+$/.test(value);
                    if(!checkVocabulary) {
                        errorText = 'Проверьте написание на наличие спецсимволов';
                        input.addEventListener('focus', clearField); 
                    }
                    check = checkLength && checkVocabulary;
                break;

                case 'addressfieldtext':
                    // с помощью регуряки проверяем, что адрес написан на русском языке, может иметь цифры, пробелы, точки, дефис:
                    let checkAddress = /^[а-яА-ЯёЁ\d\s.,"!:)(/№-]*$/.test(textContent);
                    if(!checkAddress) {
                       errorText = 'Пишется на русском языке, может содержать цифры, пробелы и всё, что нужно для адреса!';
                       input.addEventListener('focus', clearField); 
                    } else {
                        // если введённый адрес проходит проверку, копируем его содержимое в скрытый инпут:
                        let hiddenInput = document.querySelector('#' + hiddenInputId + '');
                        if(hiddenInput) {
                            hiddenInput.value = this.textContent;
                        }
                    }
                    check = checkAddress;
                break;

                case 'orgaddressfieldtext':
                    // с помощью регуряки проверяем, что адрес написан на русском языке, может иметь цифры, пробелы, точки, дефис:
                    let checkOrgAddress = /^[а-яА-ЯёЁ\d\s.,"!:)(/№-]*$/.test(textContent);
                    if(!checkOrgAddress) {
                       errorText = 'Пишется на русском языке, может содержать цифры, пробелы и всё, что нужно для адреса!';
                       input.addEventListener('focus', clearField); 
                    } else {
                        // если введённый адрес проходит проверку, копируем его содержимое в скрытый инпут:
                        let hiddenInput = document.querySelector('#' + hiddenInputId + '');
                        if(hiddenInput) {
                            hiddenInput.value = this.textContent;
                        }
                    }
                    check = checkOrgAddress;
                break;

                case 'persaddressfieldtext':
                    console.log(textContent);
                    // с помощью регуряки проверяем, что адрес написан на русском языке, может иметь цифры, пробелы, точки, дефис:
                    let checkPersAddress = /^[а-яА-ЯёЁ\d\s.,"!:)(/№-]*$/.test(textContent);
                    if(!checkPersAddress) {
                       errorText = 'Пишется на русском языке, может содержать цифры, пробелы и всё, что нужно для адреса!';
                       input.addEventListener('focus', clearField); 
                    } else {
                        // если введённый адрес проходит проверку, копируем его содержимое в скрытый инпут:
                        let hiddenInput = document.querySelector('#' + hiddenInputId + '');
                        if(hiddenInput) {
                            hiddenInput.value = this.textContent;
                        }
                    }
                    check = checkPersAddress;
                break;

                case 'orgfieldinn':
                    let checkINNnum = /^[\d]{10,12}$/.test(Number(value));
                    if(!checkINNnum) {
                        errorText = 'ИНН может содержать только цифры, длина не более 12 знаков!';
                        this.value = '';
                    } 
                    check = checkINNnum;
                break;

                case 'orgfieldkpp':
                    let checkKPPnum = value === '' || /^\d{9}$/.test(value);
                    
                    console.log('checkKPPnum', checkKPPnum)
                    if(!checkKPPnum) {
                        errorText = 'КПП должен содержать ровно 9 цифр или быть пустым';
                        // this.value = '';
                    } 
                    check = checkKPPnum;
                break;

                case 'orgfieldbicbank':
                    let checkBicBank = /^[\d]{9,12}$/.test(Number(value));
                    if(!checkBicBank) {
                        errorText = 'Банковский идентификационный код состоит из 9 цифр';
                        this.value = '';
                    } 
                    check = checkBicBank;
                break;

                case 'orgfieldbankaccount':
                    let checkBankAccount = /^[\d]{20}$/.test(Number(value));
                    if(!checkBankAccount) {
                        errorText = 'Расчётный банковский счёт организации состоит из 20-ти цифр!';
                        this.value = '';
                    } 
                    check = checkBankAccount;
                break;
            }

            if(check) {
                this.classList.remove('invalid');
                this.classList.add('valid');
                span.textContent = '';
            } else {
                this.classList.remove('valid');
                span.textContent = errorText;
            }
        });
        
        // если введённые данные не прошли проверку, при повторном фокусе - неверные данные стираются, ввод придётся повторить с нуля:        
        function clearField() {
            this.textContent = ''; 
            this.value = '';
            input.removeEventListener('focus', clearField); 
        }
    }
}

//делаем проверку правильности ввода текта в поля формы для адреса в диве... :
function checkInputedAddressDiv(hiddenInputId) {
    
    //выбираем все дивы, у которых есть дата-атрибут data-rule:
    let divsWithDataRules = document.querySelectorAll('div[data-rules]');
       
    // перебираем циклом полученные дивы и навешиваем на каждый событие, по которому мы будем валидировать форму:
    for (let div of divsWithDataRules) {
        div.addEventListener('blur', function() {
            //console.log(this.textContent);
            let rule = this.dataset.rules;
            let textContent = this.textContent ?? '';
            let check;
            let length, maxlength, checkLength, checkVocabulary;
            let errorText = '';
            this.classList.add('invalid');
            // берём текущего родителя элемента, а затем последний элемент - это и будет наш искомый span, в который мы будем записывать тект ошибки:
            let parent = this.parentElement;
            let span = parent.lastElementChild;
            
            switch (rule) {
                case 'addressfieldtext':
                    // с помощью регуряки проверяем, что адрес написан на русском языке, может иметь цифры, пробелы, точки, дефис:
                    let checkAddress = /^[а-яА-ЯёЁ\d\s\.,"!:)(/№-]*$/g.test(textContent);
                    if(!checkAddress) {
                       errorText = 'Пишется на русском языке, может содержать цифры, пробелы и всё, что нужно для адреса!';
                       div.addEventListener('focus', clearField); 
                    } else {
                        // если введённый адрес проходит проверку, копируем его содержимое в скрытый инпут:
                        let hiddenInput = document.querySelector('#' + hiddenInputId + '');
                        if(hiddenInput) {
                            console.log(hiddenInput);
                            hiddenInput.value = this.textContent;
                        }
                    }
                    check = checkAddress;
                break;

                case 'orgaddressfieldtext':
                    // с помощью регуряки проверяем, что адрес написан на русском языке, может иметь цифры, пробелы, точки, дефис:
                    let checkOrgAddress = /^[а-яА-ЯёЁ\d\s\.,"!:)(/№-]*$/g.test(textContent);
                    if(!checkOrgAddress) {
                       errorText = 'Адрес организации пишется на русском языке, как указано в учредительных документах, может содержать цифры, пробелы и всё, что нужно для адреса!';
                       div.addEventListener('focus', clearField); 
                    } else {
                        // если введённый адрес проходит проверку, копируем его содержимое в скрытый инпут:
                        let hiddenInput = document.querySelector('#' + hiddenInputId + '');
                        if(hiddenInput) {
                            console.log(hiddenInput);
                            hiddenInput.value = this.textContent;
                        }
                    }
                    check = checkOrgAddress;
                break;
            }

            if(check) {
                this.classList.remove('invalid');
                this.classList.add('valid');
                span.textContent = '';
            } else {
                this.classList.remove('valid');
                span.textContent = errorText;
            }
        });
        
        // если введённые данные не прошли проверку, при повторном фокусе - неверные данные стираются, ввод придётся повторить с нуля:        
        function clearField() {
            this.textContent = ''; 
            this.value = '';
            //input.removeEventListener('focus', clearField); 
        }
    }
}

//делаем проверку правильности ввода текта в поля формы для адреса в диве... :
function checkInputedOrgAddressDiv(hiddenInputId) {
    let divsWithDataRules = document.querySelector('div[data-checkorgaddr]');
    divsWithDataRules.addEventListener('blur', function() {
        //console.log(this.textContent);
        let rule = this.dataset.checkorgaddr;
        let textContent = this.textContent ?? '';
        let check;
        let errorText = '';
        this.classList.add('invalid');
        // берём текущего родителя элемента, а затем последний элемент - это и будет наш искомый span, в который мы будем записывать тект ошибки:
        let parent = this.parentElement;
        let span = parent.lastElementChild;
            switch (rule) {
                case 'orgaddressfieldtext':
                    // с помощью регуряки проверяем, что адрес написан на русском языке, может иметь цифры, пробелы, точки, дефис:
                    let checkOrgAddress = /^[а-яА-ЯёЁ\d\s\.,"!:)(/№-]*$/g.test(textContent);
                    if(!checkOrgAddress) {
                       errorText = 'Адрес организации пишется на русском языке, как указано в учредительных документах, может содержать цифры, пробелы и всё, что нужно для адреса!';
                       divsWithDataRules.addEventListener('focus', clearField); 
                    } else {
                        // если введённый адрес проходит проверку, копируем его содержимое в скрытый инпут:
                        let hiddenInput = document.querySelector('#' + hiddenInputId + '');
                        if(hiddenInput) {
                            console.log(hiddenInput);
                            hiddenInput.value = this.textContent;
                        }
                    }
                    check = checkOrgAddress;
                break;
            }

            if(check) {
                this.classList.remove('invalid');
                this.classList.add('valid');
                span.textContent = '';
            } else {
                this.classList.remove('valid');
                span.textContent = errorText;
            }
    });
    // если введённые данные не прошли проверку, при повторном фокусе - неверные данные стираются, ввод придётся повторить с нуля:        
    function clearField() {
        this.textContent = ''; 
        this.value = '';
        divsWithDataRules.removeEventListener('focus', clearField); 
    }
}

//делаем проверку корректности ввода текста в поля формы дополнительной информации для договора в диве... :
function checkInputedContractAddInfosDiv(hiddenInputId) {
    let divWithDataRules = document.querySelector('div[data-checkcontractaddinfo]');
    divWithDataRules.addEventListener('blur', function() {
        //console.log(this.textContent);
        let rule = this.dataset.checkcontractaddinfo;
        let textContent = this.textContent ?? '';
        let check;
        let errorText = '';
        this.classList.add('invalid');
        // берём текущего родителя элемента, а затем последний элемент - это и будет наш искомый span, в который мы будем записывать тект ошибки:
        let parent = this.parentElement;
        let span = parent.lastElementChild;
            switch (rule) {
                case 'checkcontractaddinfo':
                    // с помощью регуряки проверяем, что адрес написан на русском языке, может иметь цифры, пробелы, точки, дефис:
                    let checkAddContractInfo = /^[а-яА-ЯёЁ\d\s\.,"!:)(/№-]*$/g.test(textContent);
                    if(!checkAddContractInfo) {
                       errorText = 'Дополнительная информация, необходимая для оформления договора, пишется на русском языке';
                       divWithDataRules.addEventListener('focus', clearField); 
                    } else {
                        // если введённый адрес проходит проверку, копируем его содержимое в скрытый инпут:
                        let hiddenInput = document.querySelector('#' + hiddenInputId + '');
                        if(hiddenInput) {
                            console.log(hiddenInput);
                            hiddenInput.value = this.textContent;
                        }
                    }
                    check = checkAddContractInfo;
                break;
            }

            if(check) {
                this.classList.remove('invalid');
                this.classList.add('valid');
                span.textContent = '';
            } else {
                this.classList.remove('valid');
                span.textContent = errorText;
            }
    });
    // если введённые данные не прошли проверку, при повторном фокусе - неверные данные стираются, ввод придётся повторить с нуля:        
    function clearField() {
        this.textContent = ''; 
        this.value = '';
        divsWithDataRules.removeEventListener('focus', clearField); 
    }
}

function makeTheWayFromButtonToLogoCounterBasket(event) {
    
    // Получаем координаты кнопки "В корзину"
    let buttonRect = event.target.getBoundingClientRect();
    let buttonX = buttonRect.left + buttonRect.width / 2;
    let buttonY = buttonRect.top + buttonRect.height / 2;

    // Получаем координаты иконки корзины
    let basketIcon = document.querySelector('.basket-logo__div img');
    let basketRect = basketIcon.getBoundingClientRect();
    let basketX = basketRect.left + basketRect.width / 2;
    let basketY = basketRect.top + basketRect.height / 2;

    // Создаем элемент "товар"
    let productFly = document.createElement('div');
    productFly.classList.add('product-fly');
    document.body.appendChild(productFly);

    // Устанавливаем начальные координаты
    productFly.style.left = `${buttonX}px`;
    productFly.style.top = `${buttonY}px`;

    // Вычисляем конечные координаты относительно начальных
    let endX = basketX - buttonX;
    let endY = basketY - buttonY;

    // Устанавливаем CSS переменные для анимации
    productFly.style.setProperty('--endX', `${endX}px`);
    productFly.style.setProperty('--endY', `${endY}px`);

    // Удаляем элемент после завершения анимации
    productFly.addEventListener('animationend', () => {
        productFly.remove();
    });
}