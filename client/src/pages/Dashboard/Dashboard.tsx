import {
  useEffect,
  useState,
} from "react";

import {
  getExpenses,
  createExpense,
  deleteExpense,
} from "../../services/expenseService";

import type { Expense } from "../../types/expense";

export default function Dashboard() {
  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState("");

  const loadExpenses = async () => {
    const data =
      await getExpenses();

    setExpenses(data);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleAddExpense =
    async () => {
      if (
        !title ||
        !amount ||
        !category
      )
        return;

      await createExpense({
        title,
        amount: Number(amount),
        category,
      });

      setTitle("");
      setAmount("");
      setCategory("");

      loadExpenses();
    };

  const handleDelete =
    async (id: string) => {
      await deleteExpense(id);

      loadExpenses();
    };

  return (
    <div>
      <h1>FlowSense</h1>

      <h2>Add Expense</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value)
        }
      />

      <input
        placeholder="Category"
        value={category}
        onChange={(e) =>
          setCategory(e.target.value)
        }
      />

      <button
        onClick={
          handleAddExpense
        }
      >
        Add Expense
      </button>

      <hr />

      <h2>Expenses</h2>

      {expenses.map(
        (expense) => (
          <div
            key={expense.id}
          >
            <p>
              {
                expense.title
              }{" "}
              - ₹
              {
                expense.amount
              }{" "}
              (
              {
                expense.category
              }
              )
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
      )}
    </div>
  );
}