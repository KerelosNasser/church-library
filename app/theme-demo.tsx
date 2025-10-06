import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { Button, Card, Title, Paragraph } from 'react-native-paper';

export default function ThemeDemoScreen() {
  const { toggleTheme, isDarkMode, theme } = useAppContext();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Title style={{ 
        color: theme.colors.textPrimary, 
        marginBottom: theme.spacing.md,
        textAlign: 'center'
      }}>
        عرض السمات المخصصة
      </Title>
      
      <Paragraph style={{ 
        color: theme.colors.textSecondary, 
        marginBottom: theme.spacing.xl,
        textAlign: 'center'
      }}>
        الوضع الحالي: {isDarkMode ? 'داكن' : 'فاتح'}
      </Paragraph>
      
      <Button 
        mode="contained" 
        onPress={toggleTheme}
        style={{ 
          marginBottom: theme.spacing.xl,
          backgroundColor: theme.colors.primary
        }}
      >
        تبديل السمة
      </Button>
      
      <Card style={{ 
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.surface
      }}>
        <Card.Content>
          <Title style={{ color: theme.colors.textPrimary }}>الألوان الأساسية</Title>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.colorText}>Primary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.secondary }]}>
              <Text style={styles.colorText}>Secondary</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={{ 
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.surface
      }}>
        <Card.Content>
          <Title style={{ color: theme.colors.textPrimary }}>أحجام الخطوط</Title>
          <Text style={{ 
            ...theme.typography.heading1, 
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.sm
          }}>
            Heading 1
          </Text>
          <Text style={{ 
            ...theme.typography.heading2, 
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.sm
          }}>
            Heading 2
          </Text>
          <Text style={{ 
            ...theme.typography.bodyLarge, 
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.sm
          }}>
            Body Large
          </Text>
          <Text style={{ 
            ...theme.typography.bodyMedium, 
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.sm
          }}>
            Body Medium
          </Text>
        </Card.Content>
      </Card>
      
      <Card style={{ 
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.surface
      }}>
        <Card.Content>
          <Title style={{ color: theme.colors.textPrimary }}>التباعد</Title>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.spacingBox, { 
              width: theme.spacing.sm, 
              height: theme.spacing.sm,
              backgroundColor: theme.colors.primary 
            }]} />
            <Text style={{ 
              marginHorizontal: theme.spacing.sm,
              color: theme.colors.textSecondary
            }}>SM</Text>
            
            <View style={[styles.spacingBox, { 
              width: theme.spacing.md, 
              height: theme.spacing.md,
              backgroundColor: theme.colors.primary 
            }]} />
            <Text style={{ 
              marginHorizontal: theme.spacing.sm,
              color: theme.colors.textSecondary
            }}>MD</Text>
            
            <View style={[styles.spacingBox, { 
              width: theme.spacing.lg, 
              height: theme.spacing.lg,
              backgroundColor: theme.colors.primary 
            }]} />
            <Text style={{ 
              marginHorizontal: theme.spacing.sm,
              color: theme.colors.textSecondary
            }}>LG</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  colorBox: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  colorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  spacingBox: {
    borderRadius: 4,
  },
});
