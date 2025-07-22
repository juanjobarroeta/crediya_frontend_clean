import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState({});
  const [paymentAmount, setPaymentAmount] = useState({});
  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState({
    customers: 0,
    loansIssued: 0,
    capitalLoaned: 0,
    interestToCollect: 0,
    overdueAmount: 0,
    customersOverdue: 0,
  });
  const [overdueTrends, setOverdueTrends] = useState([]);
  const [cashflowPeriod, setCashflowPeriod] = useState("week");
  const token = localStorage.getItem("token");

  const fetchLoans = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/loans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("LOANS FROM BACKEND:", res.data); // 👈 Add this line
      setLoans(res.data);
    } catch (err) {
      console.error("Error fetching loans:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchPayments = async (loanId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/dashboard/payments/${loanId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments((prev) => ({ ...prev, [loanId]: res.data }));
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  const handlePaymentChange = (loanId, value) => {
    setPaymentAmount((prev) => ({ ...prev, [loanId]: value }));
  };

  const submitPayment = async (loanId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/make-payment`,
        { loan_id: loanId, amount: paymentAmount[loanId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPayments(loanId);
      alert("Pago registrado con éxito");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error al procesar el pago");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  useEffect(() => {
    fetchLoans();
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard-metrics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("📊 METRICS FROM BACKEND:", res.data);
        // Map backend keys to frontend keys
        const mapped = {
          customers: res.data.customers,
          loansIssued: res.data.loansIssued,
          capitalLoaned: res.data.capitalLoaned,
          interestToCollect: res.data.interestToCollect,
          overdueAmount: res.data.overdueAmount,
          customersOverdue: res.data.customersOverdue,
          overdueCustomersTable: res.data.overdueCustomersTable || [],
          totalCollectedToday: res.data.totalCollectedToday,
          totalDisbursedToday: res.data.totalDisbursedToday,
          netCashFlowToday: res.data.netCashFlowToday,
          storeComparison: res.data.storeComparison || [],
        };
        setMetrics(mapped);
      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
      }
    };
    const fetchTrends = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard/overdue-trends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOverdueTrends(res.data);
      } catch (err) {
        console.error("Error fetching overdue trends:", err);
      }
    };
    fetchDashboardMetrics();
    fetchTrends();
  }, []);

  useEffect(() => {
    const fetchCashflow = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard/cashflow-summary?period=${cashflowPeriod}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMetrics(prev => ({
          ...prev,
          totalCollectedToday: res.data.totalCollected,
          totalDisbursedToday: res.data.totalDisbursed,
          netCashFlowToday: res.data.netCashFlow
        }));
      } catch (err) {
        console.error("Error fetching filtered cashflow:", err);
      }
    };
    fetchCashflow();
  }, [cashflowPeriod]);

  return (
    <Layout>
      <div className="px-6 py-6 max-w-6xl mx-auto">
        <h2 className="mb-6 text-white text-xl font-bold">Resumen del sistema</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            ["Clientes registrados", metrics?.customers ?? 0],
            ["Préstamos emitidos", metrics?.loansIssued ?? 0],
            ["Capital prestado", `$${(metrics?.capitalLoaned ?? 0).toLocaleString()}`],
            ["Intereses por cobrar", `$${(metrics?.interestToCollect ?? 0).toLocaleString()}`],
            ["Monto vencido", `$${(metrics?.overdueAmount ?? 0).toLocaleString()}`],
            ["Clientes con pagos vencidos", metrics?.customersOverdue ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="bg-black border-l-4 border-lime-500 p-4 rounded shadow">
              <h3 className="text-white font-semibold">{label}</h3>
              <p className="text-2xl text-lime-400">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white text-lg font-bold">Resumen de Flujo de Caja</h3>
            <select
              value={cashflowPeriod}
              onChange={(e) => setCashflowPeriod(e.target.value)}
              className="bg-black text-lime-400 border border-lime-500 rounded px-2 py-1"
            >
              <option value="day">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="ytd">Año en curso</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-black border-l-4 border-lime-500 p-4 rounded shadow">
              <h4 className="text-white font-semibold">Total Cobrado Hoy</h4>
              <p className="text-2xl text-lime-400">${(metrics.totalCollectedToday ?? 0).toLocaleString()}</p>
            </div>
            <div className="bg-black border-l-4 border-lime-500 p-4 rounded shadow">
              <h4 className="text-white font-semibold">Total Prestado Hoy</h4>
              <p className="text-2xl text-lime-400">${(metrics.totalDisbursedToday ?? 0).toLocaleString()}</p>
            </div>
            <div className={`bg-black border-l-4 p-4 rounded shadow ${metrics.netCashFlowToday >= 0 ? 'border-lime-500' : 'border-red-500'}`}>
              <h4 className="text-white font-semibold">Flujo Neto de Caja</h4>
              <p className={`text-2xl ${metrics.netCashFlowToday >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                ${Math.abs(metrics.netCashFlowToday ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <Link to="/tesoreria" className="text-lime-400 underline text-sm">Ver flujo completo de caja →</Link>
          </div>
        </div>
      </div>
      {metrics.storeComparison && metrics.storeComparison.length > 0 && (
        <div className="mt-10 px-6 max-w-6xl mx-auto">
          <h3 className="text-white text-lg font-bold mb-4">Comparativa por Sucursal</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-white bg-black border border-crediyaGreen">
              <thead>
                <tr className="bg-gray-900 text-lime-400">
                  <th className="px-4 py-2 text-left">Sucursal</th>
                  <th className="px-4 py-2 text-left">Préstamos Activos</th>
                  <th className="px-4 py-2 text-left">Préstamos Vencidos</th>
                  <th className="px-4 py-2 text-left">Capital Prestado</th>
                  <th className="px-4 py-2 text-left">Préstamo Promedio</th>
                  <th className="px-4 py-2 text-left">Tasa de Cobranza</th>
                </tr>
              </thead>
              <tbody>
                {metrics.storeComparison.map((sucursal) => (
                  <tr key={sucursal.store} className="border-t border-crediyaGreen">
                    <td className="px-4 py-2">{sucursal.store}</td>
                    <td className="px-4 py-2">{sucursal.active_loans}</td>
                    <td className="px-4 py-2">{sucursal.overdue_loans}</td>
                    <td className="px-4 py-2">${parseFloat(sucursal.capital_lent).toLocaleString()}</td>
                    <td className="px-4 py-2">${parseFloat(sucursal.avg_loan_size).toLocaleString()}</td>
                    <td className="px-4 py-2">{parseFloat(sucursal.collection_rate).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {metrics.overdueCustomersTable && metrics.overdueCustomersTable.length > 0 && (
        <div className="mt-10 px-6 max-w-6xl mx-auto">
          <h3 className="text-white text-lg font-bold mb-4">Clientes con pagos vencidos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-white bg-black border border-crediyaGreen">
              <thead>
                <tr className="bg-gray-900 text-lime-400">
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Teléfono</th>
                  <th className="px-4 py-2 text-left">Pagos Vencidos</th>
                  <th className="px-4 py-2 text-left">Monto Total Vencido</th>
                </tr>
              </thead>
              <tbody>
                {metrics.overdueCustomersTable.map((c) => (
                  <tr key={c.customer_id} className="border-t border-crediyaGreen">
                    <td className="px-4 py-2">{c.first_name} {c.last_name}</td>
                    <td className="px-4 py-2">{c.phone}</td>
                    <td className="px-4 py-2">{c.overdue_installments}</td>
                    <td className="px-4 py-2">${parseFloat(c.total_overdue).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {overdueTrends.length > 0 && (
        <div className="mt-10 px-6 max-w-6xl mx-auto">
          <h3 className="text-white text-lg font-bold mb-4">Tendencia de Pagos Vencidos</h3>
          <div className="bg-black p-4 rounded">
            <Line
              data={{
                labels: overdueTrends.map(row => new Date(row.week_start).toLocaleDateString()),
                datasets: [
                  {
                    label: "Monto vencido por semana",
                    data: overdueTrends.map(row => parseFloat(row.total_due)),
                    borderColor: "rgb(132, 204, 22)",
                    backgroundColor: "rgba(132, 204, 22, 0.2)",
                  },
                ],
              }}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;