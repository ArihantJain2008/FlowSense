import { Alert, Platform, ToastAndroid } from "react-native";

export const useToast = () => {
  return {
    showSuccess: (message: string) => {
      if (Platform.OS === "android") {
        ToastAndroid.show(message, ToastAndroid.SHORT);
        return;
      }

      Alert.alert("Success", message);
    },
    showError: (message: string) => {
      if (Platform.OS === "android") {
        ToastAndroid.show(message, ToastAndroid.SHORT);
        return;
      }

      Alert.alert("Error", message);
    },
  };
};
