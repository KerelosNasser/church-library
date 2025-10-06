import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { Badge, Surface, Appbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "./icon-symbol";
import { useAppContext } from "@/contexts/AppContext";
import { router, usePathname } from "expo-router";

interface NavbarProps {
  onMenuPress?: () => void;
  showAppBar?: boolean;
}

export function Navbar({ onMenuPress }: NavbarProps) {
  const { currentUser, theme } = useAppContext();
  const pathname = usePathname();
  const isAdmin = currentUser?.role === "admin";

  const handleNavigation = (route: string) => {
    // Only navigate if it's not the current route
    if (pathname !== route) {
      router.replace(route as any);
    }
  };

  const isActiveRoute = (route: string) => {
    return pathname === route || pathname.startsWith(route);
  };

  // Essential navigation items (max 4)
  const getEssentialItems = () => {
    if (isAdmin) {
      return [
        {
          key: "books",
          route: "/(tabs)/",
          icon: "book.closed",
          label: "الكتب",
        },
        {
          key: "scanner",
          route: "/(tabs)/qrcode",
          icon: "qrcode.viewfinder",
          label: "الماسح",
        },
        {
          key: "settings",
          route: "/(tabs)/settings",
          icon: "gear",
          label: "الإعدادات",
        },
      ];
    } else {
      return [
        {
          key: "browse",
          route: "/(tabs)/",
          icon: "book.closed",
          label: "الكتب",
        },
        {
          key: "history",
          route: "/(tabs)/history",
          icon: "clock",
          label: "السجل",
        },
        {
          key: "qrcode",
          route: "/(tabs)/qrcode",
          icon: "qrcode",
          label: "QR",
        },
        {
          key: "settings",
          route: "/(tabs)/settings",
          icon: "gear",
          label: "الإعدادات",
        },
      ];
    }
  };

  const essentialItems = getEssentialItems();

  return (
    <Surface
      style={[styles.navbar, { backgroundColor: theme.colors.surface }]}
      elevation={4}
    >
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          {/* Essential Navigation Items */}
          <View style={styles.navItems}>
            {essentialItems.map((item) => {
              const isActive = isActiveRoute(item.route);
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.navItem,
                    isActive && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => handleNavigation(item.route)}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    name={item.icon as any}
                    size={24}
                    color={isActive ? "#FFFFFF" : theme.colors.textPrimary}
                  />
                  {/* Optional: Add badge for notifications */}
                  {item.key === "history" && !isAdmin && (
                    <Badge
                      visible={false} // Set to true when there are new items
                      size={8}
                      style={[
                        styles.badge,
                        { backgroundColor: theme.colors.error },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </Surface>
  );
}

// New AppBar component that includes the sidebar trigger
export interface AppBarProps {
  onMenuPress: () => void;
  title?: string;
}

export function AppBar({ onMenuPress, title }: AppBarProps) {
  const { theme } = useAppContext();

  return (
    <Surface
      style={[styles.appBar, { backgroundColor: theme.colors.surface }]}
      elevation={2}
    >
      <SafeAreaView edges={["top"]} style={styles.appBarSafeArea}>
        <View style={styles.appBarContent}>
          {/* Sidebar Menu Button - integrated into app bar */}
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: theme.colors.primary }]}
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <IconSymbol
              name="gear"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* App Title */}
          {title && (
            <View style={styles.titleContainer}>
              <IconSymbol
                name="book.closed"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                {title}
              </Text>
            </View>
          )}

          {/* Spacer for centering */}
          <View style={styles.spacer} />
        </View>
      </SafeAreaView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  safeArea: {
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    justifyContent: "center", // Center the navigation items
  },
  navItems: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  navItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  // AppBar styles
  appBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  appBarSafeArea: {
    backgroundColor: "transparent",
  },
  appBarContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Align to the right for RTL
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  spacer: {
    width: 40, // Same width as menu button for centering
  },
});
