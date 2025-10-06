import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LightTheme, DarkTheme } from "@/constants/theme";

// TypeScript interfaces
export interface Category {
  id: number;
  name: string;
  color: string;
  description: string;
}

export interface Book {
  id: number;
  name: string;
  author: string;
  description: string;
  price: number;
  category: number;
  available: boolean;
}

export interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  password?: string;
  phone: string;
  mainChurch: string;
  fatherOfConfession: string;
  role: "admin" | "user";
}

export interface BorrowRecord {
  id: number;
  userId: number;
  bookId: number;
  borrowDate: string;
  returnDate: string;
  price: number;
  status: "active" | "returned" | "overdue";
}

interface AppContextType {
  // Authentication
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: Omit<User, "id">) => Promise<boolean>;

  // Theme Management
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  theme: typeof LightTheme | typeof DarkTheme;

  // Notification Settings
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: number, category: Partial<Category>) => void;
  deleteCategory: (id: number) => void;

  // Books
  books: Book[];
  addBook: (book: Omit<Book, "id">) => void;
  updateBook: (id: number, book: Partial<Book>) => void;
  deleteBook: (id: number) => void;
  getBooksByCategory: (categoryId: number) => Book[];

  // Users
  users: User[];
  updateUser: (id: number, user: Partial<User>) => void;
  getUserById: (id: number) => User | undefined;

  // Borrow Records
  borrowRecords: BorrowRecord[];
  addBorrowRecord: (record: Omit<BorrowRecord, "id" | "status">) => boolean;
  getUserBorrowHistory: (userId: number) => BorrowRecord[];
  updateBorrowRecord: (id: number, record: Partial<BorrowRecord>) => void;
}

// Mock Data[]
const mockCategories: Category[] = [
  { id: 1, name: "روحيات", color: "#2196F3", description: "كتب روحية" },
  { id: 2, name: "لاهوت", color: "#F44336", description: "كتب لاهوتية" },
  {
    id: 3,
    name: "تاريخ الكنيسة",
    color: "#4CAF50",
    description: "كتب تاريخ الكنيسة",
  },
  {
    id: 4,
    name: "سير القديسين",
    color: "#9C27B0",
    description: "سير وحياة القديسين",
  },
];

const mockBooks: Book[] = [
  {
    id: 1,
    name: "حياة الصلاة",
    author: "ابونا متى",
    description: "تعليم عن الصلاة",
    price: 50,
    category: 1,
    available: true,
  },
  {
    id: 2,
    name: "مدخل في اللاهوت",
    author: "ابونا شنودة",
    description: "مقدمة في اللاهوت",
    price: 70,
    category: 2,
    available: true,
  },
  {
    id: 3,
    name: "الروح القدس",
    author: "ابونا بيشوي",
    description: "عن عمل الروح القدس",
    price: 60,
    category: 1,
    available: false,
  },
  {
    id: 4,
    name: "تاريخ الكنيسة القبطية",
    author: "د. رمزي",
    description: "تاريخ شامل للكنيسة القبطية",
    price: 80,
    category: 3,
    available: true,
  },
  {
    id: 5,
    name: "حياة القديس الأنبا أنطونيوس",
    author: "القديس أثناسيوس",
    description: "سيرة أبو الرهبان",
    price: 45,
    category: 4,
    available: true,
  },
];

const mockUsers: User[] = [
  {
    id: 1,
    name: "مينا",
    age: 22,
    email: "mina@mail.com",
    password: "123456",
    phone: "0100000000",
    mainChurch: "الكاتدرائية",
    fatherOfConfession: "ابونا يوسف",
    role: "user",
  },
  {
    id: 2,
    name: "جرجس",
    age: 30,
    email: "george@mail.com",
    password: "admin123",
    phone: "0101111111",
    mainChurch: "مارمرقس",
    fatherOfConfession: "ابونا بطرس",
    role: "admin",
  },
  {
    id: 3,
    name: "مريم",
    age: 25,
    email: "mary@mail.com",
    password: "123456",
    phone: "0102222222",
    mainChurch: "العذراء",
    fatherOfConfession: "ابونا يوحنا",
    role: "user",
  },
];

