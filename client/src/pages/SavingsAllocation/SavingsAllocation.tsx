import {
  type CSSProperties,
  useEffect,
  useState,
} from "react";

import {
  allocateSavings,
  getSavingsAllocationSummary,
} from "../../services/savingsAllocationService";
import type {
  GoalAllocationInput,
  SavingsAllocationSummary,
  SavingsGoal,
} from "../../types/finance";
import {
  formatCurrency,
  getGoalProgress,
} from "../../utils/finance";

const emptySummary: SavingsAllocationSummary =
  {
    budget: 0,
    spent: 0,
    remaining: 0,
    goals: [],
  };

export default function SavingsAllocation() {
  const [summary, setSummary] =
    useState<SavingsAllocationSummary>(
      emptySummary
    );
  const [allocations, setAllocations] =
    useState<Record<string, string>>(
      {}
    );
  const [loading, setLoading] =
    useState(true);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");

  const loadSummary = async () => {
    try {
      setError("");
      const data =
        await getSavingsAllocationSummary();
      setSummary(data);
    } catch (loadError) {
      setError(
        getErrorMessage(loadError)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const activeGoals = summary.goals.filter(
    (goal) => goal.saved < goal.target
  );

  const totalAllocation = activeGoals.reduce(
    (sum, goal) =>
      sum +
      Number(
        allocations[goal.id] || 0
      ),
    0
  );

  const remainingAfterAllocation =
    summary.remaining -
    totalAllocation;

  const handleAllocationChange = (
    goalId: string,
    value: string
  ) => {
    setSuccess("");
    setError("");

    if (
      value !== "" &&
      Number(value) < 0
    ) {
      return;
    }

    setAllocations((current) => ({
      ...current,
      [goalId]: value,
    }));
  };

  const buildPayload = () => {
    return activeGoals.reduce<
      GoalAllocationInput[]
    >((items, goal) => {
      const amount = Number(
        allocations[goal.id] || 0
      );

      if (amount > 0) {
        items.push({
          goalId: goal.id,
          amount,
        });
      }

      return items;
    }, []);
  };

  const validateAllocations = (
    goals: SavingsGoal[]
  ) => {
    const payload = buildPayload();

    if (payload.length === 0) {
      return "Enter at least one allocation amount";
    }

    if (
      totalAllocation >
      summary.remaining
    ) {
      return "Total allocation cannot exceed remaining budget";
    }

    for (const item of payload) {
      const goal = goals.find(
        (entry) =>
          entry.id === item.goalId
      );

      if (!goal) {
        return "One of the selected goals could not be found";
      }

      const needed =
        goal.target - goal.saved;

      if (item.amount > needed) {
        return `${goal.title} only needs ${formatCurrency(
          needed
        )} more`;
      }
    }

    return "";
  };

  const handleSubmit = async () => {
    setSuccess("");
    const validationMessage =
      validateAllocations(activeGoals);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = buildPayload();

      await allocateSavings(payload);

      setAllocations({});
      setSuccess(
        "Savings allocated successfully."
      );

      await loadSummary();
    } catch (submitError) {
      setError(
        getErrorMessage(submitError)
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gap: "24px",
      }}
    >
      <section>
        <h1
          style={{ marginBottom: "8px" }}
        >
          Savings allocation
        </h1>

        <p
          style={{
            margin: 0,
            color: "#6f6a61",
            maxWidth: "720px",
          }}
        >
          Move unused monthly budget
          into active savings goals at
          month end without turning
          FlowSense into an accounting
          ledger.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
        }}
      >
        {[
          {
            label: "Current budget",
            value: formatCurrency(
              summary.budget
            ),
          },
          {
            label: "Spent this month",
            value: formatCurrency(
              summary.spent
            ),
          },
          {
            label: "Remaining to allocate",
            value: formatCurrency(
              summary.remaining
            ),
          },
        ].map((card) => (
          <article
            key={card.label}
            style={statCardStyle}
          >
            <p
              style={mutedTextStyle}
            >
              {card.label}
            </p>
            <h2
              style={{
                margin: "10px 0 0",
              }}
            >
              {loading
                ? "Loading..."
                : card.value}
            </h2>
          </article>
        ))}
      </section>

      <section
        style={{
          padding: "24px",
          borderRadius: "24px",
          background: "#fffaf1",
          border: "1px solid #ece3d6",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2
              style={{ margin: 0 }}
            >
              Allocation planner
            </h2>
            <p
              style={{
                ...mutedTextStyle,
                marginTop: "8px",
              }}
            >
              Total planned allocation:
              {" "}
              {formatCurrency(
                totalAllocation
              )}
            </p>
          </div>

          <div
            style={{
              textAlign: "right",
            }}
          >
            <p
              style={mutedTextStyle}
            >
              Remaining after submit
            </p>
            <strong>
              {formatCurrency(
                remainingAfterAllocation
              )}
            </strong>
          </div>
        </div>

        {error ? (
          <p
            style={{
              color: "#8b3024",
              marginTop: 0,
            }}
          >
            {error}
          </p>
        ) : null}

        {success ? (
          <p
            style={{
              color: "#1f6a41",
              marginTop: 0,
            }}
          >
            {success}
          </p>
        ) : null}

        {loading ? (
          <p>Loading allocation data...</p>
        ) : activeGoals.length === 0 ? (
          <p>
            No active savings goals are
            available for allocation.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            {activeGoals.map((goal) => {
              const progress =
                getGoalProgress(goal);
              const remainingGoalAmount =
                goal.target - goal.saved;

              return (
                <article
                  key={goal.id}
                  style={goalCardStyle}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin:
                            "0 0 8px",
                        }}
                      >
                        {goal.title}
                      </h3>
                      <p
                        style={mutedTextStyle}
                      >
                        {formatCurrency(
                          goal.saved
                        )}{" "}
                        saved of{" "}
                        {formatCurrency(
                          goal.target
                        )}
                      </p>
                    </div>

                    <div
                      style={{
                        minWidth:
                          "180px",
                      }}
                    >
                      <p
                        style={mutedTextStyle}
                      >
                        Still needed
                      </p>
                      <strong>
                        {formatCurrency(
                          remainingGoalAmount
                        )}
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "14px",
                      background: "#eadfce",
                      borderRadius:
                        "999px",
                      overflow: "hidden",
                      margin:
                        "14px 0 16px",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        background:
                          "linear-gradient(90deg, #1f433e 0%, #8fc09b 100%)",
                      }}
                    />
                  </div>

                  <input
                    type="number"
                    min="0"
                    max={remainingGoalAmount}
                    placeholder="Allocation amount"
                    value={
                      allocations[
                        goal.id
                      ] || ""
                    }
                    onChange={(event) =>
                      handleAllocationChange(
                        goal.id,
                        event.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </article>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            submitting ||
            loading ||
            activeGoals.length === 0 ||
            summary.remaining <= 0
          }
          style={{
            ...buttonStyle,
            marginTop: "20px",
            opacity:
              submitting ||
              loading ||
              activeGoals.length === 0 ||
              summary.remaining <= 0
                ? 0.7
                : 1,
            cursor:
              submitting ||
              loading ||
              activeGoals.length === 0 ||
              summary.remaining <= 0
                ? "not-allowed"
                : "pointer",
          }}
        >
          {submitting
            ? "Allocating..."
            : "Allocate Savings"}
        </button>
      </section>
    </div>
  );
}

function getErrorMessage(
  error: unknown
) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    return (
      response.response?.data
        ?.message ||
      "Something went wrong while processing the allocation"
    );
  }

  return "Something went wrong while processing the allocation";
}

const statCardStyle = {
  padding: "20px",
  borderRadius: "20px",
  background: "#ffffff",
  border: "1px solid #ece3d6",
} satisfies CSSProperties;

const goalCardStyle = {
  padding: "20px",
  borderRadius: "20px",
  background: "#ffffff",
  border: "1px solid #ece3d6",
} satisfies CSSProperties;

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #d9cfbf",
  background: "#fffdf9",
} satisfies CSSProperties;

const buttonStyle = {
  padding: "12px 18px",
  borderRadius: "12px",
  border: "none",
  background: "#1f433e",
  color: "#fffaf1",
  fontWeight: 700,
} satisfies CSSProperties;

const mutedTextStyle = {
  margin: 0,
  color: "#6f6a61",
} satisfies CSSProperties;
