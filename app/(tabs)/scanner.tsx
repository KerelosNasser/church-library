import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, I18nManager } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button,
  useTheme,
  IconButton,
  Chip,
  TextInput,
  Portal,
  Modal,
  Divider
} from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAppContext } from '@/contexts/AppContext';
import { router } from 'expo-router';

interface ScannedUser {
  userId: number;
  name: string;
  email: string;
  phone: string;
  mainChurch: string;
  fatherOfConfession: string;
  timestamp: number;
}

export default function QRScannerScreen() {
  const { 
    currentUser, 
    users, 
    books, 
    categories,
    addBorrowRecord 
  } = useAppContext();
  
  const sendBorrowConfirmation = async (userName: string, bookName: string, returnDate: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'تم تأكيد الاستعارة',
        body: `تم استعارة الكتاب "${bookName}" بنجاح. يرجى إعادته في ${returnDate}.`,
        data: { userName, bookName, returnDate },
      },
      trigger: null, // Immediate notification
    });
  };
  
  const theme = useTheme();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [borrowPrice, setBorrowPrice] = useState('10');
  const [borrowDays, setBorrowDays] = useState('14');
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    // Redirect non-admin users
    if (currentUser && !isAdmin) {
      Alert.alert('غير مسموح', 'هذه الصفحة مخصصة للمسؤولين فقط');
      router.back();
    }
  }, [currentUser, isAdmin]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned || isProcessing) return;
    
    setScanned(true);
    
    try {
      // Parse the QR code data
      const parsedData: ScannedUser = JSON.parse(data);
      
      // Validate the scanned data structure
      if (!parsedData.userId || !parsedData.name || !parsedData.email) {
        Alert.alert('خطأ في البيانات', 'رمز QR غير صالح أو لا يحتوي على البيانات المطلوبة', [
          {
            text: 'إعادة المحاولة',
            onPress: () => setScanned(false)
          }
        ]);
        return;
      }

      // Check if user exists in our system
      const userExists = users.find(user => user.id === parsedData.userId);
      if (!userExists) {
        Alert.alert('مستخدم غير موجود', 'المستخدم غير مسجل في النظام. يرجى التأكد من صحة رمز QR.', [
          {
            text: 'إعادة المحاولة',
            onPress: () => setScanned(false)
          }
        ]);
        return;
      }

      // Validate timestamp to ensure QR code is not too old (optional security measure)
      const currentTime = Date.now();
      const qrAge = currentTime - parsedData.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (qrAge > maxAge) {
        Alert.alert('رمز QR منتهي الصلاحية', 'رمز QR قديم جداً. يرجى طلب رمز جديد من المستخدم.', [
          {
            text: 'إعادة المحاولة',
            onPress: () => setScanned(false)
          }
        ]);
        return;
      }

      // Set scanned user and show borrow modal
      setScannedUser(parsedData);
      setShowBorrowModal(true);
      
    } catch (error) {
      Alert.alert('خطأ في المسح', 'فشل في قراءة رمز QR. يرجى التأكد من صحة الرمز والمحاولة مرة أخرى.', [
        {
          text: 'إعادة المحاولة',
          onPress: () => setScanned(false)
        }
      ]);
    }
  };

  const handleBorrowConfirmation = async () => {
    if (!scannedUser || !selectedBook) {
      Alert.alert('خطأ', 'يرجى اختيار كتاب للاستعارة');
      return;
    }

    setIsProcessing(true);
    
    try {
      const selectedBookData = books.find(book => book.id === selectedBook);
      if (!selectedBookData) {
        Alert.alert('خطأ', 'الكتاب المحدد غير موجود');
        return;
      }

      // Calculate return date
      const borrowDate = new Date();
      const returnDate = new Date(borrowDate);
      returnDate.setDate(borrowDate.getDate() + parseInt(borrowDays));

      // Create borrow record
      const borrowRecord = {
        userId: scannedUser.userId,
        bookId: selectedBook,
        borrowDate: borrowDate.toISOString(),
        returnDate: returnDate.toISOString(),
        price: parseFloat(borrowPrice),
        status: 'active' as const
      };

      // Add borrow record
      const success = await addBorrowRecord(borrowRecord);
      
      if (success) {
        // Send notification
        await sendBorrowConfirmation(
          scannedUser.name,
          selectedBookData.name,
          returnDate.toLocaleDateString('ar-EG')
        );

        Alert.alert('تم بنجاح', 'تم تسجيل الاستعارة بنجاح', [
          {
            text: 'موافق',
            onPress: () => {
              setShowBorrowModal(false);
              setScannedUser(null);
              setSelectedBook(null);
              setScanned(false);
            }
          }
        ]);
      } else {
        Alert.alert('خطأ', 'فشل في تسجيل الاستعارة');
      }
    } catch (error) {
      // Log error for debugging in development only
      if (__DEV__) {
        console.error('Error processing borrow:', error);
      }
      Alert.alert('خطأ', 'حدث خطأ أثناء معالجة الاستعارة');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'غير محدد';
  };

  const availableBooks = books.filter(book => book.available);

  if (!isAdmin) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Title style={[styles.errorTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            غير مسموح
          </Title>
          <Paragraph style={[styles.errorText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            هذه الصفحة مخصصة للمسؤولين فقط
          </Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Title style={[styles.loadingTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            جارٍ التحميل...
          </Title>
          <Paragraph style={[styles.loadingText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            يتم تحميل الكاميرا
          </Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Title style={[styles.errorTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            لا يوجد إذن للكاميرا
          </Title>
          <Paragraph style={[styles.errorText, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            نحتاج إلى إذن الوصول للكاميرا لمسح رموز QR. يرجى منح الإذن للمتابعة.
          </Paragraph>
          <Button
            mode="contained"
            onPress={requestPermission}
            style={styles.permissionButton}
            icon="camera"
            loading={permission.status === 'undetermined'}
          >
            {permission.status === 'undetermined' ? 'جارٍ طلب الإذن...' : 'منح الإذن'}
          </Button>
          {permission.canAskAgain === false && (
            <Paragraph style={[styles.errorText, { textAlign: I18nManager.isRTL ? 'right' : 'left', marginTop: 16 }]}>
              يرجى الذهاب إلى إعدادات التطبيق لمنح إذن الكاميرا يدوياً.
            </Paragraph>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Title style={[styles.title, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            مسح رمز QR
          </Title>
          <IconButton
            icon="arrow-right"
            size={24}
            onPress={() => router.back()}
          />
        </View>
        <Paragraph style={[styles.subtitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
          امسح رمز QR الخاص بالمستخدم لبدء عملية الاستعارة
        </Paragraph>
      </View>

      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.scanner}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Paragraph style={styles.scannerText}>
              {scanned ? 'تم المسح بنجاح' : 'وجه الكاميرا نحو رمز QR'}
            </Paragraph>
          </View>
        </CameraView>
      </View>

      <View style={styles.controls}>
        {scanned && (
          <Button
            mode="contained"
            onPress={() => setScanned(false)}
            icon="camera"
            style={styles.rescanButton}
          >
            مسح مرة أخرى
          </Button>
        )}
      </View>

      {/* Borrow Modal */}
      <Portal>
        <Modal
          visible={showBorrowModal}
          onDismiss={() => {
            setShowBorrowModal(false);
            setScannedUser(null);
            setSelectedBook(null);
            setScanned(false);
          }}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <Title style={[styles.modalTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            تسجيل استعارة جديدة
          </Title>
          
          {scannedUser && (
            <Card style={styles.userInfoCard}>
              <Card.Content>
                <Title style={[styles.userInfoTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  معلومات المستخدم
                </Title>
                <Divider style={styles.divider} />
                
                <View style={styles.userInfoDetails}>
                  <View style={styles.userInfoRow}>
                    <Paragraph style={[styles.userInfoLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                      الاسم:
                    </Paragraph>
                    <Paragraph style={[styles.userInfoValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                      {scannedUser.name}
                    </Paragraph>
                  </View>
                  
                  <View style={styles.userInfoRow}>
                    <Paragraph style={[styles.userInfoLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                      البريد الإلكتروني:
                    </Paragraph>
                    <Paragraph style={[styles.userInfoValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                      {scannedUser.email}
                    </Paragraph>
                  </View>
                  
                  <View style={styles.userInfoRow}>
                    <Paragraph style={[styles.userInfoLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                      الهاتف:
                    </Paragraph>
                    <Paragraph style={[styles.userInfoValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                      {scannedUser.phone}
                    </Paragraph>
                  </View>
                  
                  <View style={styles.userInfoRow}>
                    <Paragraph style={[styles.userInfoLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                      الكنيسة:
                    </Paragraph>
                    <Paragraph style={[styles.userInfoValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                      {scannedUser.mainChurch}
                    </Paragraph>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}

          <View style={styles.bookSelection}>
            <Title style={[styles.sectionTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              اختيار الكتاب
            </Title>
            
            <View style={styles.booksList}>
              {availableBooks.length > 0 ? (
                availableBooks.map(book => (
                  <Chip
                    key={book.id}
                    selected={selectedBook === book.id}
                    onPress={() => setSelectedBook(book.id)}
                    style={[
                      styles.bookChip,
                      selectedBook === book.id && { backgroundColor: theme.colors.primary }
                    ]}
                    textStyle={selectedBook === book.id ? { color: 'white' } : {}}
                  >
                    {book.name} - {getCategoryName(book.category)}
                  </Chip>
                ))
              ) : (
                <Paragraph style={{ textAlign: 'center', opacity: 0.6 }}>
                  لا توجد كتب متاحة حاليًا
                </Paragraph>
              )}
            </View>
          </View>

          <View style={styles.borrowDetails}>
            <Title style={[styles.sectionTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              تفاصيل الاستعارة
            </Title>
            
            <View style={styles.inputRow}>
              <TextInput
                label="السعر (ج.م)"
                value={borrowPrice}
                onChangeText={setBorrowPrice}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="مدة الاستعارة (أيام)"
                value={borrowDays}
                onChangeText={setBorrowDays}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
              />
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setShowBorrowModal(false);
                setScannedUser(null);
                setSelectedBook(null);
                setScanned(false);
              }}
              style={styles.modalButton}
            >
              إلغاء
            </Button>
            
            <Button
              mode="contained"
              onPress={handleBorrowConfirmation}
              style={styles.modalButton}
              disabled={!selectedBook || isProcessing}
              loading={isProcessing}
            >
              تأكيد الاستعارة
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  scannerContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
    margin: 16,
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  controls: {
    padding: 16,
    paddingTop: 0,
  },
  rescanButton: {
    marginHorizontal: 0,
  },
  modalContainer: {
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
  userInfoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  divider: {
    marginBottom: 12,
  },
  userInfoDetails: {
    gap: 8,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  userInfoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    flex: 1,
  },
  userInfoValue: {
    fontSize: 14,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    flex: 2,
  },
  bookSelection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  booksList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bookChip: {
    marginBottom: 4,
  },
  borrowDetails: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
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
    marginBottom: 16,
    textAlign: 'center',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  permissionButton: {
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});