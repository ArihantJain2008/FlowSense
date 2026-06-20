import {
  NavLink,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import "./layout.css";

const links = [
  {
    to: "/dashboard",
    label: "Dashboard",
  },
  {
    to: "/expenses",
    label: "Expenses",
  },
  {
    to: "/analytics",
    label: "Analytics",
  },
  {
    to: "/subscriptions",
    label: "Subscriptions",
  },
  {
    to: "/savings",
    label: "Savings Goals",
  },
  {
    to: "/savings-allocation",
    label: "Savings Allocation",
  },
];

export default function Layout() {
  const { logout, user } = useAuth();

  return (
    <div
      className="app-layout"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f7f3ec 0%, #fffdf8 100%)",
      }}
    >
      <aside
        className="app-layout__sidebar"
        style={{
          padding: "24px 20px",
          borderRight:
            "1px solid #e7dfd1",
          background:
            "linear-gradient(180deg, #18332f 0%, #0f2220 100%)",
          color: "#f5efe4",
        }}
      >
        <div
          style={{
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.75rem",
            }}
          >
            FlowSense
          </h2>

          <p
            style={{
              margin: "10px 0 0",
              color: "#cdd9d2",
              lineHeight: 1.5,
            }}
          >
            Track spending,
            subscriptions, and goals
            from one focused workspace.
          </p>
        </div>

        <div
          style={{
            marginBottom: "24px",
            padding: "14px 16px",
            borderRadius: "16px",
            background:
              "rgba(255,255,255,0.08)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.85rem",
              color: "#cdd9d2",
            }}
          >
            Signed in as
          </p>

          <p
            style={{
              margin: "6px 0 0",
              fontWeight: 600,
            }}
          >
            {user?.name ?? user?.email}
          </p>
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({
                isActive,
              }) => ({
                textDecoration: "none",
                padding:
                  "12px 14px",
                borderRadius:
                  "12px",
                color: isActive
                  ? "#10211f"
                  : "#f5efe4",
                background: isActive
                  ? "#f3e7d4"
                  : "transparent",
                fontWeight: 600,
                border: isActive
                  ? "1px solid #e8d4b8"
                  : "1px solid transparent",
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={logout}
          style={{
            marginTop: "24px",
            width: "100%",
            border: "1px solid #486661",
            background: "transparent",
            color: "#f5efe4",
            borderRadius: "12px",
            padding: "12px 14px",
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </aside>

      <main
        className="app-layout__content"
        style={{
          padding: "32px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
