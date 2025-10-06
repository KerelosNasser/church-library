import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, I18nManager } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Chip,
  useTheme,
  ProgressBar,
  Button
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/contexts/AppContext';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function BorrowHistoryScreen() {
  const { 
    borrowRecords, 
    books, 
    categories,
    currentUser 
  } = useAppContext();
  const theme = useTheme();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get user's borrow records
  const userBorrowRecords = borrowRecords.filter(record => 
    record.userId === currentUser?.id
  );

  const getBookDetails = (bookId: number) => {
    return books.find(book => book.id === bookId);
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'غير محدد';
  };

  const getCategoryColor = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'gray';
  };

  const calculateTimeRemaining = (returnDate: string): TimeRemaining => {
    const now = currentTime.getTime();
    const returnTime = new Date(returnDate).getTime();
    const difference = returnTime - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const getProgressValue = (borrowDate: string, returnDate: string): number => {
    const now = currentTime.getTime();
    const borrowTime = new Date(borrowDate).getTime();
    const returnTime = new Date(returnDate).getTime();
    
    const totalDuration = returnTime - borrowTime;
    const elapsed = now - borrowTime;
    
    return Math.min(Math.max(elapsed / totalDuration, 0), 1);
  };

  const getStatusColor = (returnDate: string) => {
    const timeRemaining = calculateTimeRemaining(returnDate);
    const totalHours = timeRemaining.days * 24 + timeRemaining.hours;
    
    if (totalHours <= 0) return theme.colors.error;
    if (totalHours <= 24) return theme.colors.errorContainer;
    if (totalHours <= 72) return '#FF9800'; // Orange
    return theme.colors.primary;
  };

  const getStatusText = (returnDate: string) => {
    const timeRemaining = calculateTimeRemaining(returnDate);
    const totalHours = timeRemaining.days * 24 + timeRemaining.hours;
    
    if (totalHours <= 0) return 'منتهي الصلاحية';
    if (totalHours <= 24) return 'ينتهي قريباً';
    if (totalHours <= 72) return 'ينتهي خلال 3 أيام';
    return 'نشط';
  };

  const formatTimeRemaining = (timeRemaining: TimeRemaining): string => {
    if (timeRemaining.days <= 0 && timeRemaining.hours <= 0 && timeRemaining.minutes <= 0 && timeRemaining.seconds <= 0) {
      return 'انتهت المدة';
    }
    
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days} يوم و ${timeRemaining.hours} ساعة`;
    } else if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours} ساعة و ${timeRemaining.minutes} دقيقة`;
    } else {
      return `${timeRemaining.minutes} دقيقة و ${timeRemaining.seconds} ثانية`;
    }
  };

  // Separate active and completed records
  const activeRecords = userBorrowRecords.filter(record => {
    const timeRemaining = calculateTimeRemaining(record.returnDate);
    return timeRemaining.days > 0 || timeRemaining.hours > 0 || timeRemaining.minutes > 0 || timeRemaining.seconds > 0;
  });

  const completedRecords = userBorrowRecords.filter(record => {
    const timeRemaining = calculateTimeRemaining(record.returnDate);
    return timeRemaining.days <= 0 && timeRemaining.hours <= 0 && timeRemaining.minutes <= 0 && timeRemaining.seconds <= 0;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title style={[styles.title, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
          سجل الاستعارة
        </Title>
        
        <View style={styles.statsRow}>
          <Chip 
            style={[styles.statChip, { backgroundColor: theme.colors.primaryContainer }]}
            textStyle={{ color: theme.colors.onPrimaryContainer }}
          >
            المجموع: {userBorrowRecords.length}
          </Chip>
          <Chip 
            style={[styles.statChip, { backgroundColor: theme.colors.primary }]}
            textStyle={{ color: 'white' }}
          >
            نشط: {activeRecords.length}
          </Chip>
          <Chip 
            style={[styles.statChip, { backgroundColor: theme.colors.outline }]}
            textStyle={{ color: theme.colors.onSurface }}
          >
            مكتمل: {completedRecords.length}
          </Chip>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Active Records */}
        {activeRecords.length > 0 && (
          <View style={styles.section}>
            <Title style={[styles.sectionTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              الاستعارات النشطة
            </Title>
            
            {activeRecords.map(record => {
              const book = getBookDetails(record.bookId);
              if (!book) return null;
              
              const timeRemaining = calculateTimeRemaining(record.returnDate);
              const progress = getProgressValue(record.borrowDate, record.returnDate);
              
              return (
                <Card key={record.id} style={styles.recordCard}>
                  <Card.Content>
                    <View style={styles.recordHeader}>
                      <View style={styles.bookInfo}>
                        <Title style={[styles.bookTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          {book.name}
                        </Title>
                        <Paragraph style={[styles.bookAuthor, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          المؤلف: {book.author}
                        </Paragraph>
                      </View>
                      <Chip 
                        style={[styles.statusChip, { backgroundColor: getStatusColor(record.returnDate) }]}
                        textStyle={{ color: 'white' }}
                      >
                        {getStatusText(record.returnDate)}
                      </Chip>
                    </View>
                    
                    <View style={styles.recordDetails}>
                      <View style={styles.detailRow}>
                        <Paragraph style={[styles.detailLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          تاريخ الاستعارة:
                        </Paragraph>
                        <Paragraph style={[styles.detailValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          {new Date(record.borrowDate).toLocaleDateString('ar-EG')}
                        </Paragraph>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Paragraph style={[styles.detailLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          تاريخ الإرجاع:
                        </Paragraph>
                        <Paragraph style={[styles.detailValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          {new Date(record.returnDate).toLocaleDateString('ar-EG')}
                        </Paragraph>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Paragraph style={[styles.detailLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          السعر:
                        </Paragraph>
                        <Paragraph style={[styles.detailValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          {record.price} ج.م
                        </Paragraph>
                      </View>
                    </View>
                    
                    <View style={styles.countdownSection}>
                      <Paragraph style={[styles.countdownLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                        الوقت المتبقي:
                      </Paragraph>
                      <Title style={[styles.countdownTime, { 
                        textAlign: I18nManager.isRTL ? 'right' : 'left',
                        color: getStatusColor(record.returnDate)
                      }]}>
                        {formatTimeRemaining(timeRemaining)}
                      </Title>
                      <ProgressBar 
                        progress={progress} 
                        color={getStatusColor(record.returnDate)}
                        style={styles.progressBar}
                      />
                    </View>
                    
                    <View style={styles.recordFooter}>
                      <Chip 
                        style={[styles.categoryTag, { backgroundColor: getCategoryColor(book.category) }]}
                        textStyle={{ color: 'white' }}
                      >
                        {getCategoryName(book.category)}
                      </Chip>
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        )}

        {/* Completed Records */}
        {completedRecords.length > 0 && (
          <View style={styles.section}>
            <Title style={[styles.sectionTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              الاستعارات المكتملة
            </Title>
            
            {completedRecords.map(record => {
              const book = getBookDetails(record.bookId);
              if (!book) return null;
              
              return (
                <Card key={record.id} style={[styles.recordCard, styles.completedCard]}>
                  <Card.Content>
                    <View style={styles.recordHeader}>
                      <View style={styles.bookInfo}>
                        <Title style={[styles.bookTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          {book.name}
                        </Title>
                        <Paragraph style={[styles.bookAuthor, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          المؤلف: {book.author}
                        </Paragraph>
                      </View>
                      <Chip 
                        style={[styles.statusChip, { backgroundColor: theme.colors.outline }]}
                        textStyle={{ color: theme.colors.onSurface }}
                      >
                        مكتمل
                      </Chip>
                    </View>
                    
                    <View style={styles.recordDetails}>
                      <View style={styles.detailRow}>
                        <Paragraph style={[styles.detailLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          فترة الاستعارة:
                        </Paragraph>
                        <Paragraph style={[styles.detailValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          {new Date(record.borrowDate).toLocaleDateString('ar-EG')} - {new Date(record.returnDate).toLocaleDateString('ar-EG')}
                        </Paragraph>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Paragraph style={[styles.detailLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          السعر:
                        </Paragraph>
                        <Paragraph style={[styles.detailValue, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                          {record.price} ج.م
                        </Paragraph>
                      </View>
                    </View>
                    
                    <View style={styles.recordFooter}>
                      <Chip 
                        style={[styles.categoryTag, { backgroundColor: getCategoryColor(book.category) }]}
                        textStyle={{ color: 'white' }}
                      >
                        {getCategoryName(book.category)}
                      </Chip>
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        )}

        {userBorrowRecords.length === 0 && (
          <View style={styles.emptyState}>
            <Title style={[styles.emptyTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              لا توجد استعارات
            </Title>
            <Paragraph style={[styles.emptyDescription, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              لم تقم بأي استعارة حتى الآن
            </Paragraph>
          </View>
        )}
      </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  recordCard: {
    marginBottom: 16,
    elevation: 2,
  },
  completedCard: {
    opacity: 0.8,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  bookAuthor: {
    fontSize: 14,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  recordDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  countdownSection: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  countdownLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  countdownTime: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  categoryTag: {
    alignSelf: 'flex-start',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  emptyDescription: {
    fontSize: 16,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});