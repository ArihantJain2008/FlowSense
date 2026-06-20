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
} from "../../services/budgetService";

import type { Expense } from "../../types/expense";

interface BudgetSummary {
  budget: number;
  spent: number;
  remaining: number;
}

export default function Dashboard() {
  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [summary, setSummary] =
    useState<BudgetSummary>({
      budget: 0,
      spent: 0,
      remaining: 0,
    });

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

      setExpenses(expensesData);
      setSummary(summaryData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense =
    async () => {
      if (
        !title ||
        !amount ||
        !category
      ) {
        return;
      }

      try {
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
          setTitle(e.target.value)
        }
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value)
        }
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) =>
          setCategory(
            e.target.value
          )
        }
      />

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
                {
                  expense.amount
                }
              </p>

              <p>
                Category:{" "}
                {
                  expense.category
                }
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
    </div>
  );
}