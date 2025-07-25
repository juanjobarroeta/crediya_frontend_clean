import Layout from "../components/Layout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoanDetails = () => {
  const { loan_id } = useParams();
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/loans/${loan_id}/details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLoanData(res.data);
      } catch (err) {
        console.error("Error fetching loan details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [loan_id, token]);

  if (loading) return <div>Loading...</div>;
  if (!loanData || !loanData.loan) return <div>No data found</div>;

  const { loan, payments, penalties, journal_entries } = loanData;

  return (
    <Layout>
      <div className="text-white p-6 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Detalles del Préstamo #{loan.id}</h1>
        <div className="text-sm text-gray-300 space-y-1">
          <p><strong>Cliente:</strong> {loan.first_name} {loan.last_name}</p>
          <p>
            <strong>Capturado por:</strong>{" "}
            {loan.employee_first_name || loan.employee_last_name
              ? `${loan.employee_first_name || ""} ${loan.employee_last_name || ""}`.trim()
              : "No registrado"}
          </p>
          <p><strong>Monto:</strong> ${loan.amount}</p>
          <p><strong>Status:</strong> {loan.status}</p>
          <p><strong>Fecha de creación:</strong> {new Date(loan.created_at).toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-800 p-4 rounded shadow">
          <div><strong>Monto Total Prestado:</strong> ${loan.amount}</div>
          <div><strong>Capital Pendiente:</strong> ${loan.capital_due}</div>
          <div><strong>Interés Pendiente:</strong> ${loan.interest_due}</div>
          <div><strong>Penalizaciones Totales:</strong> ${loan.penalty_due}</div>
          <div><strong>Último Pago:</strong> {loan.last_payment_date ? new Date(loan.last_payment_date).toLocaleDateString() : "N/A"}</div>
          <div><strong>Fecha de Vencimiento:</strong> {new Date(loan.due_date).toLocaleDateString()}</div>
          {(() => {
            const isOverdue = new Date(loan.due_date) < new Date();
            return (
              <div>
                <strong>Estado del Préstamo:</strong>{" "}
                <span className={isOverdue ? "text-red-500" : "text-green-400"}>
                  {isOverdue ? "Vencido" : "Al Día"}
                </span>
              </div>
            );
          })()}
        </div>

        <div>
          <h2 className="text-lg font-semibold mt-6 mb-2">🧾 Pagos</h2>
          <table className="w-full text-sm border border-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-2 py-1 text-left">Fecha</th>
                <th className="px-2 py-1 text-left">Método</th>
                <th className="px-2 py-1 text-left">Componente</th>
                <th className="px-2 py-1 text-left">Monto</th>
                <th className="px-2 py-1 text-left">Semana</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={i} className="border-t border-gray-600">
                  <td className="px-2 py-1">{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td className="px-2 py-1">{p.method}</td>
                  <td className="px-2 py-1">{p.component}</td>
                  <td className="px-2 py-1">${p.component_amount}</td>
                  <td className="px-2 py-1">{p.installment_week}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-lg font-semibold mt-6 mb-2">⚠️ Penalizaciones</h2>
          <table className="w-full text-sm border border-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-2 py-1">Semana</th>
                <th className="px-2 py-1">Fecha de Vencimiento</th>
                <th className="px-2 py-1">Monto Penalización</th>
              </tr>
            </thead>
            <tbody>
              {penalties.map((penalty, i) => (
                <tr key={i} className="border-t border-gray-600">
                  <td className="px-2 py-1">{penalty.week_number}</td>
                  <td className="px-2 py-1">{new Date(penalty.due_date).toLocaleDateString()}</td>
                  <td className="px-2 py-1">${penalty.penalty_applied}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-lg font-semibold mt-6 mb-2">📘 Asientos Contables</h2>
          <table className="w-full text-sm border border-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-2 py-1">Fecha</th>
                <th className="px-2 py-1">Descripción</th>
                <th className="px-2 py-1">Cuenta</th>
                <th className="px-2 py-1">Débito</th>
                <th className="px-2 py-1">Crédito</th>
              </tr>
            </thead>
            <tbody>
              {journal_entries.map((entry, i) => (
                <tr key={i} className="border-t border-gray-600">
                  <td className="px-2 py-1">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="px-2 py-1">{entry.description}</td>
                  <td className="px-2 py-1">{entry.account_code}</td>
                  <td className="px-2 py-1">{entry.debit}</td>
                  <td className="px-2 py-1">{entry.credit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default LoanDetails;