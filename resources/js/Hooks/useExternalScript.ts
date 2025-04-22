// resources/js/Hooks/useExternalScript.ts
// Хук useExternalScript - динамически создаёт <script> тег и добавляет его в <body>

import { useEffect } from 'react';
import { useState } from 'react';

type ScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

export const useExternalScript = (src: string): ScriptStatus => {
    const [status, setStatus] = useState<ScriptStatus>('idle');

    useEffect(() => {

    if (!src) {
        setStatus('error');
        return;
    }

    setStatus('loading');
    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    const handleLoad = () => setStatus('ready');
    const handleError = () => setStatus('error');

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    
    document.body.appendChild(script);

    return () => {
        script.removeEventListener('load', handleLoad);
        script.removeEventListener('error', handleError);
        if (script.parentNode) {
          document.body.removeChild(script);
        }
      };
    }, [src]);
    
    return status;
};