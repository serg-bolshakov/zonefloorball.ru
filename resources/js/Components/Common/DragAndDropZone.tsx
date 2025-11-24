// resources/js/Components/Common/DragAndDropZone.tsx
import React from 'react';

interface DragAndDropZoneProps {
    isDragging: boolean;
    dragError: string | null;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onClick: () => void;
    acceptedTypes?: string[];
    maxFiles?: number;
    maxSize?: number;
}

const DragAndDropZone: React.FC<DragAndDropZoneProps> = ({
    isDragging,
    dragError,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onClick,
    acceptedTypes = ['image/*', 'video/*'],
    maxFiles = 5,
    maxSize = 50
}) => {
    const getAcceptedTypesText = () => {
        const types = acceptedTypes.map(type => {
            if (type === 'image/*') return 'изображения';
            if (type === 'video/*') return 'видео';
            return type;
        });
        return types.join(', ');
    };

    return (
        <div className="drag-drop-container">
            <div
                className={`drag-drop-zone ${isDragging ? 'drag-drop-zone--active' : ''} ${dragError ? 'drag-drop-zone--error' : ''}`}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={onClick}
            >
                <div className="drag-drop-content">
                    <div className="drag-drop-icon">
                    {/* <div className="upload-icon"> */}
                        {isDragging ? '📂' : dragError ? '❌' : '📁'}
                    </div>
                    
                    <div className="drag-drop-text">
                        <h3 className="drag-drop-title">
                            {dragError ? 'Ошибка загрузки' : 
                             isDragging ? 'Отпустите файлы здесь' : 
                             'Перетащите файлы сюда'}
                        </h3>
                        
                        <p className="drag-drop-subtitle">
                            {dragError ? (
                                <span className="error-message">{dragError}</span>
                            ) : (
                                `или нажмите для выбора файлов`
                            )}
                        </p>

                        <div className="drag-drop-hints">
                            <span className="hint-item">📷 От вас: {getAcceptedTypesText()}</span>
                            <span className="hint-item">⚡ Максимум: {maxFiles} файлов</span>
                            <span className="hint-item">💾 Размер: до {maxSize}MB каждый</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Сообщение об ошибке */}
            {dragError && (
                <div className="drag-drop-error">
                    <div className="error-icon">⚠️</div>
                    <div className="error-text">{dragError}</div>
                </div>
            )}
        </div>
    );
};

export default DragAndDropZone;