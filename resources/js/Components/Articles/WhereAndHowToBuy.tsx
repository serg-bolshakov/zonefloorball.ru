const WhereAndHowToBuy = () => {

    /* return (
        <>
            <h1 className="fs18">Где и как купить:</h1>
            <ul>
                <li>
                    <p className="fs14"><strong>Для всех наших дорогих покупателей, желающих купить товар дешевле:</strong></p>  
                    <p><i>есть возможность приобрести товар по цене "на заказ" - обычно она ниже других цен...</i></p>
                    <p><i>Если это вам выгодно и интересно, пожалуйста, свяжитесь с администратором магазина в соцсетях, указав регион доставки и ссылку на интересующую позицию - мы предложим вам лучшую цену и условия доставки.</i></p>
                    
                </li>
                <li className="margin-top24px">
                    <p className="fs14"><strong>Для покупателей из любого региона России:</strong></p>  
                    <p><strong>а</strong>)&nbsp;купить в интернет-магазине с доставкой почтой по РФ (стоимость доставки рассчитывается при оформлении заказа)</p>
                    <strong>б</strong>)&nbsp;при желании можете выбрать иной способ доставки, пожалуйста, заранее согласуйте варианты с администратором магазина в чате социальной сети. 
                </li>
                <li className="margin-top24px">
                    <p className="fs14"><strong>Для покупателей из Нижнего Новгорода:</strong></p>  
                    <p>купить в интернет-магазине с доставкой либо почтой (стоимость доставки рассчитывается при оформлении заказа), либо транспортом продавца (курьерская доставка по городу).</p>
                    <p>Возможно получение заказа на складе продавца.</p>
                    <p><i>Склад работает по воскресеньям, с 13:00 до 14:00 (база малого и среднего бизнеса (р-он Нагорного дворца спорта))</i>.</p>
                </li>
            </ul>
        </>
    );*/

    return (
        <>
            <h1 className="fs18">Где и как купить:</h1>
            
            <div className="purchase-option">
                <h3 className="fs14px accent-text">🎯 Лучшая цена "на заказ"</h3>
                <p>Хотите купить дешевле? Мы предлагаем специальные цены для заказчиков!</p>
                <div className="instruction">
                    <strong>Как получить:</strong>
                    <ul>
                        <li>Напишите администратору в соцсетях</li>
                        <li>Укажите ваш регион доставки</li>
                        <li>Отправьте ссылку на интересующий товар</li>
                    </ul>
                    <div className="contacts-social">
                        <a href="mailto:unihoczonerussia@gmail.com"><img src="/storage/icons/gmail-logo-colored.jpg" alt="gmail-logo" title="Отправить письмо по электронной почте" /></a>
                        <a href="https://vk.com/unihoczonerussia" target="_blank" rel="noopener noreferrer"><img src="/storage/icons/vk-logo-colored.png" alt="vk-logo" title="Написать ВКонтакте" /></a>
                        <a href="whatsapp://send?phone=79534156010"><img src="/storage/icons/whatsapp-logo-colored.png" alt="whatsApp-logo" title="Написать в Whatsapp" /></a>
                        <a href="https://t.me/unihoczonerussia/"
                            ><img src="/storage/icons/telegram-logo-colored.png" alt="telegram-logo" title="Написать в Telegram" />
                        </a>
                    </div>
                    <p>Мы предложим вам лучшую цену и условия доставки!</p>
                </div>
            </div>

            <div className="purchase-option">
                <h3 className="fs14px accent-text">🚚 Доставка по всей России</h3>
                <div className="options">
                    <div className="option">
                        <strong>Вариант А:</strong> Купить в интернет-магазине с доставкой почтой РФ
                        <br/><em>(стоимость рассчитывается при оформлении)</em>
                    </div>
                    <div className="option">
                        <strong>Вариант Б:</strong> Нужен другой способ доставки?
                        <br/>Согласуйте варианты с администратором в чате до оформления попуки.
                    </div>
                </div>
            </div>

            <div className="purchase-option">
                <h3 className="fs14px accent-text">🏠 Для жителей Нижнего Новгорода</h3>
                <ul>
                    <li>Доставка почтой или курьером по городу</li>
                    <li className=" margin-top24px">Самовывоз со склада:</li>
                </ul>
                <div className="pickup-info">
                    <p><strong>Адрес:</strong> ул. Бекетова, 3А</p>
                    <p><strong>Район:</strong> Нагорный дворец спорта</p>
                    <p><strong>Территория:</strong> "База малого и среднего бизнеса"</p>
                    <p><strong>Время:</strong> воскресенье, 13:00-14:00</p>
                </div>
                <div className="instruction">
                    <strong>Другое время? Где на территории?</strong>
                    <ul>
                        <li>Напишите администратору в соцсетях</li>
                    </ul>
                    <div className="contacts-social">
                        <a href="mailto:unihoczonerussia@gmail.com"><img src="/storage/icons/gmail-logo-colored.jpg" alt="gmail-logo" title="Отправить письмо по электронной почте" /></a>
                        <a href="https://vk.com/unihoczonerussia" target="_blank" rel="noopener noreferrer"><img src="/storage/icons/vk-logo-colored.png" alt="vk-logo" title="Написать ВКонтакте" /></a>
                        <a href="whatsapp://send?phone=79534156010"><img src="/storage/icons/whatsapp-logo-colored.png" alt="whatsApp-logo" title="Написать в Whatsapp" /></a>
                        <a href="https://t.me/unihoczonerussia/"
                            ><img src="/storage/icons/telegram-logo-colored.png" alt="telegram-logo" title="Написать в Telegram" />
                        </a>
                    </div>
                    <p>Мы вместе выберем удобное время и подробно расскажем как нас найти на территории базы!</p>
                </div>
                
            </div>

        </>
    );
}

export default WhereAndHowToBuy;