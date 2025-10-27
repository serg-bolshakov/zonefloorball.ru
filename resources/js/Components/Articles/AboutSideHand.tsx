const AboutSideHand = () => {

    return (
        <>
            {/* <!-- Как правильно определить хват --> */}
            {/* <p>
                Большинство играет на левую сторону (левый хват) - левая рука внизу 
                (если нормально держать клюшку в обеих руках, клюшка опущена на пол), крюк с левой стороны.
            </p>

            <p>
                И наоборот: правый хват - правая рука внизу, крюк с правой стороны.
            </p> */}
            <div className="section-header">
                <h1>Как определить свой хват</h1>
                <p className="lead-text">Находим вашу естественную сторону игры</p>
            </div>

            <div className="grip-comparison">
                <div className="grip-card">
                    <div className="grip-header">
                        <h3>👈 Левый хват</h3>
                        <div className="popular-badge nobr">≈ 80% игроков</div>
                    </div>
                    <div className="grip-details">
                        <div className="hand-position">
                            <strong>Руки:</strong> Левая рука внизу
                        </div>
                        <div className="blade-position">
                            <strong>Крюк:</strong> С левой стороны
                        </div>
                        <p className="grip-note">Играет большинство игроков</p>
                    </div>
                </div>

                <div className="grip-card">
                    <div className="grip-header">
                        <h3>👉 Правый хват</h3>
                    </div>
                    <div className="grip-details">
                        <div className="hand-position">
                            <strong>Руки:</strong> Правая рука внизу
                        </div>
                        <div className="blade-position">
                            <strong>Крюк:</strong> С правой стороны
                        </div>
                        <p className="grip-note">Обратное расположение</p>
                    </div>
                </div>
            </div>

            <div className="grip-test">
                <div className="test-card">
                    <h3>🎯 Быстрый тест</h3>
                    <div className="test-steps">
                        <div className="test-step">
                            <span className="step-number">1</span>
                            <span>Возьмите клюшку обеими руками</span>
                        </div>
                        <div className="test-step">
                            <span className="step-number">2</span>
                            <span>Опустите крюк на пол</span>
                        </div>
                        <div className="test-step">
                            <span className="step-number">3</span>
                            <span>Посмотрите какая рука оказалась внизу</span>
                        </div>
                    </div>
                    <p className="test-result">✅ Это и есть ваш естественный хват!</p>
                </div>
            </div>
        </>
    );
}

export default AboutSideHand;