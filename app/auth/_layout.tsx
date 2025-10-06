import { Stack } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';

export default function AuthLayout() {
  const { theme } = useAppContext();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'تسجيل الدخول',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'إنشاء حساب جديد',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
