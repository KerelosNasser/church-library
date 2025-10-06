import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, I18nManager, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Searchbar,
  Chip,
  useTheme,
  Portal,
  Modal,
  TextInput,
  Avatar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/contexts/AppContext';

export default function UsersScreen() {
  const { 
    users, 
    currentUser, 
    updateUser 
  } = useAppContext();
  const theme = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    phone: '',
    mainChurch: '',
    fatherOfConfession: '',
  });

  const isAdmin = currentUser?.role === 'admin';

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery) ||
    user.mainChurch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fatherOfConfession.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      age: user.age.toString(),
      email: user.email,
      password: '',
      passwordConfirmation: '',
      phone: user.phone,
      mainChurch: user.mainChurch,
      fatherOfConfession: user.fatherOfConfession,
    });
    setModalVisible(true);
  };

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email || !userForm.phone) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (userForm.password && userForm.password !== userForm.passwordConfirmation) {
      Alert.alert('خطأ', 'كلمة المرور وتأكيد كلمة المرور غير متطابقتين');
      return;
    }

    const userData = {
      name: userForm.name,
      age: Number(userForm.age),
      email: userForm.email,
      phone: userForm.phone,
      mainChurch: userForm.mainChurch,
      fatherOfConfession: userForm.fatherOfConfession,
      ...(userForm.password && { password: userForm.password }),
    };

    updateUser(selectedUser.id, userData);
    Alert.alert('نجح', 'تم تحديث بيانات المستخدم بنجاح');
    setModalVisible(false);
  };

  const getRoleText = (role: string) => {
    return role === 'admin' ? 'مدير' : 'مستخدم';
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? theme.colors.error : theme.colors.primary;
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.notAuthorized}>
          <Title style={[styles.notAuthorizedText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            غير مصرح لك بالوصول إلى هذه الصفحة
          </Title>
          <Paragraph style={[styles.notAuthorizedDesc, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            هذه الصفحة مخصصة للمديرين فقط
          </Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title style={[styles.title, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
          إدارة المستخدمين
        </Title>
        
        <Searchbar
          placeholder="البحث في المستخدمين..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <View style={styles.statsRow}>
          <Chip 
            style={[styles.statChip, { backgroundColor: theme.colors.primaryContainer }]}
            textStyle={{ color: theme.colors.onPrimaryContainer }}
          >
            المجموع: {users.length}
          </Chip>
          <Chip 
            style={[styles.statChip, { backgroundColor: theme.colors.errorContainer }]}
            textStyle={{ color: theme.colors.onErrorContainer }}
          >
            المديرين: {users.filter(u => u.role === 'admin').length}
          </Chip>
          <Chip 
            style={[styles.statChip, { backgroundColor: theme.colors.secondaryContainer }]}
            textStyle={{ color: theme.colors.onSecondaryContainer }}
          >
            المستخدمين: {users.filter(u => u.role === 'user').length}
          </Chip>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {filteredUsers.map(user => (
          <Card key={user.id} style={styles.userCard}>
            <Card.Content>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.userTitleRow}>
                    <Avatar.Text 
                      size={40} 
                      label={user.name.charAt(0)} 
                      style={[styles.avatar, { backgroundColor: getRoleColor(user.role) }]}
                    />
                    <View style={styles.userDetails}>
                      <Title style={[styles.userName, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                        {user.name}
                      </Title>
                      <Paragraph style={[styles.userEmail, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                        {user.email}
                      </Paragraph>
                    </View>
                  </View>
                </View>
                <Chip 
                  style={[styles.roleChip, { backgroundColor: getRoleColor(user.role) }]}
                  textStyle={{ color: 'white' }}
                >
                  {getRoleText(user.role)}
                </Chip>
              </View>
              
              <View style={styles.userDetailsSection}>
                <View style={styles.detailRow}>
                  <Paragraph style={[styles.detailLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                    العمر:
                  </Paragraph>
                  <Paragraph style={[styles.detailValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                    {user.age} سنة
                  </Paragraph>
                </View>
                
                <View style={styles.detailRow}>
                  <Paragraph style={[styles.detailLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                    الهاتف:
                  </Paragraph>
                  <Paragraph style={[styles.detailValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                    {user.phone}
                  </Paragraph>
                </View>
                
                <View style={styles.detailRow}>
                  <Paragraph style={[styles.detailLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                    الكنيسة الأساسية:
                  </Paragraph>
                  <Paragraph style={[styles.detailValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                    {user.mainChurch}
                  </Paragraph>
                </View>
                
                <View style={styles.detailRow}>
                  <Paragraph style={[styles.detailLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                    أب الاعتراف:
                  </Paragraph>
                  <Paragraph style={[styles.detailValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                    {user.fatherOfConfession}
                  </Paragraph>
                </View>
              </View>
              
              <View style={styles.userFooter}>
                <Button 
                  mode="contained" 
                  onPress={() => handleViewUser(user)}
                  style={styles.viewButton}
                >
                  عرض وتعديل
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* User Details Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Title style={[styles.modalTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              تعديل بيانات المستخدم
            </Title>

            <TextInput
              label="الاسم"
              value={userForm.name}
              onChangeText={(text) => setUserForm(prev => ({ ...prev, name: text }))}
              mode="outlined"
              style={styles.modalInput}
            />

            <TextInput
              label="العمر"
              value={userForm.age}
              onChangeText={(text) => setUserForm(prev => ({ ...prev, age: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={styles.modalInput}
            />

            <TextInput
              label="البريد الإلكتروني"
              value={userForm.email}
              onChangeText={(text) => setUserForm(prev => ({ ...prev, email: text }))}
              mode="outlined"
              keyboardType="email-address"
              style={styles.modalInput}
            />

            <TextInput
              label="كلمة المرور الجديدة (اختياري)"
              value={userForm.password}
              onChangeText={(text) => setUserForm(prev => ({ ...prev, password: text }))}
              mode="outlined"
              secureTextEntry
              style={styles.modalInput}
            />

            <TextInput
              label="تأكيد كلمة المرور"
              value={userForm.passwordConfirmation}
              onChangeText={(text) => setUserForm(prev => ({ ...prev, passwordConfirmation: text }))}
              mode="outlined"
              secureTextEntry
              style={styles.modalInput}
            />

            <TextInput
              label="رقم الهاتف"
              value={userForm.phone}
              onChangeText={(text) => setUserForm(prev => ({ ...prev, phone: text }))}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.modalInput}
            />

            <TextInput
              label="الكنيسة الأساسية"
              value={userForm.mainChurch}
              onChangeText={(text) => setUserForm(prev => ({ ...prev, mainChurch: text }))}
              mode="outlined"
              style={styles.modalInput}
            />

            <TextInput
              label="أب الاعتراف"
              value={userForm.fatherOfConfession}
              onChangeText={(text) => setUserForm(prev => ({ ...prev, fatherOfConfession: text }))}
              mode="outlined"
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                إلغاء
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSaveUser}
                style={styles.modalButton}
              >
                حفظ التغييرات
              </Button>
            </View>
          </ScrollView>
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
    marginBottom: 16,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  searchbar: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statChip: {
    flex: 1,
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
    marginLeft: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  roleChip: {
    alignSelf: 'flex-start',
  },
  userDetailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    flex: 2,
  },
  userFooter: {
    alignItems: 'center',
  },
  viewButton: {
    minWidth: 120,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    minWidth: 80,
  },
  notAuthorized: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notAuthorizedText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  notAuthorizedDesc: {
    fontSize: 16,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});