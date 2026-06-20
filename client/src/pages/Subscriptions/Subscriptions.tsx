import {
  type CSSProperties,
  useEffect,
  useState,
} from "react";

import {
  createRecurringExpense,
  deleteRecurringExpense,
  getRecurringExpenses,
} from "../../services/recurringExpenseService";
import type { RecurringExpense } from "../../types/finance";
import {
  formatCurrency,
  subscriptionCategories,
  subscriptionFrequencies,
} from "../../utils/finance";

export default function Subscriptions() {
  const [
    recurringExpenses,
    setRecurringExpenses,
  ] = useState<RecurringExpense[]>(
    []
  );
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
  const [loading, setLoading] =
    useState(true);

  const loadSubscriptions =
    async () => {
      try {
        const recurringData =
          await getRecurringExpenses();
        setRecurringExpenses(
          recurringData
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleAddRecurring =
    async () => {
      if (
        !recurringTitle ||
        !recurringAmount ||
        !recurringCategory
      ) {
        return;
      }

      try {
        await createRecurringExpense({
          title: recurringTitle,
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
        setRecurringFrequency(
          "Monthly"
        );

        await loadSubscriptions();
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
        await loadSubscriptions();
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
          Subscriptions
        </h1>
        <p
          style={{
            margin: 0,
            color: "#6f6a61",
          }}
        >
          Keep recurring charges visible
          before they quietly eat into
          your monthly budget.
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
          Add subscription
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
            placeholder="Netflix"
            value={recurringTitle}
            onChange={(event) =>
              setRecurringTitle(
                event.target.value
              )
            }
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Amount"
            value={recurringAmount}
            onChange={(event) =>
              setRecurringAmount(
                event.target.value
              )
            }
            style={inputStyle}
          />

          <select
            value={recurringCategory}
            onChange={(event) =>
              setRecurringCategory(
                event.target.value
              )
            }
            style={inputStyle}
          >
            <option value="">
              Category
            </option>

            {subscriptionCategories.map(
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

          <select
            value={recurringFrequency}
            onChange={(event) =>
              setRecurringFrequency(
                event.target.value
              )
            }
            style={inputStyle}
          >
            {subscriptionFrequencies.map(
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
          onClick={
            handleAddRecurring
          }
          style={buttonStyle}
        >
          Add Subscription
        </button>
      </section>

      <section
        style={{
          padding: "20px 24px",
          borderRadius: "20px",
          background: "#fffaf1",
          border: "1px solid #ece3d6",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#6f6a61",
          }}
        >
          Monthly subscription total
        </p>
        <h2
          style={{
            margin: "10px 0 0",
          }}
        >
          {formatCurrency(
            totalSubscriptions
          )}
        </h2>
      </section>

      <section>
        <h2
          style={{ marginBottom: "16px" }}
        >
          Subscription list
        </h2>

        {loading ? (
          <p>
            Loading subscriptions...
          </p>
        ) : recurringExpenses.length ===
          0 ? (
          <p>No subscriptions found.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            {recurringExpenses.map(
              (subscription) => (
                <article
                  key={subscription.id}
                  style={{
                    padding: "20px",
                    borderRadius:
                      "18px",
                    background:
                      "#ffffff",
                    border:
                      "1px solid #ece3d6",
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    gap: "12px",
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
                      {
                        subscription.title
                      }
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color:
                          "#6f6a61",
                      }}
                    >
                      {
                        subscription.category
                      }{" "}
                      |{" "}
                      {
                        subscription.frequency
                      }
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
                        subscription.amount
                      )}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteRecurring(
                          subscription.id
                        )
                      }
                      style={
                        deleteButtonStyle
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              )
            )}
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
