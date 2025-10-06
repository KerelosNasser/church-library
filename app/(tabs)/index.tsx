import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, I18nManager, Alert } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Searchbar,
  Chip,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/contexts/AppContext';

// Types
interface Book {
  id: number;
  name: string;
  author: string;
  description: string;
  price: number;
  category: number;
}

interface BookFormData {
  name: string;
  author: string;
  description: string;
  price: string;
  category: number;
}


const INITIAL_FORM_STATE: BookFormData = {
  name: '',
  author: '',
  description: '',
  price: '',
  category: 1,
};

export default function BooksScreen() {
  const {
    books,
    categories,
    currentUser,
    addBook,
    updateBook,
    deleteBook,
    theme,
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState<BookFormData>(INITIAL_FORM_STATE);

  const isAdmin = currentUser?.role === 'admin';

  // Memoized filtered books for better performance
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        book.name.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory
        ? book.category === selectedCategory
        : true;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, selectedCategory]);

  // Memoized category lookup functions
  const getCategoryName = useCallback(
    (categoryId: number): string => {
      const category = categories.find((c) => c.id === categoryId);
      return category?.name ?? 'غير محدد';
    },
    [categories]
  );

  const getCategoryColor = useCallback(
    (categoryId: number): string => {
      const category = categories.find((c) => c.id === categoryId);
      return category?.color ?? '#000000';
    },
    [categories]
  );

  // Modal handlers
  const openAddModal = useCallback(() => {
    setEditingBook(null);
    setBookForm(INITIAL_FORM_STATE);
    setModalVisible(true);
  }, []);

  const openEditModal = useCallback((book: Book) => {
    setEditingBook(book);
    setBookForm({
      name: book.name,
      author: book.author,
      description: book.description,
      price: book.price.toString(),
      category: book.category,
    });
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingBook(null);
    setBookForm(INITIAL_FORM_STATE);
  }, []);

  // Form handlers
  const updateFormField = useCallback(
    <K extends keyof BookFormData>(field: K, value: BookFormData[K]) => {
      setBookForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    if (!bookForm.name.trim() || !bookForm.author.trim() || !bookForm.price) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return false;
    }

    const price = Number(bookForm.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال سعر صحيح');
      return false;
    }

    return true;
  }, [bookForm]);

  const handleSaveBook = useCallback(() => {
    if (!validateForm()) return;

    const bookData = {
      name: bookForm.name.trim(),
      author: bookForm.author.trim(),
      description: bookForm.description.trim(),
      price: Number(bookForm.price),
      category: bookForm.category,
    };

    if (editingBook) {
      updateBook(editingBook.id, bookData);
      Alert.alert('نجح', 'تم تحديث الكتاب بنجاح');
    } else {
      addBook(bookData);
      Alert.alert('نجح', 'تم إضافة الكتاب بنجاح');
    }

    closeModal();
  }, [bookForm, editingBook, validateForm, updateBook, addBook, closeModal]);

  const handleDeleteBook = useCallback(
    (bookId: number) => {
      Alert.alert(
        'تأكيد الحذف',
        'هل أنت متأكد من حذف هذا الكتاب؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'حذف',
            style: 'destructive',
            onPress: () => {
              deleteBook(bookId);
              Alert.alert('نجح', 'تم حذف الكتاب بنجاح');
            },
          },
        ]
      );
    },
    [deleteBook]
  );

  // Render components
  const renderCategoryFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
    >
      <Chip
        selected={selectedCategory === null}
        onPress={() => setSelectedCategory(null)}
        style={styles.categoryChip}
      >
        الكل
      </Chip>
      {categories.map((category) => (
        <Chip
          key={category.id}
          selected={selectedCategory === category.id}
          onPress={() => setSelectedCategory(category.id)}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && {
              backgroundColor: category.color,
            },
          ]}
        >
          {category.name}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderBookCard = (book: Book) => (
    <Card key={book.id} style={styles.bookCard}>
      <Card.Content>
        <View style={styles.bookHeader}>
          <View style={styles.bookInfo}>
            <Title
              style={[
                styles.bookTitle,
                { textAlign: I18nManager.isRTL ? 'right' : 'left' },
              ]}
            >
              {book.name}
            </Title>
            <Paragraph
              style={[
                styles.bookAuthor,
                { textAlign: I18nManager.isRTL ? 'right' : 'left' },
              ]}
            >
              المؤلف: {book.author}
            </Paragraph>
          </View>
          <Chip
            style={[styles.priceChip, { backgroundColor: theme.colors.primary }]}
            textStyle={{ color: 'white' }}
          >
            {book.price} ج.م
          </Chip>
        </View>

        <Paragraph
          style={[
            styles.bookDescription,
            { textAlign: I18nManager.isRTL ? 'right' : 'left' },
          ]}
        >
          {book.description}
        </Paragraph>

        <View style={styles.bookFooter}>
          <Chip
            style={[
              styles.categoryTag,
              { backgroundColor: getCategoryColor(book.category) },
            ]}
            textStyle={{ color: 'white' }}
          >
            {getCategoryName(book.category)}
          </Chip>

          {isAdmin && (
            <View style={styles.adminActions}>
              <Button
                mode="outlined"
                onPress={() => openEditModal(book)}
                style={styles.actionButton}
              >
                تعديل
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleDeleteBook(book.id)}
                buttonColor={theme.colors.error}
                textColor={theme.colors.textPrimary}
                style={styles.actionButton}
              >
                حذف
              </Button>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={closeModal}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Title
          style={[
            styles.modalTitle,
            { textAlign: I18nManager.isRTL ? 'right' : 'left' },
          ]}
        >
          {editingBook ? 'تعديل الكتاب' : 'إضافة كتاب جديد'}
        </Title>

        <TextInput
          label="اسم الكتاب *"
          value={bookForm.name}
          onChangeText={(text) => updateFormField('name', text)}
          mode="outlined"
          style={styles.modalInput}
        />

        <TextInput
          label="المؤلف *"
          value={bookForm.author}
          onChangeText={(text) => updateFormField('author', text)}
          mode="outlined"
          style={styles.modalInput}
        />

        <TextInput
          label="الوصف"
          value={bookForm.description}
          onChangeText={(text) => updateFormField('description', text)}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.modalInput}
        />

        <TextInput
          label="السعر (ج.م) *"
          value={bookForm.price}
          onChangeText={(text) => updateFormField('price', text)}
          mode="outlined"
          keyboardType="numeric"
          style={styles.modalInput}
        />

        <View style={styles.categorySelector}>
          <Paragraph
            style={[
              styles.categorySelectorLabel,
              { textAlign: I18nManager.isRTL ? 'right' : 'left' },
            ]}
          >
            الفئة:
          </Paragraph>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                selected={bookForm.category === category.id}
                onPress={() => updateFormField('category', category.id)}
                style={[
                  styles.categoryChip,
                  bookForm.category === category.id && {
                    backgroundColor: category.color,
                  },
                ]}
              >
                {category.name}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={closeModal}
            style={styles.modalButton}
          >
            إلغاء
          </Button>
          <Button
            mode="contained"
            onPress={handleSaveBook}
            style={styles.modalButton}
          >
            {editingBook ? 'تحديث' : 'إضافة'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Title
          style={[
            styles.title,
            { textAlign: I18nManager.isRTL ? 'right' : 'left' },
          ]}
        >
          {isAdmin ? 'إدارة الكتب' : 'تصفح الكتب'}
        </Title>

        <Searchbar
          placeholder="البحث في الكتب..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {renderCategoryFilters()}
      </View>

      <ScrollView style={styles.content}>
        {filteredBooks.length > 0 ? (
          filteredBooks.map(renderBookCard)
        ) : (
          <Paragraph style={styles.emptyMessage}>
            لا توجد كتب تطابق البحث
          </Paragraph>
        )}
      </ScrollView>

      {isAdmin && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={openAddModal}
        />
      )}

      {renderModal()}
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
  categoryFilter: {
    marginBottom: 8,
  },
  categoryChip: {
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 32,
    opacity: 0.6,
  },
  bookCard: {
    marginBottom: 16,
    elevation: 2,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookInfo: {
    flex: 1,
    marginRight: 8,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  bookAuthor: {
    fontSize: 14,
    opacity: 0.7,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  priceChip: {
    marginLeft: 8,
  },
  bookDescription: {
    marginBottom: 12,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  bookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
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
  categorySelector: {
    marginBottom: 16,
  },
  categorySelectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
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
});