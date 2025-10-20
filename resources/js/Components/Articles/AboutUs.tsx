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
                <h1>Мы - Пионеры российского флорбола</h1>
                <p className="lead-text">с 1993 года создаём его историю в России</p>
            </div>

            <div className="footer-about__timeline-section">
                <div className="footer-about__timeline-item">
                    <div className="footer-about__timeline-year">1993</div>
                    <div className="footer-about__timeline-content text-align-left">
                        <h3 className="margin-bottom8px">Первые шаги российского флорбола</h3>
                        <p>Создана первая в стране федерация флорбола</p>
                        <p>Завезли первую партию профессионального инвентаря в Россию</p>
                    </div>
                </div>

                <div className="footer-about__timeline-item">
                    <div className="footer-about__timeline-year">
                        <div>1994</div>
                        <div>2001</div>
                    </div>
                    <div className="footer-about__timeline-content text-align-left">
                        <h3 className="margin-bottom8px">Международные победы</h3>
                        <p>Команда "Вика"&nbsp;(г.&nbsp;Нижний Новгород) под руководством тренера Большакова&nbsp;А.Н. завоевывает мировое признание и трофеи, поднимается на пьедестал:</p>
                        <p>CZECH OPEN (Чехия)</p>
                        <p>GOTHIA INNEBANDY CUP (Швеция)</p>
                        <p>Разрабатываем и производим экипировку для чемпионов</p>
                    </div>
                </div>

                <div className="footer-about__timeline-item">
                    <div className="footer-about__timeline-year">
                        <div>1993</div>
                        <div>2022</div>
                    </div>
                    <div className="footer-about__timeline-content text-align-left">
                        <h3 className="margin-bottom8px">Международное сотрудничество Renew Group Sweden AB</h3>
                        <p>Официальный дистрибьютор в России и странах СНГ</p>
                        <p>торговых марок UNIHOC и ZONEFLOORBALL.</p>
                    </div>
                </div>

                <div className="footer-about__timeline-item">
                    <div className="footer-about__timeline-year">2025</div>
                    <div className="footer-about__timeline-content text-align-left">
                        <h3>АЛЕТЕРС&nbsp;<sup className="tm-tooltip" data-tooltip="Зарегистрированная торговая марка">&reg;</sup> — российский прорыв</h3>
                        <p>Запускаем первый отечественный бренд профессиональной флорбольной экипировки мирового уровня</p>
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
                    <h3 className="margin-bottom8px">ИП Большаков Сергей Николаевич</h3>
                    <p>ИНН 526200100909</p>
                    <p>📍 г. Нижний Новгород</p>
                </div>
            </div>
        </>

    );
}

export default AboutUs;