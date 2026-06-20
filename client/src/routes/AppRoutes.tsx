import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "../components/layout/Layout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Analytics from "../pages/Analytics/Analytics";
import Dashboard from "../pages/Dashboard/Dashboard";
import Expenses from "../pages/Expenses/Expenses";
import SavingsAllocation from "../pages/SavingsAllocation/SavingsAllocation";
import SavingsGoals from "../pages/SavingsGoals/SavingsGoals";
import Subscriptions from "../pages/Subscriptions/Subscriptions";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/expenses"
            element={<Expenses />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/subscriptions"
            element={<Subscriptions />}
          />

          <Route
            path="/savings"
            element={<SavingsGoals />}
          />

          <Route
            path="/savings-allocation"
            element={<SavingsAllocation />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
