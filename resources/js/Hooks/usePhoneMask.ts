// resources/js/Hooks/usePhoneMask.ts
import { useCallback, useState } from 'react';

export const usePhoneMask = () => {
    const [phoneValue, setPhoneValue] = useState('+7 (');
    const [rawPhone, setRawPhone] = useState('');
    const [isValid, setIsValid] = useState(false);

    const formatPhone = useCallback((input: string): string => {
        // логика маски
        let matrix = "+7 (___) ___-__-__";
        let i = 0;
        let code = matrix.replace(/\D/g, "");
        let telValue = input.replace(/\D/g, "");
        let new_value = matrix.replace(/[_\d]/g, function(a) {
            return i < telValue.length ? telValue.charAt(i++) || code.charAt(i) : a;
        });

        i = new_value.indexOf("_");
        if (i !== -1) {
            i < 5 && (i = 4);
            new_value = new_value.slice(0, i);
        }

        return new_value;
    }, []);

    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const formatted = formatPhone(input);
        
        setPhoneValue(formatted);
        
        const raw = input.replace(/\D/g, "");
        setRawPhone(raw);
        setIsValid(raw.length === 11);
    }, [formatPhone]);

    const handlePhoneKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const pos = e.currentTarget.selectionStart;
        if (pos !== null && pos < 4 && (e.key === 'Backspace' || e.key === 'Delete')) {
            e.preventDefault();
        }
    }, []);

    const handlePhoneBlur = useCallback(() => {
        if (rawPhone.length < 11) {
            setPhoneValue('+7 (');
            setIsValid(false);
        }
    }, [rawPhone]);

    // сбросить форму после успеха:
    const resetPhone = useCallback(() => {
        setPhoneValue('+7 (');
        setRawPhone('');
        setIsValid(false);
    }, []);

    return {
        phoneValue,
        rawPhone,
        isValid,
        handlePhoneChange,
        handlePhoneKeyDown,
        handlePhoneBlur,
        resetPhone
    };
};