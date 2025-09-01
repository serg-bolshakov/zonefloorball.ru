// recources/js/Hooks/useStickProperties.ts

// Хук useStickProperties управляет состоянием и API-запросами

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IProduct } from '@/Types/types';

interface ISerie {
    id: number;
    prop_value: string;
    prop_value_view: string;
}

interface IGrip {
    id: number;
    prop_value: string;
    prop_value_view: string;
}

interface IProfile {
    id: number;
    prop_value: string;
    prop_value_view: string;
}

interface IBladeModel {
    id: number;
    prop_value: string;
    prop_value_view: string;
}

export interface IPropertiesProps {
    product     : IProduct      ;
    title       : string        ;
    series      : ISerie[]      ;
    grips       : IGrip[]       ;
    profiles    : IProfile[]    ;
    bladeModels : IBladeModel[] ;
}

const useStickProperties = () => {
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [properties, setProperties] = useState<IPropertiesProps | null>(null);
    
    // useCallback для стабильной ссылки
    const fetchProperties = useCallback(async (productId: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get(`/api/stick-properties/${productId}`);
            console.log('fetchProperties data', data);
            setProperties(data);
            return data;
        } catch (err) {
            const message = 'Ошибка при загрузке свойств';
            setError(message);
            toast.error(message);
            throw err; // Пробрасываем ошибку
        } finally {
            setLoading(false);
        }
    }, []); // Пустые зависимости - функция не меняется;

    const addGrip = async (payload: { name: string; brandId?: number }) => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/stick-properties/grip', payload);
            toast.success('Тип обмотки успешно добавлен');
            // await fetchProperties(); // Обновляем список
            return data;
        } catch (err) {
            toast.error('Ошибка при добавлении типа обмотки');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Аналогичные функции для addProfile и addBlade...

    const saveStep2 = async (payload: any) => {
        try {
            setLoading(true);
            // await axios.post(`/api/stick-properties/save-step2/${productId}`, payload);
            toast.success('Данные успешно сохранены');
        } catch (err) {
            toast.error('Ошибка при сохранении данных');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /*useEffect(() => {
        fetchProperties();
    }, [productId]);*/

    return {
        loading,
        error,
        properties,
        addGrip,
        // addProfile,
        // addBlade,
        fetchProperties,
        saveStep2,
        refetch: fetchProperties
    };
};

export default useStickProperties;