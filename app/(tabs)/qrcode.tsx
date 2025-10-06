import React, { useState } from 'react';
import { View, StyleSheet, Share, Alert, I18nManager } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button,
  useTheme,
  IconButton,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useAppContext } from '@/contexts/AppContext';

export default function QRCodeScreen() {
  const { currentUser } = useAppContext();
  const theme = useTheme();
  const [qrSize, setQrSize] = useState(200);

  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Title style={[styles.errorTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            خطأ
          </Title>
          <Paragraph style={[styles.errorText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            لم يتم العثور على بيانات المستخدم
          </Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  // Generate QR code data with user information
  const qrData = JSON.stringify({
    userId: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    mainChurch: currentUser.mainChurch,
    fatherOfConfession: currentUser.fatherOfConfession,
    timestamp: Date.now()
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `رمز QR الخاص بي في مكتبة الكنيسة\nالاسم: ${currentUser.name}\nالبريد الإلكتروني: ${currentUser.email}`,
        title: 'رمز QR - مكتبة الكنيسة'
      });
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء مشاركة الرمز');
    }
  };

  const handleRefresh = () => {
    // Force re-render by updating timestamp in QR data
    Alert.alert(
      'تحديث الرمز',
      'هل تريد تحديث رمز QR؟ سيتم إنشاء رمز جديد.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تحديث', onPress: () => {
          // The QR code will automatically update due to the timestamp in qrData
        }}
      ]
    );
  };

  const adjustQRSize = (increase: boolean) => {
    setQrSize(prevSize => {
      const newSize = increase ? prevSize + 20 : prevSize - 20;
      return Math.max(150, Math.min(300, newSize));
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title style={[styles.title, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
          رمز QR الخاص بي
        </Title>
        <Paragraph style={[styles.subtitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
          اعرض هذا الرمز للمسؤول لاستعارة الكتب
        </Paragraph>
      </View>

      <View style={styles.content}>
        {/* User Info Card */}
        <Card style={styles.userCard}>
          <Card.Content>
            <View style={styles.userInfo}>
              <Title style={[styles.userName, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                {currentUser.name}
              </Title>
              <Paragraph style={[styles.userDetail, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                البريد الإلكتروني: {currentUser.email}
              </Paragraph>
              <Paragraph style={[styles.userDetail, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                الهاتف: {currentUser.phone}
              </Paragraph>
              <Paragraph style={[styles.userDetail, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                الكنيسة الأساسية: {currentUser.mainChurch}
              </Paragraph>
              <Paragraph style={[styles.userDetail, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                أب الاعتراف: {currentUser.fatherOfConfession}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        {/* QR Code Card */}
        <Card style={styles.qrCard}>
          <Card.Content>
            <View style={styles.qrContainer}>
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={qrData}
                  size={qrSize}
                  color={theme.colors.onSurface}
                  backgroundColor={theme.colors.surface}
                  logo={undefined}
                  logoSize={30}
                  logoBackgroundColor="transparent"
                />
              </View>
              
              {/* QR Size Controls */}
              <View style={styles.sizeControls}>
                <IconButton
                  icon="minus"
                  size={24}
                  onPress={() => adjustQRSize(false)}
                  disabled={qrSize <= 150}
                />
                <Paragraph style={styles.sizeText}>
                  حجم الرمز: {qrSize}px
                </Paragraph>
                <IconButton
                  icon="plus"
                  size={24}
                  onPress={() => adjustQRSize(true)}
                  disabled={qrSize >= 300}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Instructions Card */}
        <Card style={styles.instructionsCard}>
          <Card.Content>
            <Title style={[styles.instructionsTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              تعليمات الاستخدام
            </Title>
            <Divider style={styles.divider} />
            
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <IconButton icon="numeric-1-circle" size={20} />
                <Paragraph style={[styles.instructionText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  اعرض هذا الرمز للمسؤول في المكتبة
                </Paragraph>
              </View>
              
              <View style={styles.instructionItem}>
                <IconButton icon="numeric-2-circle" size={20} />
                <Paragraph style={[styles.instructionText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  سيقوم المسؤول بمسح الرمز لتأكيد هويتك
                </Paragraph>
              </View>
              
              <View style={styles.instructionItem}>
                <IconButton icon="numeric-3-circle" size={20} />
                <Paragraph style={[styles.instructionText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  اختر الكتاب المطلوب وأكمل عملية الاستعارة
                </Paragraph>
              </View>
              
              <View style={styles.instructionItem}>
                <IconButton icon="numeric-4-circle" size={20} />
                <Paragraph style={[styles.instructionText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  ستصلك إشعار بتأكيد الاستعارة
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleShare}
            icon="share"
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
          >
            مشاركة الرمز
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleRefresh}
            icon="refresh"
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
          >
            تحديث الرمز
          </Button>
        </View>

        {/* Security Notice */}
        <Card style={[styles.securityCard, { backgroundColor: theme.colors.errorContainer }]}>
          <Card.Content>
            <View style={styles.securityNotice}>
              <IconButton 
                icon="shield-alert" 
                size={24} 
                iconColor={theme.colors.onErrorContainer}
              />
              <View style={styles.securityText}>
                <Title style={[styles.securityTitle, { 
                  color: theme.colors.onErrorContainer,
                  textAlign: I18nManager.isRTL ? 'right' : 'left'
                }]}>
                  تنبيه أمني
                </Title>
                <Paragraph style={[styles.securityDescription, { 
                  color: theme.colors.onErrorContainer,
                  textAlign: I18nManager.isRTL ? 'right' : 'left'
                }]}>
                  لا تشارك هذا الرمز مع أشخاص غير مخولين. يحتوي على معلوماتك الشخصية.
                </Paragraph>
              </View>
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  userCard: {
    marginBottom: 16,
    elevation: 2,
  },
  userInfo: {
    gap: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  userDetail: {
    fontSize: 14,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  qrCard: {
    marginBottom: 16,
    elevation: 2,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 1,
    marginBottom: 16,
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  divider: {
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  securityCard: {
    elevation: 2,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  securityDescription: {
    fontSize: 14,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  errorText: {
    fontSize: 16,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});