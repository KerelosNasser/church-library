import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, I18nManager } from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Title, 
  Paragraph, 
  ActivityIndicator,
  useTheme 
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, currentUser } = useAppContext();
  const theme = useTheme();

  // Redirect to tabs if user is already logged in
  useEffect(() => {
    if (currentUser) {
      // Use setTimeout to avoid navigation during render
      const timer = setTimeout(() => {
        try {
          router.replace('/(tabs)');
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        // Navigation will be handled by useEffect
      } else {
        Alert.alert('خطأ', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    try {
      router.push('/auth/signup');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={[styles.title, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              تسجيل الدخول
            </Title>
            <Paragraph style={[styles.subtitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              مكتبة الكنيسة
            </Paragraph>

            <TextInput
              label="البريد الإلكتروني"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              right={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="كلمة المرور"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              {loading ? <ActivityIndicator color="white" /> : 'دخول'}
            </Button>

            <Button
              mode="text"
              onPress={navigateToSignup}
              style={styles.signupButton}
              disabled={loading}
            >
              ليس لديك حساب؟ إنشاء حساب جديد
            </Button>

            <View style={styles.demoCredentials}>
              <Paragraph style={[styles.demoTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                بيانات تجريبية:
              </Paragraph>
              <Paragraph style={[styles.demoText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                مدير: george@mail.com / admin123
              </Paragraph>
              <Paragraph style={[styles.demoText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                مستخدم: mina@mail.com / 123456
              </Paragraph>
            </View>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  signupButton: {
    marginBottom: 24,
  },
  demoCredentials: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
  },
  demoTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  demoText: {
    fontSize: 12,
    marginBottom: 2,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});