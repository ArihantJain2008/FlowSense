import { api } from "./api";

export const getGoals = async () => {
  const response =
    await api.get(
      "/savings-goals"
    );

  return response.data;
};

export const createGoal =
  async (
    title: string,
    target: number
  ) => {
    const response =
      await api.post(
        "/savings-goals",
        {
          title,
          target,
        }
      );

    return response.data;
  };

export const deleteGoal =
  async (id: string) => {
    const response =
      await api.delete(
        `/savings-goals/${id}`
      );

    return response.data;
  };