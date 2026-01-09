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
            title: "Нереальные условия игры",
            description: "Имитация жёстких ударов по клюшке",
            duration: "76", // секунды
            poster: "/storage/video/posters/crash-test-air-concept-28-composite-monstr-26.webp",
            file_path: "/storage/video/crash-test-air-concept-28-composite-monstr-26.MOV",
            comment: "Сравниваем композитные и карбоновые клюшки",
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
            title: "Жёсткий ответ на жёсткую игру!",
            description: "Тест на бетоне пройден.",
            duration: "19", // секунды
            poster: "/storage/video/posters/epic-hard-test-on-concrete-floor.webp",
            file_path: "/storage/video/epic-hard-test-on-concrete-floor.mov",
            comment: "Встречаем жёсткий Эпик Алетерс!",
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
            description: "Тест на излом в условиях улицы",
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
            duration: "59", // секунды
            tested_at: "2025-12-26", // Формат YYYY-MM-DD
            poster: "/storage/video/posters/crash-test-air-light-27-black-breaking-point.webp",
            file_path: "/storage/video/crash-test-air-light-27-black-breaking-point.mov",
            comment: "Если вы не планируете использовать клюшку как кувалду по металлу несколько раз подряд — она прослужит вам очень долго. Этот тест — для нашего спокойствия и вашей уверенности.",
            product_link: '/products/card/91633-klyushka-dlya-florbola-aleters-epic-hard-air-light-glossy-27mm-black-96cm-left',
            product_name: 'Эпик Hard AIR LIGHT GLOSSY 27 black',
            product_id: '91633'
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