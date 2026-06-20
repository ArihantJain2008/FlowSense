import api from "./api";

export const getAnalytics =
  async () => {
    const res =
      await api.get(
        "/expenses/analytics"
      );

    return res.data;
  };