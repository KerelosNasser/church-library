import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, I18nManager } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Searchbar,
  Chip,
  useTheme,
  Button
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/contexts/AppContext';

export default function BrowseBooksScreen() {
  const { 
    books, 
    categories, 
    currentUser 
  } = useAppContext();
  const theme = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Filter books based on search and category
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? book.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Group books by category
  const booksByCategory = categories.map(category => ({
    ...category,
    books: filteredBooks.filter(book => book.category === category.id)
  })).filter(category => category.books.length > 0);

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'غير محدد';
  };

  const getCategoryColor = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'gray';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Title style={[styles.title, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
          تصفح الكتب
        </Title>
        
        <Searchbar
          placeholder="البحث في الكتب..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
          <Chip
            selected={selectedCategory === null}
            onPress={() => setSelectedCategory(null)}
            style={styles.categoryChip}
          >
            الكل
          </Chip>
          {categories.map(category => (
            <Chip
              key={category.id}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[styles.categoryChip, { 
                backgroundColor: selectedCategory === category.id ? category.color : undefined 
              }]}
              textColor={selectedCategory === category.id ? 'white' : undefined}
            >
              {category.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {selectedCategory === null ? (
          // Show books grouped by category
          booksByCategory.map(category => (
            <View key={category.id} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View 
                  style={[styles.categoryColorIndicator, { backgroundColor: category.color }]} 
                />
                <Title style={[styles.categoryTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                  {category.name}
                </Title>
                <Chip 
                  style={[styles.categoryCount, { backgroundColor: theme.colors.primaryContainer }]}
                  textColor={theme.colors.onPrimaryContainer}
                >
                  {category.books.length} كتاب
                </Chip>
              </View>
              
              <Paragraph style={[styles.categoryDescription, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                {category.description}
              </Paragraph>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.booksRow}>
                {category.books.map(book => (
                  <Card key={book.id} style={styles.bookCard}>
                    <Card.Content style={styles.bookContent}>
                      <View style={styles.bookTextContainer}>
                        <Title style={[styles.bookTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]} numberOfLines={2}>
                          {book.name}
                        </Title>
                        <Paragraph style={[styles.bookAuthor, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                          {book.author}
                        </Paragraph>
                        <Paragraph style={[styles.bookDescription, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]} numberOfLines={3}>
                          {book.description}
                        </Paragraph>
                      </View>
                      <View style={styles.bookFooter}>
                        <Chip 
                          style={[styles.priceChip, { backgroundColor: theme.colors.primaryContainer }]}
                          textColor={theme.colors.onPrimaryContainer}
                        >
                          {book.price} ج.م
                        </Chip>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </ScrollView>
            </View>
          ))
        ) : (
          // Show filtered books in grid
          <View style={styles.gridContainer}>
            {filteredBooks.map(book => (
              <Card key={book.id} style={styles.gridBookCard}>
                <Card.Content>
                  <Title style={[styles.bookTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                    {book.name}
                  </Title>
                  <Paragraph style={[styles.bookAuthor, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                    المؤلف: {book.author}
                  </Paragraph>
                  <Paragraph style={[styles.bookDescription, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]} numberOfLines={3}>
                    {book.description}
                  </Paragraph>
                  
                  <View style={styles.bookFooter}>
                    <Chip 
                      style={[styles.categoryTag, { backgroundColor: getCategoryColor(book.category) }]}
                      textColor="white"
                    >
                      {getCategoryName(book.category)}
                    </Chip>
                    <Chip 
                      style={[styles.priceChip, { backgroundColor: theme.colors.primaryContainer }]}
                      textColor={theme.colors.onPrimaryContainer}
                    >
                      {book.price} ج.م
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {filteredBooks.length === 0 && (
          <View style={styles.emptyState}>
            <Title style={[styles.emptyTitle, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              لا توجد كتب
            </Title>
            <Paragraph style={[styles.emptyDescription, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
              لم يتم العثور على كتب تطابق البحث الحالي
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
  searchbar: {
    marginBottom: 16,
  },
  categoryFilter: {
    marginBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    marginLeft: 8,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  categoryCount: {
    alignSelf: 'flex-start',
  },
  categoryDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    marginLeft: 24,
    marginRight: 24,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  booksRow: {
    marginBottom: 8,
  },
  bookCard: {
    width: 200,
    marginRight: 12,
    marginLeft: 12,
    elevation: 2,
  },
  bookContent: {
    height: 180,
    justifyContent: 'space-between',
    padding: 8,
  },
  bookTextContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  bookAuthor: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  bookDescription: {
    fontSize: 12,
    marginBottom: 8,
    flex: 1,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    overflow: 'hidden',
  },
  bookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  priceChip: {
    alignSelf: 'flex-end',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridBookCard: {
    width: '48%',
    marginBottom: 16,
    elevation: 2,
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