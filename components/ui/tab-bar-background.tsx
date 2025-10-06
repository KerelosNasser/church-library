import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function TabBarBackground() {
  const theme = useTheme();
  
  return (
    <BlurView
      tint={theme.dark ? 'dark' : 'light'}
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}