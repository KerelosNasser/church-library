import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, I18nManager } from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Title, 
  ActivityIndicator,
  useTheme 
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    mainChurch: '',
    fatherOfConfession: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signup } = useAppContext();
  const theme = useTheme();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, age, email, password, confirmPassword, phone, mainChurch, fatherOfConfession } = formData;
    
    if (!name || !age || !email || !password || !confirmPassword || !phone || !mainChurch || !fatherOfConfession) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمة المرور وتأكيد كلمة المرور غير متطابقتين');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }

    if (isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      Alert.alert('خطأ', 'يرجى إدخال عمر صحيح');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('خطأ', 'يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        ...formData,
        age: Number(formData.age),
        role: 'user' as const,
      };
      
      const success = await signup(userData);
      if (success) {
        Alert.alert(
          'نجح التسجيل', 
          'تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.',
          [{ text: 'موافق', onPress: () => router.replace('/auth/login') }]
        );
      } else {
        Alert.alert('خطأ', 'البريد الإلكتروني مستخدم بالفعل');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={[styles.title, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              إنشاء حساب جديد
            </Title>

            <TextInput
              label="الاسم الكامل"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              mode="outlined"
              style={styles.input}
              right={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="العمر"
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              right={<TextInput.Icon icon="calendar" />}
            />

            <TextInput
              label="البريد الإلكتروني"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              right={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="كلمة المرور"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
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

            <TextInput
              label="تأكيد كلمة المرور"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              right={
                <TextInput.Icon 
                  icon={showConfirmPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            <TextInput
              label="رقم الهاتف"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              right={<TextInput.Icon icon="phone" />}
            />

            <TextInput
              label="الكنيسة الأساسية"
              value={formData.mainChurch}
              onChangeText={(value) => handleInputChange('mainChurch', value)}
              mode="outlined"
              style={styles.input}
              right={<TextInput.Icon icon="church" />}
            />

            <TextInput
              label="أب الاعتراف"
              value={formData.fatherOfConfession}
              onChangeText={(value) => handleInputChange('fatherOfConfession', value)}
              mode="outlined"
              style={styles.input}
              right={<TextInput.Icon icon="account-tie" />}
            />

            <Button
              mode="contained"
              onPress={handleSignup}
              loading={loading}
              disabled={loading}
              style={styles.signupButton}
              contentStyle={styles.buttonContent}
            >
              {loading ? <ActivityIndicator color="white" /> : 'إنشاء حساب'}
            </Button>

            <Button
              mode="text"
              onPress={navigateToLogin}
              style={styles.loginButton}
            >
              لديك حساب بالفعل؟ تسجيل الدخول
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  input: {
    marginBottom: 16,
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginButton: {
    marginBottom: 8,
  },
});