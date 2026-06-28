import { create } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = create({
  baseURL: "http://192.168.29.52:5000/api",
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
