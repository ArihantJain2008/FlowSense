import {
  type CSSProperties,
  useEffect,
  useState,
} from "react";

import {
  createGoal,
  getGoals,
} from "../../services/savingsGoalService";
import type { SavingsGoal } from "../../types/finance";
import {
  formatCurrency,
  getGoalProgress,
} from "../../utils/finance";

export default function SavingsGoals() {
  const [goals, setGoals] =
    useState<SavingsGoal[]>([]);
  const [goalTitle, setGoalTitle] =
    useState("");
  const [goalTarget, setGoalTarget] =
    useState("");
  const [loading, setLoading] =
    useState(true);

  const loadGoals = async () => {
    try {
      const goalsData =
        await getGoals();
      setGoals(goalsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal =
    async () => {
      if (!goalTitle || !goalTarget) {
        return;
      }

      try {
        await createGoal({
          title: goalTitle,
          target: Number(
            goalTarget
          ),
        });

        setGoalTitle("");
        setGoalTarget("");

        await loadGoals();
      } catch (error) {
        console.error(error);
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
          in real numbers.
        </p>
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
          style={buttonStyle}
        >
          Create Goal
        </button>
      </section>

      <section>
        <h2
          style={{ marginBottom: "16px" }}
        >
          Goal listing
        </h2>

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

                    <strong>
                      {progress.toFixed(
                        1
                      )}
                      % complete
                    </strong>
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
