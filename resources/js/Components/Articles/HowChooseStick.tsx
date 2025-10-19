/* const HowChooseStick = () => {

    return (
        <>
            <h1>Клюшки подбираются по росту игрока.</h1>
            <p>
                Если поставить клюшку на пол вдоль туловища (габаритная
                высота), - макушка клюшки должна быть выше
                пупка не менее, чем на 5-6см, но не выше уровня груди - где-то посередине или выше (помним, что
                дети за лето вырастают на 3-4-5см).
            </p>

            <p>
                Общая габаритная высота (от пола до макушки, если поставить клюшку вдоль туловища)
                получается из длины рукоятки плюс 10см (получится общая длина клюшки) и плюс ещё примерно 6см
                (это закладывается на высоту крюка).
            </p>
            <p>
                Пример: клюшка с длиной рукоятки 96см (общая длина клюшки 106см, габаритная высота - примерно
                112м) - рекомендуется для игроков ростом (165) 170-180см.
            </p>
        </>
    );
}*/

const HowChooseStick = () => {
    return (
        <>
            <div className="section-header">
                <h1>Как правильно выбрать флорбольную клюшку</h1>
                <p className="lead-text">Простой гид по подбору клюшки по росту</p>
            </div>

            <div className="measurement-guide">
                <div className="guide-card">
                    <h3>📏 Быстрый способ проверки</h3>
                    <div className="check-method">
                        <div className="method-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <strong>Поставьте клюшку на пол вдоль туловища</strong>
                            </div>
                        </div>
                        <div className="method-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <strong>Проверьте высоту макушки клюшки:</strong>
                            </div>
                        </div>
                        <div className="height-range">
                            <div className="range-min">
                                <div className="marker">⬆️</div>
                                <span>Минимум: выше пупка на 5-6 см</span>
                            </div>
                            <div className="range-max">
                                <div className="marker">⬇️</div>
                                <span>Максимум: не выше уровня груди</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="growth-tip">
                <div className="tip-card">
                    <h3 className="margin-bottom24px">👦 Для растущих игроков</h3>
                    <p>Дети за лето могут вырасти на <strong>3-5 см</strong> - учитывайте это при выборе!</p>
                    <p>Лучше взять с небольшим запасом.</p>
                </div>
            </div>

            <div className="calculation-section">
                <div className="calculation-card">
                    <h3>🧮 Как рассчитывается длина клюшки</h3>
                    <div className="formula">
                        <div className="formula-step">
                            <span className="formula-part">Длина рукоятки</span>
                            <span className="formula-operator">+ 10 см</span>
                            <span className="formula-result">= Длина клюшки</span>
                        </div>
                        <div className="formula-step">
                            <span className="formula-part">Длина клюшки</span>
                            <span className="formula-operator">+ 6 см</span>
                            <span className="formula-result">= Габаритная высота</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="example-section">
                <div className="example-card">
                    <h3>📝 Пример из практики</h3>
                    <div className="example-details">
                        <div className="spec-item">
                            <strong>Длина рукоятки:</strong> 96 см
                        </div>
                        <div className="spec-item">
                            <strong>Общая длина клюшки:</strong> 106 см
                        </div>
                        <div className="spec-item">
                            <strong>Габаритная высота:</strong> ~112 см
                        </div>
                        <div className="recommendation">
                            <strong>✅ Рекомендуется для роста:</strong> 165-180 см
                        </div>
                    </div>
                </div>
            </div>

            <div className="expert-help">
                <div className="help-card highlight">
                    <h3>🎯 Нужна помощь с выбором?</h3>
                    <p>Не уверены в размере? Мы поможем!</p>
                    <div className="help-actions">
                        {/* <p>📞 Напишите нам в соцсетях</p> */}
                        <p>💬 Напишите нам в соцсетях</p>
                        <p>📏 Укажите рост и возраст игрока</p>
                        <p>🎯 Мы подберём идеальный вариант</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HowChooseStick;