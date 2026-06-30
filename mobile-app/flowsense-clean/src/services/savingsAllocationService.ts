import { api } from "./api";

export const getAllocationSummary =
  async () => {
    const response =
      await api.get(
        "/savings-allocation/summary"
      );

    return response.data;
  };

export const allocateSavings =
  async (
    goalId: string,
    amount: number
  ) => {
    const response =
      await api.post(
        "/savings-allocation/allocate",
        {
          allocations: [
            {
              goalId,
              amount,
            },
          ],
        }
      );

    return response.data;
  };