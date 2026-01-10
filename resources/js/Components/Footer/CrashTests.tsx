// resources/js/Components/Footer/CrashTests.tsx
import React from 'react';
import useModal from '../../Hooks/useModal';
import CrashTestsModal from '../Articles/CrashTestsModal';
import { Link } from '@inertiajs/react';

const CrashTests: React.FC = () => {
    const { openModal } = useModal();

    // Данные о видео краш-тестов
    const crashTestVideos = [
        {
            title: "Боевое крещение: новая AIR LIGHT 27 MATTE против композита",
            description: "Две школы прочности: премиальный карбон vs упругий композит. Имитация жёстких ударов по клюшке",
            duration: "51 сек", // секунды
            tested_at: "2025-12-26", // Формат YYYY-MM-DD
            poster: "/storage/video/posters/crash-test-air-concept-28-composite-air-light-27-matte.webp",
            file_path: "/storage/video/crash-test-air-concept-28-composite-air-light-27-matte.mp4",
            comment: "Первые испытания нашей новейшей матовой карбоновой серии. Сравниваем, как передовая карбоновая технология противостоит жёстким ударам в сравнении с традиционным композитом.",
            product_links: [
                {
                    url: '/products/card/91843-klyushka-dlya-florbola-aleters-epic-hard-air-light-matte-27mm-black-104cm-left',
                    name: 'AIR LIGHT 27 MATTE black',
                    label: 'Новейший матовый карбон'
                },
                {
                    url: '/products/card/71701-klyushka-dlya-florbola-aleters-original-air-concept-28mm-black-100cm-left',
                    name: 'AIR CONCEPT F28',
                    label: 'Проверенный композит'
                }
            ]
        },
        {
            title: "Нереальные условия игры",
            description: "Противостояние двух философий: прочность карбона MONSTR против упругого контроля композитной AIR CONCEPT. Кто как ведёт себя под ударом?",
            duration: "76", // секунды
            poster: "/storage/video/posters/crash-test-air-concept-28-composite-monstr-26.webp",
            file_path: "/storage/video/crash-test-air-concept-28-composite-monstr-26.MOV",
            comment: "Разные задачи — разный материал. Сравниваем не «что лучше», а «как каждое свойство проявляется в экстриме».",
            product_links: [
                {
                    url: '/products/card/71721-klyushka-dlya-florbola-aleters-original-monstr-edition-26mm-black-100cm-left',
                    name: 'MONSTR EDITION F26',
                    label: 'Профессиональная карбоновая рукоятка'
                },
                {
                    url: '/products/card/71701-klyushka-dlya-florbola-aleters-original-air-concept-28mm-black-100cm-left',
                    name: 'AIR CONCEPT F28',
                    label: 'Композитная рукоятка для контроля'
                }
            ]
        },
        {
            title: "Испытание на бетоне: жёсткий ответ жёсткой игре",
            description: "Что будет, если играть на бетонном полу? Мы проверили. Смотрим, как крюк серии Epic Hard выдерживает прямой контакт с асфальтом.",
            duration: "19", // секунды
            poster: "/storage/video/posters/epic-hard-test-on-concrete-floor.webp",
            file_path: "/storage/video/epic-hard-test-on-concrete-floor.mov",
            comment: "Встречаем жёсткий Эпик Алетерс — даже бетон не стал для него проблемой.",
        },
        {
            title: "Клюшка vs стальной каркас: выдержит ли удар об металл?",
            description: "Тест на экстремальную точечную нагрузку: имитируем удар клюшки в месте соединения с крюком (самое уязвимое место) о металлическую стойку во время игры. Результат показывает высокую устойчивость материала к деформации (одномоментная ударная сверхнагрузка на точку поверхности)",
            duration: "34", // секунды
            poster: "/storage/video/posters/crash-test-epic-hard-air-concept-28.webp",
            file_path: "/storage/video/crash-test-epic-hard-air-concept-28.mp4",
            comment:  "Мы не были настолько уверены, что клюшка выдержит, что приготовили инструмент для уборки. Клюшка и крюк выстояли! Наши ожидания не оправдались, и это — лучший результат.",
            product_link: '/products/card/71605-klyushka-dlya-florbola-aleters-epic-hard-air-concept-28mm-black-96cm-left',
            product_name: 'Эпик Hard AIR CONCEPT 28',
            product_id: '71705'
        },
        {
            title: "Клюшкой об столб...",
            description: "Спонтанный тест: что будет, если со всей силы ударить клюшкой о металлический столб?",
            duration: "09", // секунды
            poster: "/storage/video/posters/25-08-31_MONSTR-24_crash-test-1.webp",
            file_path: "/storage/video/25-08-31_MONSTR-24_crash-test-1.MOV",
            comment:  "Клюшка с рукояткой из премиального карбона",
            product_link: '/products/card/91722-klyushka-dlya-florbola-aleters-original-monstr-edition-24mm-black-100cm-right',
            product_name: 'MONSTR EDITION F24',
            product_id: '91722'
        },
        {
            title: "Честно о прочности клюшки: да, мы её сломали... и вот как мы это сделали...",
            description: "Многие спрашивают, ломаются ли клюшки. Вместо долгих объяснений показываем: что будет, если бить клюшкой по стали с максимальной силой раз за разом. Смотрим, где реальный предел прочности.",
            duration: "59 сек", // секунды
            tested_at: "2025-12-26", // Формат YYYY-MM-DD
            poster: "/storage/video/posters/crash-test-air-light-27-black-breaking-point.webp",
            file_path: "/storage/video/crash-test-air-light-27-black-breaking-point.mov",
            comment: "Если вы не планируете использовать клюшку как кувалду по металлу несколько раз подряд — она прослужит вам очень долго. Этот тест — для нашего спокойствия и вашей уверенности. **Реальный запас прочности многократно превышает нагрузки игры.**",
            product_link: '/products/card/91633-klyushka-dlya-florbola-aleters-epic-hard-air-light-glossy-27mm-black-96cm-left',
            product_name: 'Эпик Hard AIR LIGHT GLOSSY 27 black',
            product_id: '91633'
        },
        {
            title: "Сравнение на прочность: есть ли абсолютный чемпион?",
            description: "Мы сравнили две разные карбоновые структуры в одинаковых экстремальных условиях. Одна сломалась, другая — нет. Это не делает одну клюшку 'прочнее' в целом, а показывает, как по-разному материалы реагируют на специфический тип нагрузки. В игре такие нагрузки — редкость.",
            duration: "93", // секунды
            poster: "/storage/video/posters/crash-test-monster24-vs-airlight23.webp",
            file_path: "/storage/video/crash-test-monster24-vs-airlight23.mov",
            comment: "Предсказать, какая клюшка окажется 'прочнее' в абстрактном смысле — невозможно, это зависит от типа и точки приложения удара. Но можно гарантировать, что запас прочности у обеих — на годы игры при соблюдении правил. Так играть и бить по клюшкам соперника — нельзя!",
            product_links: [
                {
                    url: '/products/card/91721-klyushka-dlya-florbola-aleters-original-monstr-edition-24mm-black-100cm-left',
                    name: 'MONSTR EDITION F24 black',
                    label: 'Профессиональная рукоятка из премиального карбона'
                },
                {
                    url: '/products/card/71731-klyushka-dlya-florbola-aleters-original-air-light-23mm-black-100cm-left',
                    name: 'AIR LIGHT F23 black',
                    label: 'Профессиональная рукоятка из облегчённого карбона повышенной прочности с графитовым модулем'
                }
            ]
        },
    ];

    return (
        <>
            {/* <div className="crash-tests-block">
                <h3 className="crash-tests-title">
                    <span className="shield-icon">🛡️</span>
                    Качество подтвержаем испытаниями
                </h3>
                
                <p className="crash-tests-description">
                    Посмотрите, как мы тестируем нашу продукцию в экстремальных условиях
                </p>
                
                <button 
                    className="crash-tests-button"
                    onClick={() => openModal(<CrashTestsModal videos={crashTestVideos} />)}
                >
                    Смотреть краш-тесты
                    <span className="button-arrow">→</span>
                </button>
                
                <div className="crash-stats">
                    <div className="stat-item">
                        <span className="stat-number">100+</span>
                        <span className="stat-label">тестов проведено</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">контроль качества</span>
                    </div>
                </div>
            </div> */}

            {/* <div className="crash-tests-promo">
                <div className="promo-header">
                    <span className="promo-icon">🧪</span>
                    <div className="promo-title-group">
                        <h3 className="promo-title">ПРОЗРАЧНОСТЬ И КАЧЕСТВО</h3>
                        <p className="promo-subtitle">Наши тесты говорят сами за себя</p>
                    </div>
                </div>
                
                <p className="promo-description">
                    Мы не скрываем, как и при каких условиях ломаются клюшки. 
                    Смотрите реальные испытания нашей продукции.
                </p>
                
                <button 
                    className="promo-button"
                    onClick={() => openModal(<CrashTestsModal videos={crashTestVideos} />)}
                >
                    <span className="button-text">Смотреть видео-испытания</span>
                    <span className="button-arrow">→</span>
                </button>
                
                <div className="promo-stats">
                    <div className="stat">
                        <span className="stat-value">200%</span>
                        <span className="stat-label">прочнее стандарта</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat">
                        <span className="stat-value">1000+</span>
                        <span className="stat-label">часов тестов</span>
                    </div>
                </div>
            </div> */}

            <div className="crash-tests-promo">
                <div className="promo-header-crash">
                    <div className="promo-icon-crash">
                        <span className="icon-test">🧪</span>
                        <span className="icon-shield">🛡️</span>
                    </div>
                    <div className="promo-title-crash">
                        <h3>Краш-тесты</h3>
                        <p>Тестируем нашу продукцию в экстремальных условиях</p>
                    </div>
                </div>
            
                <div className="promo-description-crash">
                    <p>
                        Мы играем на бетоне, бьем по клюшкам и создаем нагрузки, 
                        в 5 раз превышающие игровые. Убедитесь в качестве сами.
                    </p>
                    <ul className="promo-features">
                        <li>✅ Тесты на прочность</li>
                        <li>✅ Сравнение с конкурентами</li>
                        <li>✅ Нереальные условия эксплуатации</li>
                    </ul>
                </div>
            
                <button 
                    className="promo-button-crash"
                    onClick={() => openModal(<CrashTestsModal videos={crashTestVideos} />)}
                >
                    <span className="button-text-crash">
                        <span className="play-icon">▶</span>
                        Смотреть испытания
                    </span>
                    <span className="button-count">{crashTestVideos.length} видео</span>
                </button>
                
                <div className="promo-footer-crash">
                    <span className="promo-note">
                        📹 Все видео сняты нашей командой тестирования
                    </span>
                </div>

                <div className="promo-stats">
                    <div className="stat">
                        <span className="stat-value">200%</span>
                        <span className="stat-label">прочнее стандарта</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat">
                        <span className="stat-value">1000+</span>
                        <span className="stat-label">часов тестов</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CrashTests;