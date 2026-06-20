import {
  type CSSProperties,
  useEffect,
  useState,
} from "react";

import {
  createExpense,
  deleteExpense,
  getExpenses,
} from "../../services/expenseService";
import type { Expense } from "../../types/expense";
import {
  expenseCategories,
  formatCurrency,
} from "../../utils/finance";

export default function Expenses() {
  const [expenses, setExpenses] =
    useState<Expense[]>([]);
  const [title, setTitle] =
    useState("");
  const [amount, setAmount] =
    useState("");
  const [category, setCategory] =
    useState("");
  const [loading, setLoading] =
    useState(true);

  const loadExpenses = async () => {
    try {
      const expensesData =
        await getExpenses();
      setExpenses(expensesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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

        await loadExpenses();
      } catch (error) {
        console.error(error);
      }
    };

  const handleDelete = async (
    id: string
  ) => {
    try {
      await deleteExpense(id);
      await loadExpenses();
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
          Expenses
        </h1>
        <p
          style={{
            margin: 0,
            color: "#6f6a61",
          }}
        >
          Capture new spending and
          review your latest expense
          entries.
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
          Add expense
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(event) =>
              setAmount(
                event.target.value
              )
            }
            style={inputStyle}
          />

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
            style={inputStyle}
          >
            <option value="">
              Select category
            </option>

            {expenseCategories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>
        </div>

        <button
          type="button"
          onClick={handleAddExpense}
          style={buttonStyle}
        >
          Add Expense
        </button>
      </section>

      <section>
        <h2
          style={{ marginBottom: "16px" }}
        >
          Expense list
        </h2>

        {loading ? (
          <p>Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p>No expenses found.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            {expenses.map((expense) => (
              <article
                key={expense.id}
                style={{
                  padding: "20px",
                  borderRadius: "18px",
                  background: "#ffffff",
                  border:
                    "1px solid #ece3d6",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin:
                        "0 0 6px",
                    }}
                  >
                    {expense.title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color:
                        "#6f6a61",
                    }}
                  >
                    {expense.category} |{" "}
                    {new Date(
                      expense.date
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "12px",
                  }}
                >
                  <strong>
                    {formatCurrency(
                      expense.amount
                    )}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        expense.id
                      )
                    }
                    style={deleteButtonStyle}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
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

const deleteButtonStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #dfc5c1",
  background: "#fff5f3",
  color: "#8b3024",
  cursor: "pointer",
} satisfies CSSProperties;
