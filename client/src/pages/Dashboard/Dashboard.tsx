import {
  useEffect,
  useState,
} from "react";

import {
  getExpenses,
  createExpense,
  deleteExpense,
} from "../../services/expenseService";

import {
  getBudgetSummary,
  setBudget,
} from "../../services/budgetService";

import {
  getAnalytics,
} from "../../services/analyticsService";

import AnalyticsChart from "../../components/AnalyticsChart";

import type { Expense } from "../../types/expense";

import {
  getRecurringExpenses,
  createRecurringExpense,
  deleteRecurringExpense,
} from "../../services/recurringExpenseService";

interface BudgetSummary {
  budget: number;
  spent: number;
  remaining: number;
}

interface AnalyticsItem {
  category: string;
  amount: number;
}

interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  frequency: string;
}

export default function Dashboard() {
  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [analytics, setAnalytics] =
    useState<AnalyticsItem[]>([]);

  const [summary, setSummary] =
    useState<BudgetSummary>({
      budget: 0,
      spent: 0,
      remaining: 0,
    });

  const [budgetAmount,
    setBudgetAmount] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState("");

  const loadData = async () => {
  try {
    const expensesData =
      await getExpenses();

    const summaryData =
      await getBudgetSummary();

    const analyticsData =
      await getAnalytics();

    const recurringData =
      await getRecurringExpenses();

    setExpenses(expensesData);

    setSummary(summaryData);

    setAnalytics(
      analyticsData
    );

    setRecurringExpenses(
      recurringData
    );
  } catch (error) {
    console.error(error);
  }
};

  const [
  recurringExpenses,
  setRecurringExpenses,
] = useState<
  RecurringExpense[]
>([]);

const [
  recurringTitle,
  setRecurringTitle,
] = useState("");

const [
  recurringAmount,
  setRecurringAmount,
] = useState("");

const [
  recurringCategory,
  setRecurringCategory,
] = useState("");

const [
  recurringFrequency,
  setRecurringFrequency,
] = useState("Monthly");

  useEffect(() => {
    loadData();
  }, []);

  const handleSetBudget =
    async () => {
      try {
        if (!budgetAmount) return;

        await setBudget(
          Number(budgetAmount)
        );

        setBudgetAmount("");

        await loadData();
      } catch (error) {
        console.error(error);
      }
    };

  const handleAddExpense =
    async () => {
      try {
        if (
          !title ||
          !amount ||
          !category
        ) {
          return;
        }

        await createExpense({
          title,
          amount: Number(amount),
          category,
        });

        setTitle("");
        setAmount("");
        setCategory("");

        await loadData();
      } catch (error) {
        console.error(error);
      }
    };

  const handleDelete =
    async (id: string) => {
      try {
        await deleteExpense(id);

        await loadData();
      } catch (error) {
        console.error(error);
      }
    };

    const handleAddRecurring =
  async () => {
    try {
      await createRecurringExpense({
        title:
          recurringTitle,
        amount: Number(
          recurringAmount
        ),
        category:
          recurringCategory,
        frequency:
          recurringFrequency,
      });

      setRecurringTitle("");
      setRecurringAmount("");
      setRecurringCategory("");

      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteRecurring =
  async (id: string) => {
    try {
      await deleteRecurringExpense(
        id
      );

      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const totalSubscriptions =
  recurringExpenses.reduce(
    (sum, item) =>
      sum + item.amount,
    0
  );

  const progress =
    summary.budget > 0
      ? Math.min(
          (summary.spent /
            summary.budget) *
            100,
          100
        )
      : 0;

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h1>FlowSense Dashboard</h1>

      <hr />

      <h2>Set Monthly Budget</h2>

      <input
        type="number"
        placeholder="Budget Amount"
        value={budgetAmount}
        onChange={(e) =>
          setBudgetAmount(
            e.target.value
          )
        }
      />

      <button
        onClick={
          handleSetBudget
        }
      >
        Save Budget
      </button>

      <hr />

      <h2>Monthly Summary</h2>

      <p>
        Budget: ₹
        {summary.budget}
      </p>

      <p>
        Spent: ₹
        {summary.spent}
      </p>

      <p>
        Remaining: ₹
        {summary.remaining}
      </p>

      <div
        style={{
          width: "100%",
          height: "20px",
          background: "#ddd",
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#22c55e",
          }}
        />
      </div>

      <p>
        {progress.toFixed(1)}%
        Used
      </p>

      <hr />

      <h2>Add Expense</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) =>
          setTitle(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) =>
          setAmount(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <select
        value={category}
        onChange={(e) =>
          setCategory(
            e.target.value
          )
        }
      >
        <option value="">
          Select Category
        </option>

        <option value="Food">
          Food
        </option>

        <option value="Transport">
          Transport
        </option>

        <option value="Shopping">
          Shopping
        </option>

        <option value="Bills">
          Bills
        </option>

        <option value="Entertainment">
          Entertainment
        </option>

        <option value="Health">
          Health
        </option>

        <option value="Education">
          Education
        </option>

        <option value="Other">
          Other
        </option>
      </select>

      <br />
      <br />

      <button
        onClick={
          handleAddExpense
        }
      >
        Add Expense
      </button>

      <hr />

<h2>
        Recent Expenses
      </h2>

      {expenses.length === 0 ? (
        <p>
          No expenses found
        </p>
      ) : (
        expenses.map(
          (expense) => (
            <div
              key={expense.id}
              style={{
                border:
                  "1px solid #ccc",
                padding: "10px",
                marginBottom:
                  "10px",
                borderRadius:
                  "8px",
              }}
            >
              <h3>
                {expense.title}
              </h3>

              <p>
                Amount: ₹
                {expense.amount}
              </p>

              <p>
                Category:{" "}
                {expense.category}
              </p>

              <button
                onClick={() =>
                  handleDelete(
                    expense.id
                  )
                }
              >
                Delete
              </button>
            </div>
          )
        )
      )}

      <h2>
        Spending Analytics
      </h2>

<p>
  Monthly Subscription Cost:
  ₹
  {
    totalSubscriptions
  }
</p>

      <AnalyticsChart
        data={analytics}
      />

      <hr />

      <hr />

<h2>
  Subscription Tracker
</h2>

<input
  placeholder="Netflix"
  value={recurringTitle}
  onChange={(e) =>
    setRecurringTitle(
      e.target.value
    )
  }
/>

<br />
<br />

<input
  type="number"
  placeholder="Amount"
  value={recurringAmount}
  onChange={(e) =>
    setRecurringAmount(
      e.target.value
    )
  }
/>

<br />
<br />

<select
  value={recurringCategory}
  onChange={(e) =>
    setRecurringCategory(
      e.target.value
    )
  }
>
  <option value="">
    Category
  </option>

  <option value="Entertainment">
    Entertainment
  </option>

  <option value="Health">
    Health
  </option>

  <option value="Bills">
    Bills
  </option>

  <option value="Other">
    Other
  </option>
</select>

<br />
<br />

<select
  value={recurringFrequency}
  onChange={(e) =>
    setRecurringFrequency(
      e.target.value
    )
  }
>
  <option value="Monthly">
    Monthly
  </option>

  <option value="Yearly">
    Yearly
  </option>
</select>

<br />
<br />

<button
  onClick={
    handleAddRecurring
  }
>
  Add Subscription
</button>

<hr />

{recurringExpenses.map(
  (subscription) => (
    <div
      key={subscription.id}
    >
      <h4>
        {
          subscription.title
        }
      </h4>

      <p>
        ₹
        {
          subscription.amount
        }
        /
        {
          subscription.frequency
        }
      </p>

      <button
        onClick={() =>
          handleDeleteRecurring(
            subscription.id
          )
        }
      >
        Delete
      </button>
    </div>
  )
)}
    </div>
  );
}