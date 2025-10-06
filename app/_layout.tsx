import { IconSymbol } from '@/components/ui/icon-symbol';
import { Navbar, AppBar } from '@/components/ui/navbar';
import { Sidebar } from '@/components/ui/sidebar';
import { useFonts } from 'expo-font';
import { Slot, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useAppContext } from '@/contexts/AppContext';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

// Authentication wrapper component
function AuthWrapper() {
  const { currentUser, isLoading, theme, isDarkMode } = useAppContext();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const handleMenuPress = () => {
    setIsSidebarVisible(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarVisible(false);
  };

  // Create a proper theme for React Native Paper based on our custom theme
  const paperTheme = isDarkMode ? {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: theme.colors.primary,
      primaryContainer: theme.colors.primary || theme.colors.primary,
      secondary: theme.colors.secondary,
      secondaryContainer: theme.colors.secondary || theme.colors.secondary,
      tertiary: theme.colors.textDisabled || theme.colors.primary,
      tertiaryContainer: theme.colors.textPrimary || theme.colors.primary,
      surface: theme.colors.surface,
      surfaceVariant: theme.colors.surfaceVariant || theme.colors.surface,
      surfaceDisabled: theme.colors.surface || theme.colors.surface,
      background: theme.colors.background,
      error: theme.colors.error,
      errorContainer: theme.colors.error || theme.colors.error,
      onPrimary: '#FFFFFF',
      onPrimaryContainer: '#FFFFFF',
      onSecondary: '#FFFFFF',
      onSecondaryContainer: '#FFFFFF',
      onTertiary: '#FFFFFF',
      onTertiaryContainer: '#FFFFFF',
      onSurface: theme.colors.textPrimary,
      onSurfaceVariant: theme.colors.textSecondary,
      onSurfaceDisabled: theme.colors.textDisabled,
      onError: '#FFFFFF',
      onErrorContainer: '#FFFFFF',
      onBackground: theme.colors.textPrimary,
      outline: theme.colors.border || '#666666',
      outlineVariant: theme.colors.border || '#888888',
      inverseSurface: theme.colors.background,
      inverseOnSurface: theme.colors.textPrimary,
      inversePrimary: theme.colors.primary,
      shadow: '#000000',
      scrim: '#000000',
      backdrop: theme.colors.overlay || 'rgba(0,0,0,0.5)',
      elevation: {
        level0: 'transparent',
        level1: theme.colors.surface,
        level2: theme.colors.surface,
        level3: theme.colors.surface,
        level4: theme.colors.surface,
        level5: theme.colors.surface,
      },
    },
  } : {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: theme.colors.primary,
      primaryContainer: theme.colors.primary || theme.colors.primary,
      secondary: theme.colors.secondary,
      secondaryContainer: theme.colors.secondary || theme.colors.secondary,
      tertiary: theme.colors.textPrimary || theme.colors.primary,
      tertiaryContainer: theme.colors.textPrimary || theme.colors.primary,
      surface: theme.colors.surface,
      surfaceVariant: theme.colors.surfaceVariant || theme.colors.surface,
      surfaceDisabled: theme.colors.surface || theme.colors.surface,
      background: theme.colors.background,
      error: theme.colors.error,
      errorContainer: theme.colors.error || theme.colors.error,
      onPrimary: '#FFFFFF',
      onPrimaryContainer: '#000000',
      onSecondary: '#FFFFFF',
      onSecondaryContainer: '#000000',
      onTertiary: '#FFFFFF',
      onTertiaryContainer: '#000000',
      onSurface: theme.colors.textPrimary,
      onSurfaceVariant: theme.colors.textSecondary,
      onSurfaceDisabled: theme.colors.textDisabled,
      onError: '#FFFFFF',
      onErrorContainer: '#000000',
      onBackground: theme.colors.textPrimary,
      outline: theme.colors.border || '#CCCCCC',
      outlineVariant: theme.colors.border || '#DDDDDD',
      inverseSurface: theme.colors.background,
      inverseOnSurface: theme.colors.textPrimary,
      inversePrimary: theme.colors.primary,
      shadow: '#000000',
      scrim: '#000000',
      backdrop: theme.colors.overlay || 'rgba(0,0,0,0.5)',
      elevation: {
        level0: 'transparent',
        level1: theme.colors.surface,
        level2: theme.colors.surface,
        level3: theme.colors.surface,
        level4: theme.colors.surface,
        level5: theme.colors.surface,
      },
    },
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // If user is not authenticated, show auth screens
  if (!currentUser) {
    return (
      <PaperProvider theme={paperTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    );
  }

  // If user is authenticated, show main app
  return (
    <PaperProvider theme={paperTheme}>
      <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
        {/* App Bar with integrated sidebar trigger */}
        <AppBar
          onMenuPress={handleMenuPress}
          title="مكتبة الكنيسة"
        />

        {/* Collapsible Sidebar */}
        <Sidebar
          visible={isSidebarVisible}
          onDismiss={handleSidebarClose}
        />

        {/* Main Content Area */}
        <View style={styles.contentContainer}>
          <Slot />
        </View>

        {/* Bottom Navigation Bar */}
        <Navbar />
      </View>
    </PaperProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AppProvider>
          <AuthWrapper />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 70, // Space for app bar
    paddingBottom: 80, // Space for navbar
  },
});