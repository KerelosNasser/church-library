import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  sendBorrowConfirmation: (userName: string, bookName: string, returnDate: string) => Promise<void>;
  sendReturnReminder: (userName: string, bookName: string, daysLeft: number) => Promise<void>;
  sendOverdueNotification: (userName: string, bookName: string, daysOverdue: number) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  hasPermissions: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        setHasPermissions(true);
      }
    });

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification tap - could navigate to specific screen
      // console.log('Notification tapped:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        setHasPermissions(true);
        return true;
      }
      return false;
    } catch (error) {
      if (__DEV__) {
        console.error('Error requesting notification permissions:', error);
      }
      return false;
    }
  };

  const sendBorrowConfirmation = async (userName: string, bookName: string, returnDate: string) => {
    if (!hasPermissions) {
      Alert.alert('تنبيه', 'لم يتم منح إذن الإشعارات');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'تأكيد الاستعارة ✅',
          body: `تم تسجيل استعارة كتاب "${bookName}" بنجاح. تاريخ الإرجاع: ${new Date(returnDate).toLocaleDateString('ar-EG')}`,
          data: {
            type: 'borrow_confirmation',
            userName,
            bookName,
            returnDate,
          },
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Error sending borrow confirmation:', error);
      }
    }
  };

  const sendReturnReminder = async (userName: string, bookName: string, daysLeft: number) => {
    if (!hasPermissions) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'تذكير بإرجاع الكتاب 📚',
          body: `يرجى إرجاع كتاب "${bookName}" خلال ${daysLeft} أيام`,
          data: {
            type: 'return_reminder',
            userName,
            bookName,
            daysLeft,
          },
          sound: 'default',
        },
        trigger: null,
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Error sending return reminder:', error);
      }
    }
  };

  const sendOverdueNotification = async (userName: string, bookName: string, daysOverdue: number) => {
    if (!hasPermissions) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'كتاب متأخر ⚠️',
          body: `كتاب "${bookName}" متأخر ${daysOverdue} أيام. يرجى إرجاعه في أقرب وقت`,
          data: {
            type: 'overdue_notification',
            userName,
            bookName,
            daysOverdue,
          },
          sound: 'default',
        },
        trigger: null,
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Error sending overdue notification:', error);
      }
    }
  };

  const value: NotificationContextType = {
    expoPushToken,
    notification,
    sendBorrowConfirmation,
    sendReturnReminder,
    sendOverdueNotification,
    requestPermissions,
    hasPermissions,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  // Configure notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'مكتبة الكنيسة',
      description: 'إشعارات مكتبة الكنيسة',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2196F3',
      sound: 'default',
    });
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowDisplayInCarPlay: false,
        allowCriticalAlerts: false,
        provideAppNotificationSettings: true,
        allowProvisional: false,
      },
    });
    finalStatus = status;
  }

  // Handle permission denied
  if (finalStatus !== 'granted') {
    Alert.alert(
      'إذن الإشعارات مطلوب',
      'يرجى السماح بالإشعارات لتلقي تحديثات حول استعارة الكتب',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'الإعدادات',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Notifications.requestPermissionsAsync();
            } else {
              // For Android, you might want to open app settings
              // This is a simplified approach
              Alert.alert('تنبيه', 'يرجى تفعيل الإشعارات من إعدادات التطبيق');
            }
          }
        }
      ]
    );
    return null;
  }

  try {
    // Get push token - updated for SDK 54
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // Replace with your actual project ID
    });
    token = tokenResponse.data;
    if (__DEV__) {
      console.log('Expo push token:', token);
    }
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting push token:', error);
      }
    }

    if (__DEV__) {
      console.log('Using development token fallback');
    }
  }

  return token;
}
