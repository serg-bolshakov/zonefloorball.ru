// resources/js/Providers.tsx - компонент-обертка
import { ReactNode } from 'react';
import { AppProvider } from '@/Contexts/AppProvider';                     // Общие данные приложения (user, categories)
import { UserDataProvider } from './Contexts/UserData/UserDataProvider';  // Данные пользователя (корзина/избранное)  
import { ModalProvider } from '@/Contexts/ModalProvider';                 // UI-состояния (модалки)  

export const AllProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AppProvider>             
      <UserDataProvider>        
        <ModalProvider>       
          {children}
        </ModalProvider>
      </UserDataProvider>
    </AppProvider>
  );
};
