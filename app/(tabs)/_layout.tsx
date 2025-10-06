import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppContext } from '@/contexts/AppContext';

export default function TabLayout() {
  const theme = useTheme();
  const { currentUser } = useAppContext();
  const isAdmin = currentUser?.role === "admin";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar since we use custom navbar
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'الكتب',
          tabBarIcon: ({ color }) => <IconSymbol name="book.closed" color={color} />,
        }}
      />
      {!isAdmin && (
        <>
          <Tabs.Screen 
            name="browse" 
            options={{
              title: 'تصفح',
              tabBarIcon: ({ color }) => <IconSymbol name="magnifyingglass" color={color} />,
            }}
          />
          <Tabs.Screen 
            name="history" 
            options={{
              title: 'السجل',
              tabBarIcon: ({ color }) => <IconSymbol name="clock" color={color} />,
            }}
          />
          <Tabs.Screen 
            name="qrcode" 
            options={{
              title: 'QR كود',
              tabBarIcon: ({ color }) => <IconSymbol name="qrcode" color={color} />,
            }}
          />
        </>
      )}
      <Tabs.Screen 
        name="categories" 
        options={{
          title: 'الفئات',
          tabBarIcon: ({ color }) => <IconSymbol name="folder" color={color} />,
        }}
      />
      <Tabs.Screen 
        name="users" 
        options={{
          title: 'المستخدمون',
          tabBarIcon: ({ color }) => <IconSymbol name="person.2" color={color} />,
        }}
      />
      <Tabs.Screen 
        name="settings" 
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ color }) => <IconSymbol name="gear" color={color} />,
        }}
      />
      <Tabs.Screen 
        name="explore" 
        options={{
          title: 'استكشاف',
          tabBarIcon: ({ color }) => <IconSymbol name="safari" color={color} />,
        }}
      />
    </Tabs>
  );
}
