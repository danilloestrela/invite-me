'use client'

import { useEffect, useState } from 'react';

import { authenticate } from '@/lib/api/mutations';
import { toast } from './use-toast';

const authService = {
  isAuthenticated: false,
  login(callback: () => void) {
    authService.isAuthenticated = true;
    setTimeout(callback, 100); // simulate async
  },
};

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on mount
    setIsAuthenticated(authService.isAuthenticated);
  }, []);

  const login = async ({ username, password, callback }: { username: string, password: string, callback?: () => void}) => {
    try {
      await authenticate({ username, password });
      setIsAuthenticated(true);
      callback?.();
    } catch (error) {
      const errorMessage = (error as { message?: string }).message ?? 'Erro ao autenticar';
      toast({
        title: 'Erro ao autenticar',
        description: errorMessage,
      });
    }
  };

  const securePassword = (password: string) => {
    // Basic validation to ensure the password meets certain criteria
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValid = hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
    return isValid;
  };

  return {
    isAuthenticated,
    login,
    securePassword,
  };
}
