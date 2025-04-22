// resources/js/Hooks/useExternalScript.ts
// Хук useExternalScript - динамически создаёт <script> тег и добавляет его в <body>

import { useEffect } from 'react';

export const useExternalScript = (src: string) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [src]);
};