const mockBorrowRecords: BorrowRecord[] = [
  {
    id: 1,
    userId: 1,
    bookId: 1,
    borrowDate: "2024-01-01",
    returnDate: "2024-01-15",
    price: 50,
    status: "returned",
  },
  {
    id: 2,
    userId: 1,
    bookId: 3,
    borrowDate: "2024-01-10",
    returnDate: "2024-01-24",
    price: 60,
    status: "active",
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [borrowRecords, setBorrowRecords] =
    useState<BorrowRecord[]>(mockBorrowRecords);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load persisted data on app start
  useEffect(() => {
    if (!isInitialized) {
      loadPersistedData();
    }
  }, [isInitialized]);

  const loadPersistedData = async () => {
    try {
      setIsLoading(true);

      // Load all data in parallel
      const [savedUser, savedTheme] = await Promise.all([
        AsyncStorage.getItem("currentUser").catch(() => null),
        AsyncStorage.getItem("themePreference").catch(() => null),
      ]);

      // Process saved user
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
        } catch (e) {
          console.warn("Failed to parse saved user:", e);
        }
      }

      // Process saved theme
      if (savedTheme) {
        try {
          const themePreference = JSON.parse(savedTheme);
          setIsDarkMode(themePreference.isDarkMode ?? false);
        } catch (e) {
          console.warn("Failed to parse theme preference:", e);
        }
      }
    } catch (error) {
      console.error("Error loading persisted data:", error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const saveAuthToStorage = async (user: User | null) => {
    try {
      if (user) {
        const { password, ...userWithoutPassword } = user;
        await AsyncStorage.setItem(
          "currentUser",
          JSON.stringify(userWithoutPassword)
        );
      } else {
        await AsyncStorage.removeItem("currentUser");
      }
    } catch (error) {
      console.error("Error saving auth to storage:", error);
    }
  };

  const saveThemePreference = async (isDark: boolean) => {
    try {
      await AsyncStorage.setItem(
        "themePreference",
        JSON.stringify({ isDarkMode: isDark })
      );
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  // Theme functions
  const toggleTheme = () => {
    const newThemeValue = !isDarkMode;
    setIsDarkMode(newThemeValue);
    saveThemePreference(newThemeValue);
  };

  const setTheme = (isDark: boolean) => {
    setIsDarkMode(isDark);
    saveThemePreference(isDark);
  };

  // Authentication functions
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = users.find(
        (u) => u.email === email && u.password === password
      );
      if (user) {
        setCurrentUser(user);
        await saveAuthToStorage(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      await saveAuthToStorage(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const signup = async (userData: Omit<User, "id">): Promise<boolean> => {
    try {
      const existingUser = users.find((u) => u.email === userData.email);
      if (existingUser) {
        return false;
      }

      const newUser: User = {
        ...userData,
        id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      };

      setUsers((prev) => [...prev, newUser]);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  // Category functions
  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id:
        categories.length > 0
          ? Math.max(...categories.map((c) => c.id)) + 1
          : 1,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (id: number, category: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...category } : c))
    );
  };

  const deleteCategory = (id: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Book functions
  const addBook = (book: Omit<Book, "id">) => {
    const newBook: Book = {
      ...book,
      id: books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1,
    };
    setBooks((prev) => [...prev, newBook]);
  };

  const updateBook = (id: number, book: Partial<Book>) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...book } : b)));
  };

  const deleteBook = (id: number) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const getBooksByCategory = (categoryId: number): Book[] => {
    return books.filter((book) => book.category === categoryId);
  };

  // User functions
  const updateUser = (id: number, user: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...user } : u)));

    if (currentUser && currentUser.id === id) {
      const updatedUser = { ...currentUser, ...user };
      setCurrentUser(updatedUser);
      saveAuthToStorage(updatedUser);
    }
  };

  const getUserById = (id: number): User | undefined => {
    return users.find((u) => u.id === id);
  };

  // Borrow Record functions
  const addBorrowRecord = (
    record: Omit<BorrowRecord, "id" | "status">
  ): boolean => {
    try {
      const book = books.find((b) => b.id === record.bookId);
      if (!book || !book.available) {
        return false;
      }

      const user = users.find((u) => u.id === record.userId);
      if (!user) {
        return false;
      }

      const newRecord: BorrowRecord = {
        ...record,
        id:
          borrowRecords.length > 0
            ? Math.max(...borrowRecords.map((r) => r.id)) + 1
            : 1,
        status: "active",
      };

      setBorrowRecords((prev) => [...prev, newRecord]);
      setBooks((prev) =>
        prev.map((b) =>
          b.id === record.bookId ? { ...b, available: false } : b
        )
      );

      return true;
    } catch (error) {
      console.error("Error adding borrow record:", error);
      return false;
    }
  };

  const getUserBorrowHistory = (userId: number): BorrowRecord[] => {
    return borrowRecords.filter((record) => record.userId === userId);
  };

  const updateBorrowRecord = (id: number, record: Partial<BorrowRecord>) => {
    setBorrowRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...record } : r))
    );
  };

  const theme = isDarkMode ? DarkTheme : LightTheme;

  const value: AppContextType = {
    currentUser,
    isLoading,
    login,
    logout,
    signup,
    isDarkMode,
    toggleTheme,
    setTheme,
    theme,
    notificationsEnabled,
    soundEnabled,
    setNotificationsEnabled,
    setSoundEnabled,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    books,
    addBook,
    updateBook,
    deleteBook,
    getBooksByCategory,
    users,
    updateUser,
    getUserById,
    borrowRecords,
    addBorrowRecord,
    getUserBorrowHistory,
    updateBorrowRecord,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
