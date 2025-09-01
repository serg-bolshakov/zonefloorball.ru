// Context/ProductCreating/StickFormContext.tsx

import { createContext, useContext } from 'react';
import { TNewStickFormState } from '@/Components/Admin/ProductAdditionForms/reducers/stickFormReducer';

export const StickFormContext = createContext<{
    dispatch: React.Dispatch<any>;
    state: TNewStickFormState;
} | null>(null);

export const useStickForm = () => {
    const context = useContext(StickFormContext);
    if (!context) {
        throw new Error('useStickForm must be used within StickFormProvider');
    }
    return context;
};