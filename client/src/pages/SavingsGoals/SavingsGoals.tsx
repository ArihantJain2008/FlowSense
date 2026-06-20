import {
  type CSSProperties,
  useEffect,
  useState,
} from "react";
import {
  allocateSavings,
  getSavingsAllocationSummary,
} from "../../services/savingsAllocationService";

import {
  createGoal,
} from "../../services/savingsGoalService";
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

export default function SavingsGoals() {
  const [summary, setSummary] =
    useState<SavingsAllocationSummary>(
      emptySummary
    );
  const [goalTitle, setGoalTitle] =
    useState("");
  const [goalTarget, setGoalTarget] =
    useState("");
  const [allocations, setAllocations] =
    useState<Record<string, string>>(
      {}
    );
  const [loading, setLoading] =
    useState(true);
  const [creatingGoal, setCreatingGoal] =
    useState(false);
  const [submittingGoalId, setSubmittingGoalId] =
    useState<string | null>(null);
  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");

  const loadSavingsData = async () => {
    try {
      setError("");
      const summaryData =
        await getSavingsAllocationSummary();
      setSummary(summaryData);
    } catch (error) {
      setError(
        getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavingsData();
  }, []);

  const goals = summary.goals;

  const handleAllocationChange = (
    goalId: string,
    value: string
  ) => {
    setError("");
    setSuccess("");

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

  const validateAllocation = (
    goal: SavingsGoal,
    amount: number
  ) => {
    if (
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      return "Allocation amount must be positive";
    }

    if (amount > summary.remaining) {
      return "Allocation cannot exceed remaining budget";
    }

    const remainingGoalAmount =
      goal.target - goal.saved;

    if (amount > remainingGoalAmount) {
      return `${goal.title} only needs ${formatCurrency(
        remainingGoalAmount
      )} more`;
    }

    return "";
  };

  const handleCreateGoal =
    async () => {
      if (!goalTitle || !goalTarget) {
        return;
      }

      try {
        setCreatingGoal(true);
        setError("");
        setSuccess("");

        await createGoal({
          title: goalTitle,
          target: Number(
            goalTarget
          ),
        });

        setGoalTitle("");
        setGoalTarget("");
        setSuccess(
          "Savings goal created successfully."
        );

        await loadSavingsData();
      } catch (error) {
        setError(
          getErrorMessage(error)
        );
      } finally {
        setCreatingGoal(false);
      }
    };

  const handleAllocate = async (
    goal: SavingsGoal
  ) => {
    const amount = Number(
      allocations[goal.id] || 0
    );

    const validationMessage =
      validateAllocation(goal, amount);

    if (validationMessage) {
      setError(validationMessage);
      setSuccess("");
      return;
    }

    try {
      setSubmittingGoalId(goal.id);
      setError("");
      setSuccess("");

      const payload: GoalAllocationInput[] =
        [
          {
            goalId: goal.id,
            amount,
          },
        ];

      await allocateSavings(payload);

      setAllocations((current) => ({
        ...current,
        [goal.id]: "",
      }));
      setSuccess(
        `${formatCurrency(
          amount
        )} allocated to ${goal.title}.`
      );

      await loadSavingsData();
    } catch (error) {
      setError(
        getErrorMessage(error)
      );
    } finally {
      setSubmittingGoalId(null);
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
          Savings goals
        </h1>
        <p
          style={{
            margin: 0,
            color: "#6f6a61",
          }}
        >
          Create targets, watch your
          progress build, and keep
          longer-term purchases grounded
          in real numbers while using
          leftover monthly budget to
          fund them from the same page.
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
            label: "Monthly budget",
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
            label: "Remaining budget",
            value: formatCurrency(
              summary.remaining
            ),
          },
        ].map((card) => (
          <article
            key={card.label}
            style={{
              padding: "20px",
              borderRadius: "20px",
              background: "#ffffff",
              border:
                "1px solid #ece3d6",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6f6a61",
              }}
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
          background: "#ffffff",
          border: "1px solid #ece3d6",
        }}
      >
        <h2
          style={{ marginTop: 0 }}
        >
          Create goal
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          <input
            placeholder="Gaming PC"
            value={goalTitle}
            onChange={(event) =>
              setGoalTitle(
                event.target.value
              )
            }
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Target amount"
            value={goalTarget}
            onChange={(event) =>
              setGoalTarget(
                event.target.value
              )
            }
            style={inputStyle}
          />
        </div>

        <button
          type="button"
          onClick={
            handleCreateGoal
          }
          disabled={creatingGoal}
          style={{
            ...buttonStyle,
            opacity: creatingGoal
              ? 0.7
              : 1,
            cursor: creatingGoal
              ? "not-allowed"
              : "pointer",
          }}
        >
          {creatingGoal
            ? "Creating..."
            : "Create Goal"}
        </button>
      </section>

      <section>
        <h2
          style={{ marginBottom: "16px" }}
        >
          Goal listing
        </h2>

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
          <p>Loading goals...</p>
        ) : goals.length === 0 ? (
          <p>No savings goals yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            {goals.map((goal) => {
              const progress =
                getGoalProgress(goal);

              return (
                <article
                  key={goal.id}
                  style={{
                    padding: "20px",
                    borderRadius:
                      "20px",
                    background:
                      "#fffaf1",
                    border:
                      "1px solid #ece3d6",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom:
                        "12px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin:
                            "0 0 6px",
                        }}
                      >
                        {goal.title}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color:
                            "#6f6a61",
                        }}
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
                      <strong>
                        {progress.toFixed(
                          1
                        )}
                        % complete
                      </strong>

                      <p
                        style={{
                          margin:
                            "8px 0 0",
                          color:
                            "#6f6a61",
                        }}
                      >
                        {formatCurrency(
                          goal.target -
                            goal.saved
                        )}{" "}
                        still needed
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "14px",
                      borderRadius:
                        "999px",
                      overflow:
                        "hidden",
                      background:
                        "#eadfce",
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

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "minmax(0, 1fr) auto",
                      gap: "12px",
                      alignItems:
                        "center",
                      marginTop: "16px",
                    }}
                  >
                    <input
                      type="number"
                      min="0"
                      max={
                        goal.target -
                        goal.saved
                      }
                      placeholder={
                        goal.saved <
                        goal.target
                          ? "Allocation amount"
                          : "Goal completed"
                      }
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
                      disabled={
                        goal.saved >=
                        goal.target
                      }
                      style={{
                        ...inputStyle,
                        width: "100%",
                        boxSizing:
                          "border-box",
                        opacity:
                          goal.saved >=
                          goal.target
                            ? 0.7
                            : 1,
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleAllocate(
                          goal
                        )
                      }
                      disabled={
                        submittingGoalId ===
                          goal.id ||
                        summary.remaining <=
                          0 ||
                        goal.saved >=
                          goal.target
                      }
                      style={{
                        ...buttonStyle,
                        marginTop: 0,
                        opacity:
                          submittingGoalId ===
                            goal.id ||
                          summary.remaining <=
                            0 ||
                          goal.saved >=
                            goal.target
                            ? 0.7
                            : 1,
                        cursor:
                          submittingGoalId ===
                            goal.id ||
                          summary.remaining <=
                            0 ||
                          goal.saved >=
                            goal.target
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {submittingGoalId ===
                      goal.id
                        ? "Allocating..."
                        : "Allocate"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

const inputStyle = {
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #d9cfbf",
  background: "#fffdf9",
} satisfies CSSProperties;

const buttonStyle = {
  marginTop: "16px",
  padding: "12px 18px",
  borderRadius: "12px",
  border: "none",
  background: "#1f433e",
  color: "#fffaf1",
  fontWeight: 700,
  cursor: "pointer",
} satisfies CSSProperties;

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
      "Something went wrong while updating savings goals"
    );
  }

  return "Something went wrong while updating savings goals";
}
