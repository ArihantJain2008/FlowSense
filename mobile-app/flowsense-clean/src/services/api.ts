import { create } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = create({
  baseURL: "https://flowsense-09k3.onrender.com/api",
});

api.interceptors.request.use(
  async (config) => {
    const token =
      await AsyncStorage.getItem(
        "token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);
