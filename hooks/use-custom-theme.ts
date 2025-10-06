import { useAppContext } from '@/contexts/AppContext';

/**
 * Custom hook to access the application theme
 * This hook provides access to our custom theme implementation
 * which includes colors, typography, spacing, and other design tokens
 */
export const useCustomTheme = () => {
  const { theme } = useAppContext();
  return theme;
};