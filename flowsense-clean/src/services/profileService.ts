import { api } from "./api";

export type ThemePreference =
  | "system"
  | "light"
  | "dark"
  | "amoled"
  | "ocean"
  | "emerald"
  | "purple"
  | "cyber";

export type RemoteNotificationSettings = {
  budgetAlerts: boolean;
  goalReminders: boolean;
  recurringReminders: boolean;
  salaryReminders: boolean;
  monthlySummary: boolean;
  customReminders: boolean;
};

export type RemoteProfile = {
  id: string;
  name: string;
  email: string;
  themePreference?: ThemePreference;
  currency?: string;
  notificationSettings?: RemoteNotificationSettings;
};

export const getProfile = async (): Promise<RemoteProfile> => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const updateProfileSettings = async (
  payload: Partial<RemoteProfile>
) => {
  const response = await api.put(
    "/auth/profile",
    payload
  );

  return response.data as RemoteProfile;
};
