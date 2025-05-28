import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import CustomerPage from "./pages/CustomerPage";
import CustomerProfile from "./pages/CustomerProfile";
import FinancialProducts from "./pages/FinancialProducts";
import CreateLoan from "./pages/CreateLoan";
import CreateCustomer from "./pages/CreateCustomer";
import LoanApprovals from "./pages/LoanApprovals";
import AccountingEntries from "./pages/AccountingEntries";
import RegisterPayment from "./pages/RegisterPayment";
import LoanStatement from "./pages/LoanStatement";
import CustomerDirectory from "./pages/CustomerDirectory";
import PublicRegister from "./pages/PublicRegister";
import AdminPromotions from "./pages/AdminPromotions";
import AdminExpenses from "./pages/AdminExpenses";
import ProfitSummary from "./pages/ProfitSummary";
import BalanceSheet from "./pages/BalanceSheet";
import InventoryRequest from "./pages/InventoryRequest"; // fixed export
import AdminApprovals from "./pages/AdminApprovals";
import AdminInventoryViewer from "./pages/AdminInventoryViewer";
import AdminManualEntry from "./pages/AdminManualEntry";
import Tesoreria from "./pages/Tesorería";
import IncomeStatement from "./pages/IncomeStatement";
import RecepcionInventario from "./pages/RecepcionInventario";
import AssignIMEI from "./pages/AssignIMEI";
import GenerateContract from "./pages/GenerateContract";
import LoanQuotes from "./pages/LoanQuotes";
import AccountBalances from "./pages/AccountBalances";
import LoanRequest from "./pages/LoanRequest";
import InvestigationsDashboard from "./pages/InvestigationsDashboard";
import InvestigationStepper from "./pages/InvestigationStepper";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/auth" replace />;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload || !payload.id) throw new Error("Invalid token payload");
    return children;
  } catch {
    return <Navigate to="/auth" replace />;
  }
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/auth" replace />;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "admin") return <Navigate to="/dashboard" replace />;
    return children;
  } catch {
    return <Navigate to="/auth" replace />;
  }
};

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/investigation" element={<LoanRequest />} />
      <Route path="/investigation-stepper" element={<InvestigationStepper />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      <Route path="/customer/:id" element={<ProtectedRoute><CustomerProfile /></ProtectedRoute>} />
      <Route path="/financial-products" element={<ProtectedRoute><FinancialProducts /></ProtectedRoute>} />
      <Route path="/create-loan" element={<ProtectedRoute><CreateLoan /></ProtectedRoute>} />
      <Route path="/create-customer" element={<ProtectedRoute><CreateCustomer /></ProtectedRoute>} />
      <Route path="/admin/loans" element={<AdminRoute><LoanApprovals /></AdminRoute>} />
      <Route path="/accounting" element={<AdminRoute><AccountingEntries /></AdminRoute>} />
      <Route path="/register-payment" element={<ProtectedRoute><RegisterPayment /></ProtectedRoute>} />
      <Route path="/loan/:id/statement" element={<ProtectedRoute><LoanStatement /></ProtectedRoute>} />
      <Route path="/crm" element={<ProtectedRoute><CustomerDirectory /></ProtectedRoute>} />
      <Route path="/registro" element={<PublicRegister />} />
      <Route path="/admin/promotions" element={<AdminRoute><AdminPromotions /></AdminRoute>} />
      <Route path="/admin/expenses" element={<AdminRoute><AdminExpenses /></AdminRoute>} />
      <Route path="/admin/profit" element={<AdminRoute><ProfitSummary /></AdminRoute>} />
      <Route path="/admin/balance-sheet" element={<AdminRoute><BalanceSheet /></AdminRoute>} />
      <Route path="/admin/inventory-request" element={<AdminRoute><InventoryRequest /></AdminRoute>} />
      <Route path="/admin/account-balances" element={<AdminRoute><AccountBalances /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
      <Route path="/admin/inventory" element={<AdminInventoryViewer />} />
      <Route
        path="/admin/aprobaciones"
        element={
          <AdminRoute>
            <AdminApprovals />
          </AdminRoute>
        }
      />
      <Route
        path="/inventory-request"
        element={
          <ProtectedRoute>
            <InventoryRequest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/balance-sheet"
        element={
          <AdminRoute>
            <BalanceSheet />
          </AdminRoute>
        }
      />
      <Route path="/admin/manual-entry" element={<AdminRoute><AdminManualEntry /></AdminRoute>} />
      <Route path="/admin/tesoreria" element={<AdminRoute><Tesoreria /></AdminRoute>} />
      <Route path="/warehouse/reception" element={<ProtectedRoute><RecepcionInventario /></ProtectedRoute>} />
      <Route
        path="/income-statement"
        element={
          <AdminRoute>
            <IncomeStatement />
          </AdminRoute>
        }
      />
      <Route path="/admin/assign-imei" element={<AdminRoute><AssignIMEI /></AdminRoute>} />
      <Route path="/admin/generate-contract" element={<AdminRoute><GenerateContract /></AdminRoute>} />
      <Route path="/loan-quotes" element={<ProtectedRoute><LoanQuotes /></ProtectedRoute>} />
      <Route path="/admin/investigations" element={<AdminRoute><InvestigationsDashboard /></AdminRoute>} />
    </Routes>
  </Router>
);


     
export default AppRouter;