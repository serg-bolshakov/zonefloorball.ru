// resources/js/Providers.tsx - компонент-обертка
import { ReactNode } from 'react';
import { ModalProvider } from '@/Contexts/ModalProvider';       // передает новое состояние через контекст
import { AppProvider } from '@/Contexts/AppProvider';

export const AllProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AppProvider>
      <ModalProvider>   
        {children}
      </ModalProvider>
    </AppProvider>
  );
};
