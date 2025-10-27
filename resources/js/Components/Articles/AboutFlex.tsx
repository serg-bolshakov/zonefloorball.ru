const AboutFlex = () => {

    return (
        <>
            {/* <!-- Про жёсткость (флекс) --> */}
            {/* <h1>Индекс жёсткости рукоятки</h1>
            <p>
                показывает на сколько миллиметров прогибается рукоятка под действием силы в 300Н 
                (примерно как груз массой 30кг), приложенной к середине рукоятки, которая находится на двух опорах, 
                расстояние между которыми 60см.
            </p>

            <p>
                Чем выше индекс жёсткости - тем мягче рукоятка, меньше требуется сил, 
                чтобы согнуть её. У самой мягкой рукоятки индекс жёсткости - 36мм, у самой жёсткой - 23мм.
            </p>

            <p>
                Идеально когда жёсткость рукоятки сочетается с силой рук и уровнем мастерства игрока - в этом случае достигается максимальный 
                эффект для выполнения броска или удара по мячу.
            </p> */}
            <div className="section-header">
                <h1>Индекс жёсткости рукоятки</h1>
                <p className="lead-text">Находим идеальное сочетание гибкости и контроля</p>
            </div>

            <div className="measurement-explanation">
                <div className="explanation-card">
                    <h3>📏 Как измеряется жёсткость?</h3>
                    <div className="test-setup">
                        <div className="test-item">
                            <strong>Сила:</strong> 300Н (≈30 кг)
                        </div>
                        <div className="test-item">
                            <strong>Опора:</strong> 60 см между точками
                        </div>
                        <div className="test-item">
                            <strong>Замер:</strong> прогиб в миллиметрах
                        </div>
                    </div>
                    <p className="note">Чем выше индекс - тем больше прогиб и мягче рукоятка</p>
                </div>
            </div>

            <div className="flex-scale">
                <div className="scale-card">
                    <h3>🎚️ Шкала жёсткости</h3>
                    <div className="scale-range">
                        <div className="scale-item soft">
                            <div className="flex-value">36 мм</div>
                            <div className="flex-label">Самая мягкая</div>
                            <div className="flex-desc">Легче сгибается, меньше усилий</div>
                        </div>
                        <div className="scale-gradient">← Мягче ─── Жёстче →</div>
                        <div className="scale-item stiff">
                            <div className="flex-value">23 мм</div>
                            <div className="flex-label">Самая жёсткая</div>
                            <div className="flex-desc">Меньше прогиб, больше контроля</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="expert-tip">
                <div className="tip-card highlight">
                    <h3>🎯 Профессиональный совет</h3>
                    <p><strong>Идеальная жёсткость = Сила рук + Уровень мастерства</strong></p>
                    <p>Правильно подобранная жёсткость даёт максимальную эффективность для:</p>
                    <ul>
                        <li>✅ Мощных бросков</li>
                        <li>✅ Точных ударов</li>
                        <li>✅ Полного контроля над клюшкой</li>
                    </ul>
                </div>
            </div>
      <div className="section-header">
                <h1>Индекс жёсткости рукоятки</h1>
                <p className="lead-text">Находим идеальное сочетание гибкости и контроля</p>
            </div>

            <div className="measurement-explanation">
                <div className="explanation-card">
                    <h3>📏 Как измеряется жёсткость?</h3>
                    <div className="test-setup">
                        <div className="test-item">
                            <strong>Сила:</strong> 300Н (≈30 кг)
                        </div>
                        <div className="test-item">
                            <strong>Опора:</strong> 60 см между точками
                        </div>
                        <div className="test-item">
                            <strong>Замер:</strong> прогиб в миллиметрах
                        </div>
                    </div>
                    <p className="note">Чем выше индекс - тем больше прогиб и мягче рукоятка</p>
                </div>
            </div>

            <div className="flex-scale">
                <div className="scale-card">
                    <h3>🎚️ Шкала жёсткости</h3>
                    <div className="scale-range">
                        <div className="scale-item soft">
                            <div className="flex-value">36 мм</div>
                            <div className="flex-label">Самая мягкая</div>
                            <div className="flex-desc">Легче сгибается, меньше усилий</div>
                        </div>
                        <div className="scale-gradient">← Мягче ─── Жёстче →</div>
                        <div className="scale-item stiff">
                            <div className="flex-value">23 мм</div>
                            <div className="flex-label">Самая жёсткая</div>
                            <div className="flex-desc">Меньше прогиб, больше контроля</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="expert-tip">
                <div className="tip-card highlight">
                    <h3>🎯 Профессиональный совет</h3>
                    <p><strong>Идеальная жёсткость = Сила рук + Уровень мастерства</strong></p>
                    <p>Правильно подобранная жёсткость даёт максимальную эффективность для:</p>
                    <ul>
                        <li>✅ Мощных бросков</li>
                        <li>✅ Точных ударов</li>
                        <li>✅ Полного контроля над клюшкой</li>
                    </ul>
                </div>
            </div>
        </>
    );
}

export default AboutFlex;