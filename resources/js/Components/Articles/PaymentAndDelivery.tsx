/*const PaymentAndDelivery = () => {

    return (
        <>
            <p><strong>Оплата</strong>:&nbsp;  
                мы принимаем оплату банковскими картами, другими безналичными денежными средствами (ЭДС) от физических лиц в рамках действующего 
                законодательства. Оплата покупок и передача фискальных чеков будет осуществляется через онлайн-кассу Robokassa.
            </p>

            <p><strong>Доставка</strong>:&nbsp; 
                мы отгружаем только полностью оплаченные заказы. По умолчанию доставка осуществляется Почтой России с отслеживанием 
                статуса доставки на сайте компании-перевозчика по номеру отправления. Обычно мы отправляем заказы в течение 1-2-х дней 
                с момента поступления оплаты на наш расчётный счёт.
            </p>

            <p><strong>«Самовывоз»</strong> из Нижнего Новгорода осуществляется со склада, расположенного по адресу: ул. Бекетова, 3 
            - район Нагорного дворца спорта, на территории "Базы малого и среднего бизнеса" по воскресеньям с 13:00 до 14:00.
            </p>

            <p><i>Информация об оплате заказов, статусы отправлений, дополнительная информация</i> будет приходить Вам по электронной почте
                с адреса: <p className='margin-top8px'>no-reply@zonefloorball.ru (ZoneFloorball.RU)</p> Если Вы не видите сообщений - пожалуйста, проверьте папку "Спам" своего почтового аккаунта.
            </p>
        </>
    );
}

export default PaymentAndDelivery;*/

const PaymentAndDelivery = () => {
    return (
        <>
            <div className="section-header">
                <h1>Оплата и доставка</h1>
                <p className="lead-text">Удобные способы оплаты и быстрая доставка по всей России</p>
            </div>

            <div className="payment-section">
                <h2>💳 Способы оплаты</h2>
                <div className="payment-methods">
                    <div className="method-card">
                        <div className="method-icon">🏦</div>
                        <div className="method-content">
                            <h3>Банковские карты</h3>
                            <p>Visa, MasterCard, МИР</p>
                        </div>
                    </div>
                    <div className="method-card">
                        <div className="method-icon">📱</div>
                        <div className="method-content">
                            <h3>Быстрая оплата / Pay-методы</h3>
                            <p>СБП, SberPay, Mir&nbsp;Pay, T-Pay, ...</p>
                            <p>Другие безналичные средства в рамках законодательства</p>
                        </div>
                    </div>
                </div>
                <div className="payment-info">
                    <p><strong>Обработка платежей:</strong> через онлайн-кассу Robokassa с передачей фискальных чеков</p>
                </div>
            </div>

            <div className="delivery-section">
                <h2>🚚 Доставка по России</h2>
                <div className="delivery-options">
                    <div className="delivery-card">
                        <h3>📮 Почта России</h3>
                        <ul>
                            <li>Отслеживание статуса на сайте перевозчика</li>
                            <li>Отправка в течение <strong>1-2 дней</strong> после оплаты</li>
                            <li>Только полностью оплаченные заказы</li>
                        </ul>
                    </div>
                    
                    <div className="delivery-card highlight">
                        <h3>🏠 Самовывоз в Нижнем Новгороде</h3>
                        <div className="pickup-info">
                            <p><strong>Адрес:</strong> ул. Бекетова, 3</p>
                            <p><strong>Район:</strong> Нагорный дворец спорта</p>
                            <p><strong>Территория:</strong> "База малого и среднего бизнеса"</p>
                            <p><strong>Время:</strong> воскресенье, 13:00-14:00</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="notification-section">
                <div className="notification-card">
                    <h3>📧 Уведомления</h3>
                    <p>Вся информация об оплате и статусах отправлений приходит на email:</p>
                    <div className="email-contact">
                        <strong>no-reply@zonefloorball.ru</strong><br />
                        <span className="email-note">(ZoneFloorball.RU)</span>
                    </div>
                    <p className="warning-text">⚠️ Если не видите писем - проверьте папку "Спам"</p>
                </div>
            </div>
        </>
    );
}

export default PaymentAndDelivery;