// resources/js/Components/Footer/CustomersCares.tsx

import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { usePhoneMask } from '@/Hooks/usePhoneMask';
import { toast } from 'react-toastify';
import axios from 'axios';

const CustomersCares: React.FC = () => {

    const [showCallbackForm, setShowCallbackForm] = useState(false);
    const [helpType, setHelpType] = useState('');
    const currentYear = new Date().getFullYear();   
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const {
        phoneValue,
        rawPhone,
        isValid,
        handlePhoneChange,
        handlePhoneKeyDown,
        handlePhoneBlur,
        resetPhone
    } = usePhoneMask();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isValid  || isSubmitting) {
            return;
        }
        
        setIsSubmitting(true); // ← блокируем

        console.log('Отправляем номер:', rawPhone);
        try {
            const response = await axios.post('/callback-request', {
                phone: phoneValue, // или phoneValue в зависимости от формата - rawPhone - это цифры без маски
                help_type: helpType
            });

            // axios автоматически бросает ошибку при 4xx/5xx, так что этот if не нужен
            /*if (!response.data.success) {
                throw new Error(response.data.message || 'Ошибка при запросе обратного звонка');
            }*/

            toast.success(response.data.message || 'Спасибо! Мы перезвоним вам в течение ближайшего времени!');
            setShowCallbackForm(false);
            resetPhone();       // ← сброс телефона
            setHelpType('');    // ← сброс выбора
                
        } catch (error: any) {
            const errorMessage = error.response?.data?.message 
                || error.message 
                || 'Ошибка при отправке запроса';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false); // ← разблокируем в любом случае
        }
    };

    return (
        <>
            <div className="contacts-social">
                <p className='help-text'>Мы на связи: </p>
                
                <div>
                    <a href="mailto:unihoczonerussia@gmail.com"><img src="/storage/icons/gmail-logo-colored.jpg" alt="gmail-logo" title="Отправить письмо по электронной почте" /></a>
                    <a href="https://t.me/unihoczonerussia/"
                        ><img src="/storage/icons/telegram-logo-colored.png" alt="telegram-logo" title="Написать в Telegram" />
                    </a>
                    <a href="https://vk.com/unihoczonerussia" target="_blank" rel="noopener noreferrer"><img src="/storage/icons/vk-logo-colored.png" alt="vk-logo" title="Написать ВКонтакте" /></a>
                    <a href="whatsapp://send?phone=79534156010"><img src="/storage/icons/whatsapp-logo-colored.png" alt="whatsApp-logo" title="Написать в Whatsapp" /></a>
                    
                    <a href="tel:+79107955555" title="Позвонить директору" aria-label="Позвонить директору"><img src="/storage/icons/telefon-logo.png" alt="telefon-logo" title="Позвонить директору" /></a>
                </div>
            </div>

            {/* Блок персональной помощи */}
            <div id="support-block" className="personal-help">
                <h3>Не уверены как оформить заказ?</h3>
                <p>Мы лично поможем вам разобраться!</p>
                <div className="help-features">
                    <div>✅ Перезвоним в ближайшее время</div>
                    <div>✅ Проведем через весь процесс</div>
                    <div>✅ Поможем оформить заказ (предзаказ)</div>
                </div>
                
                {!showCallbackForm ? (
                    <button 
                        className="callback-btn"
                        onClick={() => setShowCallbackForm(true)}
                    >
                        Заказать звонок поддержки
                    </button>
                ) : (
                    <form className="callback-form" onSubmit={handleSubmit}>
                        <div className="phone-input-wrapper">
                            <input
                                type="tel"
                                placeholder="+7 (999) 123-45-67"
                                value={phoneValue}
                                onChange={handlePhoneChange}
                                onKeyDown={handlePhoneKeyDown}
                                onBlur={handlePhoneBlur}
                                className={`phone-input ${!isValid && phoneValue !== '+7 (' ? 'error' : ''}`}
                            />
                            {!isValid && phoneValue !== '+7 (' && (
                                <div className="phone-error">Неверно указан номер телефона!</div>
                            )}
                        </div>
                        
                        <select 
                            value={helpType}
                            onChange={(e) => setHelpType(e.target.value)}
                            className="help-type-select"
                        >
                            <option value="" disabled>Выберите тему обращения</option>
                            <option className='text-align-left' value="ordering">- Помощь с оформлением заказа</option>
                            <option className='text-align-left' value="consultation">- Консультация по товару</option>
                            <option className='text-align-left' value="technical">- Техническая поддержка приложения</option>
                            <option className='text-align-left' value="other">- Другой вопрос</option>
                        </select>
                        
                        <div className="callback-form-buttons">
                            <button 
                                type="submit" 
                                disabled={!isValid || isSubmitting}
                                className={isSubmitting ? 'submitting' : ''}
                            >
                                {isSubmitting ? '⏳ ... Отправляем...' : 'Жду звонка! ... 📞' }
                            </button>
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={() => setShowCallbackForm(false)}
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="footer-auth__div">
                <p className="margin-top12px text-align-left margin-bottom12px">
                    Добро пожаловать!
                </p>
                <p className="margin-top12px margin-bottom12px"><a href="https://floorball.nnov.ru/htdocs/shop/">Нижегородская федерация флорбола</a>&nbsp;<br />
                наш предыдущий <a href="https://floorball.nnov.ru/market/floorball-sticks">Интернет-магазин&nbsp;</a></p>
                
                <p className="">Сделано&nbsp;<a href="mailto:serg.bolshakov@gmail.com">Большаковым&nbsp;Сергеем</a>, 2025</p>
                {/* <p>Демоверсия 0.0.5 <a href="https://github.com/serg-bolshakov/zonefloorball.ru" target="_blank" rel="noopener noreferrer"><span className="header-icon">Посмотреть</span></a> исходный код.</p> */}
                {/* <p className="margin-bottom12px">Буду рад сотрудничеству&nbsp;(<a href="/storage/docs/resume.pdf"  target="_blank" rel="noopener noreferrer"><span className="cursive header-icon">resume.pdf</span></a><span className="cursive">, 68 Кб</span>). <span className='strong'>Интернет-магазин "под ключ". Администрирование</span>.</p> */}
            </div>
        </>
    );
};

export default CustomersCares;