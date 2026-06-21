import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { STORAGE_KEYS } from "../constants/storage";
import {
  getProfile,
  loginUser,
  registerUser,
} from "../services/authService";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loaded: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<AuthUser>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | null>(
    null
  );

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [user, setUser] =
    useState<AuthUser | null>(null);
  const [token, setToken] = useState<
    string | null
  >(null);
  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [storedToken, storedUser] =
          await Promise.all([
            AsyncStorage.getItem(
              STORAGE_KEYS.token
            ),
            AsyncStorage.getItem(
              STORAGE_KEYS.user
            ),
          ]);

        if (storedToken) {
          setToken(storedToken);
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        if (storedToken) {
          try {
            const profile =
              await getProfile();
            setUser(profile);
            await AsyncStorage.setItem(
              STORAGE_KEYS.user,
              JSON.stringify(profile)
            );
          } catch {
            await AsyncStorage.multiRemove([
              STORAGE_KEYS.token,
              STORAGE_KEYS.user,
            ]);
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        setLoaded(true);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loaded,
      login: async (
        email: string,
        password: string
      ) => {
        const data = await loginUser(
          email,
          password
        );
        const nextUser = {
          id: data.id,
          name: data.name,
          email: data.email,
        };

        await AsyncStorage.multiSet([
          [STORAGE_KEYS.token, data.token],
          [
            STORAGE_KEYS.user,
            JSON.stringify(nextUser),
          ],
        ]);

        setToken(data.token);
        setUser(nextUser);

        return nextUser;
      },
      register: async (
        name: string,
        email: string,
        password: string
      ) => {
        await registerUser(
          name,
          email,
          password
        );
      },
      refreshProfile: async () => {
        const profile =
          await getProfile();
        setUser(profile);
        await AsyncStorage.setItem(
          STORAGE_KEYS.user,
          JSON.stringify(profile)
        );
      },
      logout: async () => {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.token,
          STORAGE_KEYS.user,
        ]);
        setToken(null);
        setUser(null);
      },
    }),
    [loaded, token, user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}
