import { Platform, ViewStyle } from 'react-native';
import { SymbolView, SymbolWeight } from 'expo-symbols';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// ✅ Define mapping directly and infer types
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',

  // TabLayout icons
  'book.closed': 'menu-book',
  'folder': 'folder',
  'person.2': 'people',
  'qrcode.viewfinder': 'qr-code-scanner',
  'gear': 'settings',
  'clock': 'history',
  'qrcode': 'qr-code',

  // Common icons
  'plus': 'add',
  'plus.circle': 'add-circle',
  'plus.square': 'add-box',
  'minus': 'remove',
  'checkmark': 'check',
  'checkmark.circle': 'check-circle',
  'checkmark.square': 'check-box',
  'xmark': 'close',
  'xmark.circle': 'cancel',
  'magnifyingglass': 'search',
  'bell': 'notifications',
  'person': 'person',
  'lock': 'lock',
  'unlock': 'lock-open',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
} as const;

// ✅ Infer valid icon names
export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  if (Platform.OS === 'ios') {
    // Render SF Symbols on iOS
    return (
      <SymbolView
        name={name as any}
        size={size}
        tintColor={color}
        weight={weight}
        style={style as StyleProp<ViewStyle>}
      />
    );
  }

  // ✅ Android/Web → use MaterialIcons
  const mapped = MAPPING[name] ?? 'help-outline';

  if (!MAPPING[name]) {
    console.warn(`Icon "${name}" not found in mapping. Falling back to "${mapped}".`);
  }

  return (
    <MaterialIcons
      color={color}
      size={size}
      name={mapped}
      style={style}
    />
  );
}
