import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, I18nManager } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button,
  Switch,
  List,
  Divider,
  IconButton,
  Avatar,
  Chip,
  Modal,
  Portal,
  TextInput
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/contexts/AppContext';
import { router } from 'expo-router';

export default function SettingsScreen() {
const {
    currentUser,
    updateUser,
    logout,
    isDarkMode,
    toggleTheme,
    notificationsEnabled,
    soundEnabled,
    setNotificationsEnabled,
    setSoundEnabled,
theme
  } = useAppContext();
  
  const [isEnglish, setIsEnglish] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    mainChurch: currentUser?.mainChurch || '',
    fatherOfConfession: currentUser?.fatherOfConfession || ''
  });

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من أنك تريد تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الخروج', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'حذفالحساب',
      'هل أنت متأكد من أنك تريد حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert('تم', 'سيتم حذف حسابك قريباً');
          }
        }
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert('تغيير كلمة المرور', 'سيتم إضافة هذه الميزة قريباً');
  };

  const handleEditProfile = () => {
    setProfileModalVisible(true);
  };

  const handleSaveProfile = () => {
    if (updateUser) {
      updateUser(currentUser?.id || 0, profileForm);
      setProfileModalVisible(false);
      Alert.alert('نجح', 'تم تحديث الملف الشخصي بنجاح');
    }
  };

  const handleLanguageToggle = () => {
    setIsEnglish(!isEnglish);
    // Here you would implement actual language switching logic
    Alert.alert(
      isEnglish ? 'Language Changed' : 'تم تغيير اللغة',
     isEnglish ? 'Language switched to Arabic' : 'Language switched to English'
    );
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    Alert.alert(
      'إعدادات الإشعارات',
      value ? 'تم تفعيل الإشعارات بنجاح' : 'تم إلغاء تفعيل الإشعارات',
      [{ text: 'موافق', style: 'default' }]
    );
  };

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value);
    Alert.alert(
      'إعدادات الأصوات',
      value? 'تم تفعيل أصوات الإشعارات' : 'تم إلغاء تفعيل أصوات الإشعارات',
      [{ text: 'موافق', style: 'default' }]
    );
  };

  const handleThemeToggle = () => {
    toggleTheme();
    Alert.alert(
     'تم تغيير المظهر',
      isDarkMode ? 'تم التبديل إلى المظهر الفاتح' : 'تم التبديل إلى المظهر الداكن'
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'الدعم الفني',
      'للتواصل مع الدعم الفني:\nالبريد الإلكتروني: support@churchlibrary.com\nالهاتف: 01000000000'
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'حول التطبيق',
      'نظام إدارة مكتبة الكنيسة\nالإصدار: 1.0.0\nتم التطوير بواسطة فريق التطوير'
    );
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Title style={[styles.errorTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            خطأ
          </Title>
          <Paragraph style={[styles.errorText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            لم يتمالعثور على بيانات المستخدم
          </Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title style={[styles.title, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
          الإعدادات
        </Title>
      </View>

      <ScrollView style={styles.content}>
        {/* User Profile Card */}
        <Card style={styles.profileCard}>
          <Card.Content>
            <View style={styles.profileHeader}>
<Avatar.Text 
                size={60} 
                label={currentUser.name.charAt(0)} 
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.profileInfo}>
                <Title style={[styles.profileName, { textAlign: I18nManager.isRTL ? 'right': 'left' }]}>
                  {currentUser.name}
                </Title>
                <Paragraph style={[styles.profileEmail, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  {currentUser.email}
                </Paragraph>
                <Chip 
                  style={[styles.roleChip, {backgroundColor: currentUser.role === 'admin' ? theme.colors.primary : theme.colors.secondary 
                  }]}
                  textStyle={{ color: 'white' }}
                >
                  {currentUser.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                </Chip>
              </View>
              <IconButton
                icon="pencil"
                size={24}
                onPress={handleEditProfile}
              />
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.profileDetails}>
              <View style={styles.detailRow}>
                <Paragraph style={[styles.detailLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  العمر:
                </Paragraph>
                <Paragraph style={[styles.detailValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  {currentUser.age} سنة
                </Paragraph>
              </View>
              
              <View style={styles.detailRow}>
                <Paragraph style={[styles.detailLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  الهاتف:
                </Paragraph>
                <Paragraph style={[styles.detailValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  {currentUser.phone}
                </Paragraph>
              </View>
              
              <View style={styles.detailRow}>
                <Paragraph style={[styles.detailLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  الكنيسة الأساسية:
                </Paragraph>
                <Paragraph style={[styles.detailValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  {currentUser.mainChurch}
                </Paragraph>
              </View>
              
              <View style={styles.detailRow}>
                <Paragraph style={[styles.detailLabel, { textAlign: I18nManager.isRTL? 'right' : 'left' }]}>
                  أب الاعتراف:
                </Paragraph>
                <Paragraph style={[styles.detailValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  {currentUser.fatherOfConfession}
                </Paragraph>
              </View>
            </View>
          </Card.Content>
</Card>

        {/* App Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              إعدادات التطبيق
            </Title>
            
            <List.Section>
              <List.Item
                title="اللغة"
                description={isEnglish ? "English" : "العربية"}
                left={props => <List.Icon {...props} icon="translate" />}
                right={() => (
                  <Switch
                    value={isEnglish}
                    onValueChange={handleLanguageToggle}
                  />
                )}
                titleStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
                descriptionStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
              />
              
              <List.Item
                title="المظهر الداكن"
                description={isDarkMode ? "مفعل" : "معطل"}
                left={props => <List.Icon {...props} icon="theme-light-dark" />}
                right={() => (
                  <Switch
                    value={isDarkMode}
                    onValueChange={handleThemeToggle}
                 />
                )}
                titleStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
                descriptionStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
              />
              
              <List.Item
                title="ألوان التطبيق"
                description="أزرق، أحمر، أبيض"
                left={props => <List.Icon {...props} icon="palette" />}
                right={() => (
                  <View style={styles.colorPreview}>
                    <View style={[styles.colorDot, { backgroundColor: theme.colors.primary }]} />
                    <View style={[styles.colorDot, { backgroundColor: theme.colors.secondary }]} />
                    <View style={[styles.colorDot, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]} />
                  </View>
                )}
                titleStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
                descriptionStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
              />
           </List.Section>
          </Card.Content>
        </Card>

        {/* Notification Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              إعداداتالإشعارات
            </Title>
            
            <List.Section>
              <List.Item
                title="تفعيل الإشعارات"
                description="استقبال إشعارات التطبيق"
                left={props => <List.Icon {...props} icon="bell" />}
                right={() => (
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={handleNotificationToggle}
                  />
                )}
                titleStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
                descriptionStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
              />
              
             <List.Item
                title="الأصوات"
                description="تشغيل أصوات الإشعارات"
                left={props => <List.Icon {...props} icon="volume-high" />}
                right={() => (
                  <Switch
                    value={soundEnabled}
                    onValueChange={handleSoundToggle}
                    disabled={!notificationsEnabled}
                  />
                )}
titleStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
                descriptionStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
              />
              
              <List.Item
                title="تذكير الإرجاع"
                description="إشعار قبل انتهاء مدة الاستعارة"
                left={props => <List.Icon {...props} icon="clock-alert" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => Alert.alert('تذكير الإرجاع', 'سيتمإرسال تذكير قبل يوم من انتهاء مدة الاستعارة')}
                titleStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
                descriptionStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
              />
           </List.Section>
          </Card.Content>
        </Card>

        {/* AccountSettings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              إعدادات الحساب
            </Title>
            
            <List.Section>
              <List.Item
                title="تغيير كلمة المرور"
                description="تحديث كلمة المرور الخاصة بك"
                left={props => <List.Icon {...props} icon="lock" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleChangePassword}
                titleStyle={{textAlign: I18nManager.isRTL ? 'right' : 'left' }}
                descriptionStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
              />
              
              <List.Item
                title="تعديل الملف الشخصي"
                description="تحديث معلوماتكالشخصية"
                left={props => <List.Icon {...props} icon="account-edit" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleEditProfile}
                titleStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left'}}
descriptionStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
              />
           </List.Section>
          </Card.Content>
        </Card>

        {/* Support& Info */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              الدعم والمعلومات
            </Title>
            
            <List.Section>
              <List.Item
                title="الدعم الفني"
                description="تواصل مع فريق الدعم"
                left={props => <List.Icon {...props} icon="help-circle" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleContactSupport}
                titleStyle={{textAlign: I18nManager.isRTL ? 'right' : 'left' }}
                descriptionStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
              />
              
              <List.Item
                title="حول التطبيق"
                description="معلومات عن التطبيق والإصدار"
left={props => <List.Icon {...props} icon="information" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleAbout}
                titleStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
                descriptionStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
              />
              
              <List.Item
                title="سياسةالخصوصية"
                description="اطلع على سياسة الخصوصية"
                left={props => <List.Icon {...props} icon="shield-account" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => Alert.alert('سياسة الخصوصية', 'سيتم إضافة سياسة الخصوصية قريباً')}
                titleStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
                descriptionStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
             />
              
              <List.Item
                title="عرضالسمات"
                description="عرض توضيحي لنظام السمات المخصص"
                left={props => <List.Icon {...props} icon="palette" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => router.push('/theme-demo' as any)}
titleStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
                descriptionStyle={{ textAlign: I18nManager.isRTL ? 'right' : 'left' }}
              />
            </List.Section>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
<View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleLogout}
            icon="logout"
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
          >
            تسجيل الخروج
          </Button>
<Button
            mode="outlined"
            onPress={handleDeleteAccount}
            icon="delete"
            style={[styles.actionButton, { borderColor: theme.colors.error }]}
            textColor={theme.colors.error}
            contentStyle={styles.buttonContent}
          >
            حذف الحساب
          </Button>
</View>

        {/* App Version */}
        <View style={styles.versionInfo}>
          <Paragraph style={[styles.versionText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            نظام إدارة مكتبة الكنيسة - الإصدار 1.0.0
          </Paragraph>
          <Paragraph style={[styles.copyrightText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            © 2024 جميع الحقوق محفوظة
          </Paragraph>
        </View>
      </ScrollView>

      {/* ProfileEdit Modal */}
      <Portal>
        <Modal
          visible={profileModalVisible}
          onDismiss={() => setProfileModalVisible(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <Title style={styles.modalTitle}>تعديل الملف الشخصي</Title>
<TextInput
            label="الاسم"
            value={profileForm.name}
            onChangeText={(text) => setProfileForm({ ...profileForm, name: text })}
            style={styles.modalInput}
            mode="outlined"
          />
          
          <TextInput
            label="البريد الإلكتروني"
            value={profileForm.email}
            onChangeText={(text) => setProfileForm({ ...profileForm, email: text })}
            style={styles.modalInput}
            mode="outlined"
            keyboardType="email-address"
          />
          
          <TextInput
            label="رقم الهاتف"
            value={profileForm.phone}
            onChangeText={(text) => setProfileForm({ ...profileForm, phone: text })}
            style={styles.modalInput}
            mode="outlined"
            keyboardType="phone-pad"
          />
          
          <TextInput
            label="الكنيسة الأساسية"
            value={profileForm.mainChurch}
            onChangeText={(text) => setProfileForm({ ...profileForm, mainChurch: text })}
            style={styles.modalInput}
            mode="outlined"
          />
          
          <TextInput
            label="أب الاعتراف"
            value={profileForm.fatherOfConfession}
            onChangeText={(text) => setProfileForm({ ...profileForm, fatherOfConfession: text })}
            style={styles.modalInput}
            mode="outlined"
          />
          
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setProfileModalVisible(false)}
              style={styles.modalButton}
            >
              إلغاء
            </Button>
<Button
              mode="contained"
              onPress={handleSaveProfile}
              style={styles.modalButton}
            >
              حفظ
            </Button>
          </View>
        </Modal>
      </Portal>
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
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
 content: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  profileCard: {
    marginBottom: 16,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    writingDirection: I18nManager.isRTL ? 'rtl' :'ltr',
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  roleChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  divider: {
    marginBottom: 16,
  },
  profileDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
   writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    flex: 1,
  },
settingsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
actionButton: {
    marginHorizontal: 0,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  copyrightText: {
    fontSize: 12,
    opacity: 0.5,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex:1,
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
    writingDirection:I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  errorText: {
    fontSize: 16,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});
