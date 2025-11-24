// resources/js/Hooks/useDragAndDrop.ts
import { useState, useCallback, useRef } from 'react';

interface UseDragAndDropProps {
    onFilesSelect: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number; // in bytes
    acceptedTypes?: string[];
}

export const useDragAndDrop = ({
    onFilesSelect,
    maxFiles = 5,
    maxSize = 50 * 1024 * 1024, // 50MB
    acceptedTypes = ['image/*', 'video/*']
}: UseDragAndDropProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragError, setDragError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Валидация файлов
    const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
        const validFiles: File[] = [];
        const errors: string[] = [];

        files.forEach(file => {
            // Проверка типа файла
            const isAcceptedType = acceptedTypes.some(type => {
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.replace('/*', ''));
                }
                return file.type === type;
            });

            if (!isAcceptedType) {
                errors.push(`❌ ${file.name}: Допустимы только изображения и видео`);
                return;
            }

            // Проверка размера
            if (file.size > maxSize) {
                errors.push(`❌ ${file.name}: Файл слишком большой (максимум ${maxSize / 1024 / 1024}MB)`);
                return;
            }

            // Проверка количества
            if (validFiles.length >= maxFiles) {
                errors.push(`❌ Можно загрузить не более ${maxFiles} файлов`);
                return;
            }

            validFiles.push(file);
        });

        return { valid: validFiles, errors };
    }, [acceptedTypes, maxSize, maxFiles]);

    // Обработчик выбора файлов через input
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const { valid, errors } = validateFiles(files);

        if (errors.length > 0) {
            alert(errors.join('\n'));
        }

        if (valid.length > 0) {
            onFilesSelect(valid);
        }

        // Сбрасываем input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [validateFiles, onFilesSelect]);

    // Обработчики Drag & Drop
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragError(null);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const { valid, errors } = validateFiles(files);

        if (errors.length > 0) {
            setDragError(errors.join('\n'));
            setTimeout(() => setDragError(null), 5000); // Автоочистка ошибки
        }

        if (valid.length > 0) {
            onFilesSelect(valid);
        }
    }, [validateFiles, onFilesSelect]);

    // Открытие диалога выбора файлов
    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return {
        isDragging,
        dragError,
        fileInputRef,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handleFileInputChange,
        openFileDialog,
    };
};