const AboutUs = () => {

    return (
        /*<>
            <h1>Более 30-ти лет на рынке...</h1>
            <p>Флорбол представлен нами в России с момента зарождения этой игры у нас в стране в 1993-м году. </p>
                
            <p>Тогда мы привезли первую партию флорбольных клюшек. 
                Возможно, кто-то ещё помнит наши первые, произведённые нами самими, флорбольные клюшки и мячи под маркой "Вика". 
                "Вика" - это женская команда из Нижнего Новгорода, побеждавшая на крупнейших мировых форумах в Швеции и Чехии с 1994 по 2001 годы.
            </p>

            <p>
                Сейчас мы можем сказать, что мы <strong>знаем всё о флорболе и экипировке</strong>! Ну или... почти всё... 
            </p>

            <p>
                Сегодня Алетерс (ALETERS) - первый флорбольный бренд в России, рождённый в 2025-м. Создаём со знанием дела, 
                производим высококачественную и профессиональную экипировку для игроков всех возрастов и квалификации.</p>
                
            <p>Это, пожалуй, лучшее, что есть в настоящий момент в нашей стране ... да и в мире тоже... :)</p>
            
            <p>
                ИП Большаков Сергей Николаевич, ИНН 526200100909<br />
                г. Нижний Новгород
            </p>
        </>*/

        <>
            <div className="about-header">
                <h1>Более 30 лет на рынке флорбола</h1>
                <p className="lead-text">С 1993 года развиваем флорбол в России</p>
            </div>

            <div className="footer-about__timeline-section">
                <div className="footer-about__timeline-item">
                    <div className="footer-about__timeline-year">1993</div>
                    <div className="footer-about__timeline-content text-align-left">
                        <h3 className="margin-bottom8px">Начало пути</h3>
                        <p>Основана первая в стране федерация флорбола</p>
                        <p>Привезли первую партию флорбольных клюшек в Россию</p>
                    </div>
                </div>

                <div className="footer-about__timeline-item">
                    <div className="footer-about__timeline-year">1994&nbsp;-&nbsp;2001</div>
                    <div className="footer-about__timeline-content text-align-left">
                        <h3 className="margin-bottom8px">Легендарная "Вика" (тренер Большаков&nbsp;А.Н.)</h3>
                        <p>Производили клюшки и мячи под маркой "Вика" для женской команды из Нижнего Новгорода, 
                        побеждавшей на мировых форумах в Швеции и Чехии</p>
                    </div>
                </div>

                <div className="footer-about__timeline-item">
                    <div className="footer-about__timeline-year">2025</div>
                    <div className="footer-about__timeline-content text-align-left">
                        <h3>Новая эра - АЛЕТЕРС&nbsp;<sup className="tm-tooltip" data-tooltip="Зарегистрированная торговая марка">&reg;</sup></h3>
                        <p>Первый российский флорбольный бренд, создающий профессиональную экипировку</p>
                    </div>
                </div>
            </div>

            <div className="expertise-section">
                <div className="expertise-card">
                    <h3 className="margin-bottom8px">🎯 Наша экспертиза</h3>
                    <p><strong>Знаем всё о флорболе и экипировке</strong> - 30 лет практического опыта</p>
                </div>

                <div className="expertise-card">
                    <h3 className="margin-bottom8px">⭐ Качество</h3>
                    <p>Высококачественная профессиональная экипировка для игроков всех возрастов и уровня подготовки</p>
                </div>

                <div className="expertise-card">
                    <h3 className="margin-bottom8px">🏆 Лидерство</h3>
                    <p>Лучшее, что есть в России... да и в мире тоже :)</p>
                </div>
            </div>

            <div className="foundation-section">
                <div className="foundation-card">
                    <h3 className="margin-bottom8px">Основатель (один из них)...</h3>
                    <p>ИП Большаков Сергей Николаевич</p>
                    <p>ИНН 526200100909</p>
                    <p>📍 г. Нижний Новгород</p>
                </div>
            </div>
        </>

    );
}

export default AboutUs;