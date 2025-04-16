// resources/js/Components/ProductCard/ProductGallerytion.tsx
import React, { useState, useEffect, useCallback, useRef} from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { AnimatePresence, motion, stagger } from 'framer-motion';
import { IProductCardResponse } from '@/Types/prodcard';
import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';

interface IProductGallery {
    promoImgs: IProductCardResponse['prodInfo']['productPromoImages']; 
    category : IProductCardResponse['prodInfo']['category']['category'];
    model    : IProductCardResponse['prodInfo']['model'];
    marka    : IProductCardResponse['prodInfo']['marka'];
}

const ProductGallery: React.FC<IProductGallery> = ({ promoImgs, category, model, marka }) => {
    const toastConfig = {
        position: "top-right" as const,
        autoClose: 3000, 
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Bounce, // Используем Slide, Zoom, Flip, Bounce для этого тоста
    }
    
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    // Навигация по стрелкам:
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const modalRef = useRef<HTMLDivElement>(null);

    // Получаем массив изображений с безопасным доступом
    const images = Object.values(promoImgs).filter(img => img?.img_link);

    // Обработчик ESC и клика вне изображения
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if(!selectedImage) return;
        
        if(e.key === 'Escape') {
            setSelectedImage(null);
            return;
        };

        if(images.length <= 1) return; // Не нужно навигации для одного изображения

        if (e.key === 'ArrowRight') {
            const nextIndex = (currentIndex + 1) % images.length;
            const nextImage = images[nextIndex]?.img_link;
            if (nextImage) {
              setCurrentIndex(nextIndex);
              setSelectedImage(nextImage);
            }
        };

        if (e.key === 'ArrowLeft') {
            const prevIndex = (currentIndex - 1 + images.length) % images.length;
            const prevImage = images[prevIndex]?.img_link;
            if (prevImage) {
              setCurrentIndex(prevIndex);
              setSelectedImage(prevImage);
            }
        };
    }, [selectedImage, currentIndex, images]);

    // Проверяем, была ли подсказка уже показана
    const shouldShowHint = () => {
        return localStorage.getItem('imgGalleryHintShown') !== 'true';
    };

    const showNavigationHint = useCallback(() => {
        if (!shouldShowHint() || images.length <= 1) return;
      
        toast.info(
          <div>
            <p>Для удобства навигации можно использовать:</p>
            <ul className="list-disc pl-5 mt-1">
              <li className='mt-1'>Стрелки ← → на клавиатуре</li>
              <li className='mt-1'>Кнопки по бокам экрана</li>
              <li className='mt-1'>ESC для закрытия</li>
            </ul>
          </div>,
          {
            autoClose: 10000,
            closeButton: true,
            icon: () => 'ℹ️',    // Функция, возвращающая JSX/строку
            toastId: 'galleryHint',
            onClose: () => localStorage.setItem('imgGalleryHintShown', 'true')
          }
        );
      }, [images.length]);

    // Подсказка для пользователя
    useEffect(() => {
        if (selectedImage && images.length > 1 && showNavigationHint()) {
        const timer = setTimeout(() => {
            toast.success('Подсказка: используйте стрелки ← → для навигации', {
                ...toastConfig,
                toastId: 'galleryHint' // Уникальный ID для предотвращения дублирования
            });
            localStorage.setItem('imgGalleryHintShown', 'true');
        }, 2000);
        return () => clearTimeout(timer);
        }
    }, [selectedImage, images.length]);

    
    // Сброс настроек для тестирования (по двойному клику...):
    const resetHintSettings = () => {
        localStorage.removeItem('imgGalleryHintShown');
        toast.success('Настройки подсказок сброшены. Подсказка появится снова.');
    };

    

    const handleOutsideClick = (e: React.MouseEvent) => {
        if(modalRef.current && !modalRef.current.contains(e.target as Node)) {
            setSelectedImage(null);
        }
    };

    useEffect (() => {
        if(selectedImage) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedImage, handleKeyDown]);

    const altText = [category, model, marka]
        .filter(item => Boolean(item) && item !== "NoName")
        .join(' ');

    return (
        <>
            <section className="cardProduct-imgPromo">  
                { Object.values(promoImgs).map((img, index) => (
                <motion.div
                    key={`${img.img_link}-${index}`}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 100 }}
                >
                    <LazyLoadImage
                    src={`/storage/${img.img_link}`}
                    alt={`${altText} (${index + 1}/${Object.keys(promoImgs).length})`}
                    className="cursor-pointer"
                    onClick={() => img.img_link && setSelectedImage(img.img_link)}
                    effect="opacity"
                    threshold={500}
                    />
                </motion.div>
                
                ))}
            </section>

            <AnimatePresence mode="wait">
                {selectedImage && (
                    <motion.div
                        key={selectedImage} // Важно для анимации!
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="prodcard-img_block"
                        onClick={handleOutsideClick}
                        transition={{ type: 'spring', stiffness: 400, damping: 100 }}
                    >
                        <motion.div
                            ref={modalRef}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="modal-img"
                            >
                            <button
                                className="modal-close-gallery"
                                onClick={() => setSelectedImage(null)}
                                aria-label="Закрыть просмотр изображения"
                                tabIndex={0}    // это для улучшения доступности...
                            >
                                &times;
                            </button>
                            <motion.div
                                key={selectedImage} // Важно для анимации!
                                initial={{ opacity: 0, x: 50 }} // Начальное состояние (смещено вправо)
                                animate={{ opacity: 1, x: 0 }}  // Анимация появления
                                exit={{ opacity: 0, x: -50 }}   // Анимация исчезновения
                                transition={{ duration: 1.5 }}
                                className="max-h-90vh"
                            >
                                <LazyLoadImage
                                    src={`/storage/${selectedImage}`}
                                    alt={`Увеличенное изображение: ${altText}`}
                                    className="max-h-90vh"
                                    effect="opacity"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Добавляем визуальные кнопки навигации */}
                        {images.length > 1 && (
                            <>
                                <button
                                className="promo-img-button promo-img-button__left"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const prevIndex = (currentIndex - 1 + images.length) % images.length;
                                    const prevImage = images[prevIndex]?.img_link;
                                    if (prevImage) {
                                    setCurrentIndex(prevIndex);
                                    setSelectedImage(prevImage);
                                    }
                                }}
                                aria-label="Предыдущее изображение"
                                >
                                ←
                                </button>
                                
                                <button
                                // className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
                                className="promo-img-button promo-img-button__right"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const nextIndex = (currentIndex + 1) % images.length;
                                    const nextImage = images[nextIndex]?.img_link;
                                    if (nextImage) {
                                    setCurrentIndex(nextIndex);
                                    setSelectedImage(nextImage);
                                    }
                                }}
                                aria-label="Следующее изображение"
                                >
                                →
                                </button>

                                {/* Индикатор текущего изображения */}
                                {/* <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2"> */}
                                <div className="promo-img-current">
                                {images.map((_, idx) => (
                                    <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        currentIndex === idx ? 'bg-white w-4' : 'bg-gray-500'
                                    }`}
                                    />
                                ))}
                                </div>
                            </>
                        )}
       
                    </motion.div> 
                )}
            </AnimatePresence>
        </>
    );
};

export default ProductGallery;