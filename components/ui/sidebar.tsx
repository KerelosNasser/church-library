import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  I18nManager,
  Animated,
} from "react-native";
import {
  List,
  Divider,
  IconButton,
  Surface,
  Title,
  Avatar,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "./icon-symbol";
import { useAppContext } from "@/contexts/AppContext";
import { router } from "expo-router";
import React from "react";

interface SidebarProps {
  visible: boolean;
  onDismiss: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(screenWidth * 0.85, 320);
const SIDEBAR_HEIGHT = screenHeight - 120; // Account for top and bottom spacing
export function Sidebar({ visible, onDismiss }: SidebarProps) {
  const { currentUser, logout, theme } = useAppContext();
  const isAdmin = currentUser?.role === "admin";
  const slideAnim = React.useRef(new Animated.Value(I18nManager.isRTL ? screenWidth : -SIDEBAR_WIDTH)).current;

  const handleNavigation = (route: string) => {
    onDismiss();
    router.replace(route as any);
  };

  const handleLogout = () => {
    onDismiss();
    logout();
  };

  React.useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out animation
      Animated.timing(slideAnim, {
        toValue: I18nManager.isRTL ? screenWidth : -SIDEBAR_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  // Only render sidebar when visible to prevent performance issues
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Overlay for closing sidebar when tapping outside */}
      <TouchableOpacity
        style={styles.overlay}
        onPress={onDismiss}
        activeOpacity={1}
      />

      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: theme.colors.surface,
            width: SIDEBAR_WIDTH,
            height: SIDEBAR_HEIGHT,
            top: 60,
            left: I18nManager.isRTL ? undefined : 16,
            right: I18nManager.isRTL ? 16 : undefined,
            transform: [
              {
                translateX: slideAnim,
              },
            ],
          },
        ]}
      >
        <SafeAreaView style={styles.safeAreaContainer}>
          {/* Header */}
          <Surface
            style={[styles.header, { backgroundColor: theme.colors.primary }]}
          >
            <View style={styles.headerContent}>
              <Avatar.Icon
                size={48}
                icon="account"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.userInfo}>
                <Title style={[styles.userName, { color: "#FFFFFF" }]}>
                  {currentUser?.name || "المستخدم"}
                </Title>
                <List.Subheader style={[styles.userRole, { color: "#FFFFFF" }]}>
                  {isAdmin ? "مدير النظام" : "مستخدم"}
                </List.Subheader>
              </View>
              <IconButton
                icon="close"
                size={24}
                iconColor="#FFFFFF"
                onPress={onDismiss}
              />
            </View>
          </Surface>

          {/* Navigation Items */}
          <View style={styles.navigation}>
            {/* Main Navigation */}
            <List.Section>
              <List.Subheader
                style={[
                  styles.sectionHeader,
                  { color: theme.colors.textPrimary },
                ]}
              >
                التنقل الرئيسي
              </List.Subheader>

              <List.Item
                title={isAdmin ? "الكتب" : "تصفح الكتب"}
                left={(props) => (
                  <IconSymbol
                    {...props}
                    name="book.closed"
                    size={24}
                    color={theme.colors.textPrimary}
                  />
                )}
                onPress={() => handleNavigation("/(tabs)/")}
                style={styles.listItem}
                titleStyle={[
                  styles.listItemTitle,
                  { color: theme.colors.textPrimary },
                ]}
              />

              {isAdmin && (
                <List.Item
                  title="الماسح الضوئي"
                  left={(props) => (
                    <IconSymbol
                      {...props}
                      name="qrcode.viewfinder"
                      size={24}
                      color={theme.colors.textPrimary}
                    />
                  )}
                  onPress={() => handleNavigation("/(tabs)/scanner")}
                  style={styles.listItem}
                  titleStyle={[
                    styles.listItemTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                />
              )}

              {!isAdmin && (
                <>
                  <List.Item
                    title="سجل الاستعارة"
                    left={(props) => (
                      <IconSymbol
                        {...props}
                        name="clock"
                        size={24}
                        color={theme.colors.textPrimary}
                      />
                    )}
                    onPress={() => handleNavigation("/(tabs)/history")}
                    style={styles.listItem}
                    titleStyle={[
                      styles.listItemTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  />

                  <List.Item
                    title="رمز QR الخاص بي"
                    left={(props) => (
                      <IconSymbol
                        {...props}
                        name="qrcode"
                        size={24}
                        color={theme.colors.textPrimary}
                      />
                    )}
                    onPress={() => handleNavigation("/(tabs)/qrcode")}
                    style={styles.listItem}
                    titleStyle={[
                      styles.listItemTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  />
                </>
              )}
            </List.Section>

            <Divider style={styles.divider} />

            {/* Admin Only Section */}
            {isAdmin && (
              <List.Section>
                <List.Subheader
                  style={[
                    styles.sectionHeader,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  إدارة النظام
                </List.Subheader>

                <List.Item
                  title="إدارة الفئات"
                  left={(props) => (
                    <IconSymbol
                      {...props}
                      name="folder"
                      size={24}
                      color={theme.colors.textPrimary}
                    />
                  )}
                  onPress={() => handleNavigation("/(tabs)/categories")}
                  style={styles.listItem}
                  titleStyle={[
                    styles.listItemTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                />

                <List.Item
                  title="إدارة المستخدمين"
                  left={(props) => (
                    <IconSymbol
                      {...props}
                      name="person.2"
                      size={24}
                      color={theme.colors.textPrimary}
                    />
                  )}
                  onPress={() => handleNavigation("/(tabs)/users")}
                  style={styles.listItem}
                  titleStyle={[
                    styles.listItemTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                />
              </List.Section>
            )}

            <Divider style={styles.divider} />

            {/* Settings & Actions */}
            <List.Section>
              <List.Subheader
                style={[
                  styles.sectionHeader,
                  { color: theme.colors.textPrimary },
                ]}
              >
                الإعدادات والأدوات
              </List.Subheader>

              <List.Item
                title="الإعدادات"
                left={(props) => (
                  <IconSymbol
                    {...props}
                    name="gear"
                    size={24}
                    color={theme.colors.textPrimary}
                  />
                )}
                onPress={() => handleNavigation("/(tabs)/settings")}
                style={styles.listItem}
                titleStyle={[
                  styles.listItemTitle,
                  { color: theme.colors.textPrimary },
                ]}
              />

              <List.Item
                title="تسجيل الخروج"
                left={(props) => (
                  <IconSymbol
                    {...props}
                    name="chevron.right"
                    size={24}
                    color={theme.colors.error}
                  />
                )}
                onPress={handleLogout}
                style={styles.listItem}
                titleStyle={[
                  styles.listItemTitle,
                  { color: theme.colors.error },
                ]}
              />
            </List.Section>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    position: "absolute",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1001,
    borderRadius: 8,
  },
  safeAreaContainer: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
    marginBottom: 0,
  },
  userRole: {
    fontSize: 14,
    opacity: 0.8,
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
    marginTop: -8,
  },
  navigation: {
    flex: 1,
    paddingTop: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listItemTitle: {
    fontSize: 16,
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
  },
  divider: {
    marginVertical: 8,
  },
});
