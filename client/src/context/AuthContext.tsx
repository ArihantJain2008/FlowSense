import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res =
          await api.get("/auth/profile");

        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (
    email: string,
    password: string
  ) => {
    const res = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    localStorage.setItem(
      "token",
      res.data.token
    );

    setUser({
      id: res.data.id,
      name: res.data.name,
      email: res.data.email,
    });
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    const res = await api.post(
      "/auth/register",
      {
        name,
        email,
        password,
      }
    );

    localStorage.setItem(
      "token",
      res.data.token
    );

    setUser({
      id: res.data.id,
      name: res.data.name,
      email: res.data.email,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);