// resources/js/Components/Admin/ProductAdditionForms/ProductTypes/Sticks/NewStickFormStep4.tsx

import React, { useState, useCallback, useRef } from "react";
import { IImage, IImageUploadData } from "@/Types/image";
import { IProduct } from "@/Types/types";

// Типы для невалидированной формы (все поля optional)
export type TNewStickFormStep4 = {
    /* поля шага 4 */ 
};

// Типы для валидированных форм ... с правильными типами полей
export type TValidatedNewStickStep4 = {
  /* все поля шага 4 */ 
};

interface Step4FormProps {
    errors: Record<string, string>;
    productId: number;
    similarProduct?: IProduct;
    onComplete: (images: IImage[]) => void;
    onCancel: () => void;
    isLoading: boolean;
    onUpload: (files: File[], mainIndex: number, showcaseIndex: number, promoIndices: number[], orientations: Record<number, number>) => void;
}

const NewStickFormStep4: React.FC<Step4FormProps> = ({
    errors,
    productId,
    similarProduct,
    onComplete,
    onCancel,
    isLoading,
    onUpload
}) => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mainImageIndex, setMainImageIndex] = useState<number>(-1);
    const [showcaseImageIndex, setShowcaseImageIndex] = useState<number>(-1);       // Только один для витрины
    const [promoImages, setPromoImages] = useState<number[]>([]);
    const [orientations, setOrientations] = useState<Record<number, number>>({});

    // Обработчик выбора файлов через input
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;                                           // Получаем файлы из input
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            setUploadedFiles(prev => [...prev, ...newFiles]);                       // Добавляем к существующим
        }
    };

    // разрешаем drop
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();     // Обязательно! Браузер по умолчанию запрещает drop
        event.stopPropagation();    // Останавливаем всплытие события
    };

    // обработчик отпускания файлов
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        
        const files = event.dataTransfer.files;                                     // Файлы из события drag and drop
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            setUploadedFiles(prev => [...prev, ...newFiles]);
        }
    };

    // клик по зоне = клик по input
    const handleClickArea = () => {
        fileInputRef.current?.click();                                              // Программно кликаем по скрытому input
    };

    // Обработчик загрузки
    const handleUpload = () => {
        if (uploadedFiles.length === 0) return;
        
        onUpload(
            uploadedFiles,
            mainImageIndex,
            showcaseImageIndex,
            promoImages,
            orientations
        );
    };

    // Удаление файла из списка
    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
        
        // Сбрасываем selections если удаляем выбранные файлы
        if (mainImageIndex === index) setMainImageIndex(-1);
        if (showcaseImageIndex === index) setShowcaseImageIndex(-1);
        setPromoImages(prev => prev.filter(i => i !== index));
        
        const newOrientations = { ...orientations };
        delete newOrientations[index];
        setOrientations(newOrientations);
    };

    return (
        <div className="productAddition">
            <div className="productAddition-form__input-item">
                <div className="productAddition-form__title">
                    <p>выберем и загрузим изображения товара, чтобы клиент получил исчерпывающую информацию...</p>
                </div>
            </div>
            
            {/* Зона drag and drop */}
            <div 
                className="dropzone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClickArea}
                style={{
                    border: '2px dashed #ccc',
                    padding: '40px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    margin: '20px 0'
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <p>📁 Перетащите изображения сюда</p>
                <p>или</p>
                <p>🖱️ Кликните для выбора файлов</p>
            </div>

            {/* Список загруженных файлов */}
            {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                    <h4 className="margin-tb12px color-red">Файлы изображений, выбранные для загрузки и дальнейшего использования  ({uploadedFiles.length}):</h4>
                    {uploadedFiles.map((file, index) => (
                        <div key={index} className="file-item" style={{
                        border: '1px solid #ddd',
                        padding: '10px',
                        margin: '10px 0',
                        borderRadius: '4px'
                        }}>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <img 
                                    src={URL.createObjectURL(file)} 
                                    alt={file.name} 
                                    width="60" 
                                    height="60"
                                    style={{ objectFit: 'cover' }}
                                />
                                
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>{file.name}</p>
                                    <p style={{ margin: 0, color: '#666' }}>
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>

                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                    style={{ 
                                        background: '#ff4757', 
                                        color: 'white', 
                                        border: 'none', 
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                {/* Главное изображение - radio button */}
                                <label>
                                    <input
                                        type="radio"
                                        name="mainImage"
                                        checked={mainImageIndex === index}
                                        onChange={() => setMainImageIndex(index)}
                                    />
                                    Главное изображение
                                </label>

                                {/* Для витрины - radio button (только один) */}
                                <label>
                                    <input
                                        type="radio"
                                        name="showcaseImage"
                                        checked={showcaseImageIndex === index}
                                        onChange={() => setShowcaseImageIndex(index)}
                                    />
                                    Для витрины
                                </label>

                                {/* Промо-изображения - checkbox (можно несколько) */}
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={promoImages.includes(index)}
                                        onChange={() => setPromoImages(prev => 
                                        prev.includes(index) 
                                            ? prev.filter(i => i !== index)
                                            : [...prev, index]
                                        )}
                                    />
                                    Промо-изображение
                                </label>

                                <select
                                    value={orientations[index] || ''}
                                    onChange={(e) => setOrientations(prev => ({
                                        ...prev,
                                        [index]: parseInt(e.target.value)
                                    }))}
                                    style={{ padding: '5px', borderRadius: '4px' }}
                                >
                                    <option value="">Ориентация</option>
                                    <option value="1">Портретная</option>
                                    <option value="2">Альбомная</option>
                                    <option value="3">Квадратная</option>
                                    <option value="4">Промо</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Кнопки действий */}
            <div className="form-actions margin-top24px">
                <button 
                    onClick={handleUpload} 
                    disabled={isLoading || uploadedFiles.length === 0}
                    className="productAddition-form__submit-btn"
                >
                    {isLoading ? 'Загрузка...' : 'Загрузить изображения'}
                </button>
                <button 
                    onClick={onCancel} 
                    className="productAddition-form__submit-btn margin-left12px"
                >
                Отмена
                </button>
            </div>
        </div>
    );

};

export default NewStickFormStep4;