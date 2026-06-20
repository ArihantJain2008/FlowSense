import api from "./api";
import type {
  GoalAllocationInput,
  SavingsAllocationSummary,
} from "../types/finance";

export const getSavingsAllocationSummary =
  async () => {
    const res =
      await api.get<SavingsAllocationSummary>(
        "/savings-allocation/summary"
      );

    return res.data;
  };

export const allocateSavings =
  async (
    allocations: GoalAllocationInput[]
  ) => {
    const res = await api.post(
      "/savings-allocation/allocate",
      {
        allocations,
      }
    );

    return res.data;
  };
