import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, I18nManager, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  FAB, 
  Searchbar,
  Chip,
  useTheme,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/contexts/AppContext';

const AVAILABLE_COLORS = [
  { name: 'أزرق', value: '#2196F3' },
  { name: 'أحمر', value: '#F44336' },
  { name: 'أخضر', value: '#4CAF50' },
  { name: 'برتقالي', value: '#FF9800' },
  { name: 'بنفسجي', value: '#9C27B0' },
  { name: 'وردي', value: '#E91E63' },
  { name: 'بني', value: '#795548' },
  { name: 'رمادي', value: '#607D8B' },
];

export default function CategoriesScreen() {
  const { 
    categories, 
    currentUser, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    getBooksByCategory 
  } = useAppContext();
  const theme = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#2196F3',
  });

  const isAdmin = currentUser?.role === 'admin';

  // Filter categories based on search
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      color: '#2196F3',
    });
    setModalVisible(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      color: category.color,
    });
    setModalVisible(true);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الفئة');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryForm);
      Alert.alert('نجح', 'تم تحديث الفئة بنجاح');
    } else {
      addCategory(categoryForm);
      Alert.alert('نجح', 'تم إضافة الفئة بنجاح');
    }

    setModalVisible(false);
  };

  const handleDeleteCategory = (categoryId: number) => {
    const booksInCategory = getBooksByCategory(categoryId);
    
    if (booksInCategory.length > 0) {
      Alert.alert(
        'لا يمكن الحذف',
        `هذه الفئة تحتوي على ${booksInCategory.length} كتاب. يرجى حذف الكتب أولاً أو نقلها إلى فئة أخرى.`
      );
      return;
    }

    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذه الفئة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => {
            deleteCategory(categoryId);
            Alert.alert('نجح', 'تم حذف الفئة بنجاح');
          }
        }
      ]
    );
  };

  const getColorName = (colorValue: string) => {
    const color = AVAILABLE_COLORS.find(c => c.value === colorValue);
    return color ? color.name : 'لون مخصص';
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
          إدارة الفئات
        </Title>
        
        <Searchbar
          placeholder="البحث في الفئات..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView style={styles.content}>
        {filteredCategories.map(category => {
          const booksCount = getBooksByCategory(category.id).length;
          
          return (
            <Card key={category.id} style={styles.categoryCard}>
              <Card.Content>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <View style={styles.categoryTitleRow}>
                      <View 
                        style={[styles.colorIndicator, { backgroundColor: category.color }]} 
                      />
                      <Title style={[styles.categoryTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                        {category.name}
                      </Title>
                    </View>
                    <Paragraph style={[styles.categoryDescription, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                      {category.description}
                    </Paragraph>
                  </View>
                  <Chip 
                    style={[styles.booksCountChip, { backgroundColor: theme.colors.primaryContainer }]}
                    textStyle={{ color: theme.colors.onPrimaryContainer }}
                  >
                    {booksCount} كتاب
                  </Chip>
                </View>
                
                <View style={styles.categoryFooter}>
                  <Chip 
                    style={[styles.colorChip, { backgroundColor: category.color }]}
                    textStyle={{ color: 'white' }}
                  >
                    {getColorName(category.color)}
                  </Chip>
                  
                  <View style={styles.adminActions}>
                    <Button 
                      mode="outlined" 
                      onPress={() => handleEditCategory(category)}
                      style={styles.actionButton}
                    >
                      تعديل
                    </Button>
                    <Button 
                      mode="outlined" 
                      onPress={() => handleDeleteCategory(category.id)}
                      buttonColor={theme.colors.errorContainer}
                      textColor={theme.colors.onErrorContainer}
                      style={styles.actionButton}
                      disabled={booksCount > 0}
                    >
                      حذف
                    </Button>
                  </View>
                </View>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddCategory}
      />

      {/* Add/Edit Category Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Title style={[styles.modalTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
            {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
          </Title>

          <TextInput
            label="اسم الفئة"
            value={categoryForm.name}
            onChangeText={(text) => setCategoryForm(prev => ({ ...prev, name: text }))}
            mode="outlined"
            style={styles.modalInput}
          />

          <TextInput
            label="الوصف"
            value={categoryForm.description}
            onChangeText={(text) => setCategoryForm(prev => ({ ...prev, description: text }))}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.modalInput}
          />

          <View style={styles.colorSelector}>
            <Paragraph style={[styles.colorSelectorLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              اللون:
            </Paragraph>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {AVAILABLE_COLORS.map(color => (
                <Button
                  key={color.value}
                  mode={categoryForm.color === color.value ? 'contained' : 'outlined'}
                  onPress={() => setCategoryForm(prev => ({ ...prev, color: color.value }))}
                  style={[
                    styles.colorButton,
                    { 
                      backgroundColor: categoryForm.color === color.value ? color.value : 'transparent',
                      borderColor: color.value
                    }
                  ]}
                  labelStyle={{ 
                    color: categoryForm.color === color.value ? 'white' : color.value,
                    fontSize: 12
                  }}
                >
                  {color.name}
                </Button>
              ))}
            </ScrollView>
          </View>

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
              onPress={handleSaveCategory}
              style={styles.modalButton}
            >
              {editingCategory ? 'تحديث' : 'إضافة'}
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
    marginBottom: 16,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  searchbar: {
    marginBottom: 16,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  categoryCard: {
    marginBottom: 16,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    marginLeft: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  categoryDescription: {
    fontSize: 14,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    marginLeft: 24,
    marginRight: 24,
  },
  booksCountChip: {
    alignSelf: 'flex-start',
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorChip: {
    alignSelf: 'flex-start',
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    minWidth: 60,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
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
  colorSelector: {
    marginBottom: 16,
  },
  colorSelectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  colorButton: {
    marginRight: 8,
    marginLeft: 8,
    minWidth: 60,
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