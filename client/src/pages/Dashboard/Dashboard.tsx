import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getAnalytics } from "../../services/analyticsService";
import {
  getBudgetSummary,
  setBudget,
} from "../../services/budgetService";
import { getExpenses } from "../../services/expenseService";
import { getGoals } from "../../services/savingsGoalService";
import { getRecurringExpenses } from "../../services/recurringExpenseService";
import type { Expense } from "../../types/expense";
import type {
  AnalyticsItem,
  BudgetSummary,
  RecurringExpense,
  SavingsGoal,
} from "../../types/finance";
import {
  formatCurrency,
  getBudgetProgress,
  getTopCategory,
} from "../../utils/finance";

const emptySummary: BudgetSummary = {
  budget: 0,
  spent: 0,
  remaining: 0,
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] =
    useState<BudgetSummary>(
      emptySummary
    );
  const [analytics, setAnalytics] =
    useState<AnalyticsItem[]>([]);
  const [expenses, setExpenses] =
    useState<Expense[]>([]);
  const [
    recurringExpenses,
    setRecurringExpenses,
  ] = useState<RecurringExpense[]>(
    []
  );
  const [goals, setGoals] =
    useState<SavingsGoal[]>([]);
  const [budgetAmount, setBudgetAmount] =
    useState("");
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          summaryData,
          analyticsData,
          expensesData,
          recurringData,
          goalsData,
        ] = await Promise.all([
          getBudgetSummary(),
          getAnalytics(),
          getExpenses(),
          getRecurringExpenses(),
          getGoals(),
        ]);

        setSummary(summaryData);
        setAnalytics(analyticsData);
        setExpenses(expensesData);
        setRecurringExpenses(
          recurringData
        );
        setGoals(goalsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleSetBudget =
    async () => {
      if (!budgetAmount) {
        return;
      }

      try {
        await setBudget(
          Number(budgetAmount)
        );

        const summaryData =
          await getBudgetSummary();

        setSummary(summaryData);
        setBudgetAmount("");
      } catch (error) {
        console.error(error);
      }
    };

  const progress =
    getBudgetProgress(summary);
  const totalSubscriptions =
    recurringExpenses.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );
  const topCategory =
    getTopCategory(analytics);
  const totalGoalTarget =
    goals.reduce(
      (sum, goal) =>
        sum + goal.target,
      0
    );
  const totalSaved =
    goals.reduce(
      (sum, goal) =>
        sum + goal.saved,
      0
    );
  const activeGoals =
    goals.filter(
      (goal) => goal.saved < goal.target
    );

  return (
    <div
      style={{
        display: "grid",
        gap: "24px",
      }}
    >
      <section
        style={{
          padding: "28px",
          borderRadius: "24px",
          background:
            "linear-gradient(135deg, #1e433d 0%, #2d5a53 100%)",
          color: "#f7f3ea",
        }}
      >
        <p
          style={{
            margin: 0,
            opacity: 0.8,
          }}
        >
          Welcome back
        </p>

        <h1
          style={{
            margin:
              "8px 0 12px",
            fontSize:
              "clamp(2rem, 4vw, 3rem)",
          }}
        >
          {user?.name ?? "FlowSense user"}
        </h1>

        <p
          style={{
            maxWidth: "680px",
            lineHeight: 1.6,
            marginBottom: "24px",
          }}
        >
          Keep your monthly plan visible,
          stay ahead of recurring costs,
          and track progress toward your
          savings goals from one place.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="number"
            placeholder="Update monthly budget"
            value={budgetAmount}
            onChange={(event) =>
              setBudgetAmount(
                event.target.value
              )
            }
            style={{
              flex: "1 1 240px",
              padding:
                "12px 14px",
              borderRadius:
                "12px",
              border: "none",
            }}
          />

          <button
            type="button"
            onClick={
              handleSetBudget
            }
            style={{
              padding:
                "12px 18px",
              borderRadius:
                "12px",
              border: "none",
              background:
                "#f2dfc1",
              color: "#16302c",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Save Budget
          </button>
        </div>
      </section>

      <section>
        <h2
          style={{
            marginBottom: "16px",
          }}
        >
          Budget summary
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          {[
            {
              label: "Budget",
              value: formatCurrency(
                summary.budget
              ),
            },
            {
              label: "Spent",
              value: formatCurrency(
                summary.spent
              ),
            },
            {
              label: "Remaining",
              value: formatCurrency(
                summary.remaining
              ),
            },
            {
              label: "Subscription load",
              value: formatCurrency(
                totalSubscriptions
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
                boxShadow:
                  "0 12px 30px rgba(24, 51, 47, 0.08)",
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

              <h3
                style={{
                  margin:
                    "10px 0 0",
                  fontSize: "1.75rem",
                }}
              >
                {loading
                  ? "Loading..."
                  : card.value}
              </h3>
            </article>
          ))}
        </div>
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
              style={{
                margin:
                  "0 0 6px",
              }}
            >
              Monthly overview
            </h2>

            <p
              style={{
                margin: 0,
                color: "#6f6a61",
              }}
            >
              Track how much of your
              plan is already spoken
              for this month.
            </p>
          </div>

          <strong>
            {progress.toFixed(1)}% used
          </strong>
        </div>

        <div
          style={{
            width: "100%",
            height: "16px",
            borderRadius: "999px",
            overflow: "hidden",
            background: "#eadfce",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, #2d5a53 0%, #79a68c 100%)",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            color: "#3f3a33",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#6f6a61",
              }}
            >
              Monthly spent
            </p>
            <strong>
              {formatCurrency(
                summary.spent
              )}
            </strong>
          </div>

          <div>
            <p
              style={{
                margin: 0,
                color: "#6f6a61",
              }}
            >
              Left to spend
            </p>
            <strong>
              {formatCurrency(
                summary.remaining
              )}
            </strong>
          </div>

          <div>
            <p
              style={{
                margin: 0,
                color: "#6f6a61",
              }}
            >
              Top category
            </p>
            <strong>
              {topCategory
                ? `${topCategory.category} (${formatCurrency(
                    topCategory.amount
                  )})`
                : "No data yet"}
            </strong>
          </div>
        </div>
      </section>

      <section>
        <h2
          style={{
            marginBottom: "16px",
          }}
        >
          Quick stats
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {[
            {
              label: "Expense entries",
              value: `${expenses.length}`,
            },
            {
              label: "Active subscriptions",
              value: `${recurringExpenses.length}`,
            },
            {
              label: "Savings goals",
              value: `${goals.length}`,
            },
            {
              label: "Saved toward goals",
              value:
                totalGoalTarget > 0
                  ? `${formatCurrency(
                      totalSaved
                    )} of ${formatCurrency(
                      totalGoalTarget
                    )}`
                  : "No goals yet",
            },
          ].map((item) => (
            <article
              key={item.label}
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
                {item.label}
              </p>

              <h3
                style={{
                  margin:
                    "10px 0 0",
                  fontSize: "1.4rem",
                }}
              >
                {loading
                  ? "Loading..."
                  : item.value}
              </h3>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "24px",
          borderRadius: "24px",
          background:
            "linear-gradient(135deg, #f4ead6 0%, #fff8ec 100%)",
          border: "1px solid #ece3d6",
          display: "flex",
          justifyContent:
            "space-between",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#6f6a61",
            }}
          >
            Month-End Savings Allocation
          </p>
          <h2
            style={{
              margin: "10px 0 8px",
            }}
          >
            {formatCurrency(
              summary.remaining
            )}{" "}
            available
          </h2>
          <p
            style={{
              margin: 0,
              color: "#6f6a61",
            }}
          >
            {activeGoals.length} active
            goal
            {activeGoals.length === 1
              ? ""
              : "s"}{" "}
            ready for month-end funding.
          </p>
        </div>

        <Link
          to="/savings-allocation"
          style={{
            textDecoration: "none",
            padding: "12px 18px",
            borderRadius: "12px",
            background: "#1f433e",
            color: "#fffaf1",
            fontWeight: 700,
          }}
        >
          Open Allocation Page
        </Link>
      </section>
    </div>
  );
}
