// resources/js/Hooks/useGenerateId.ts
import { useCallback } from 'react';

export function useGenerateId(): () => string {
  return useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }, []);
}