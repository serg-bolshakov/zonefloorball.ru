// resources/js/Hooks/useUserData.ts
import { useContext } from "react";
import { UserDataContext } from '@/Contexts/UserData/UserDataContext';

export const useUserDataContext = () => {
    const context = useContext(UserDataContext);
    if (!context) throw new Error('useUserData must be used within UserDataProvider');
    return context;
};