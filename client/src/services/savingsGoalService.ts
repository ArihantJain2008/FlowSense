import api from "./api";

export const getGoals = async () => {
  const res = await api.get(
    "/savings-goals"
  );

  return res.data;
};

export const createGoal =
  async (data: {
    title: string;
    target: number;
  }) => {
    const res = await api.post(
      "/savings-goals",
      data
    );

    return res.data;
  };

export const updateGoal =
  async (
    id: string,
    saved: number
  ) => {
    const res = await api.put(
      `/savings-goals/${id}`,
      { saved }
    );

    return res.data;
  };

export const deleteGoal =
  async (id: string) => {
    const res = await api.delete(
      `/savings-goals/${id}`
    );

    return res.data;
  };