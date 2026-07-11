import { api } from "./api";

export const getGoals = async () => {
  const response = await api.get("/savings-goals");
  return response.data;
};

export const createGoal = async (
  title: string,
  target: number,
  monthlyContribution?: number,
  targetDate?: string
) => {
  const response = await api.post("/savings-goals", {
    title,
    target,
    monthlyContribution,
    targetDate,
  });

  return response.data;
};

export const updateGoal = async (
  id: string,
  payload: Record<string, unknown>
) => {
  const response = await api.put(
    `/savings-goals/${id}`,
    payload
  );

  return response.data;
};

export const deleteGoal = async (id: string) => {
  const response = await api.delete(`/savings-goals/${id}`);
  return response.data;
};
