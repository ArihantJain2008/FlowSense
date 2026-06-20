import {
  useEffect,
  useState,
} from "react";

import AnalyticsChart from "../../components/AnalyticsChart";
import { getAnalytics } from "../../services/analyticsService";
import type { AnalyticsItem } from "../../types/finance";
import { formatCurrency } from "../../utils/finance";

export default function Analytics() {
  const [analytics, setAnalytics] =
    useState<AnalyticsItem[]>([]);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadAnalytics =
      async () => {
        try {
          const analyticsData =
            await getAnalytics();
          setAnalytics(analyticsData);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    loadAnalytics();
  }, []);

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
          Analytics
        </h1>
        <p
          style={{
            margin: 0,
            color: "#6f6a61",
          }}
        >
          View category-level spending
          patterns and spot where most
          of your money goes.
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
          Spending chart
        </h2>

        {loading ? (
          <p>Loading analytics...</p>
        ) : analytics.length === 0 ? (
          <p>No analytics data yet.</p>
        ) : (
          <AnalyticsChart
            data={analytics}
          />
        )}
      </section>

      <section>
        <h2
          style={{ marginBottom: "16px" }}
        >
          Category breakdown
        </h2>

        {loading ? (
          <p>Loading category totals...</p>
        ) : analytics.length === 0 ? (
          <p>No categories to show.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {analytics.map((item) => (
              <article
                key={item.category}
                style={{
                  padding: "20px",
                  borderRadius: "20px",
                  background: "#fffaf1",
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
                  {item.category}
                </p>

                <h3
                  style={{
                    margin:
                      "10px 0 0",
                  }}
                >
                  {formatCurrency(
                    item.amount
                  )}
                </h3>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
