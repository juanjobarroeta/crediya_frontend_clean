import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";

const OverdueLoans = () => {
  const [rows, setRows] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/overdue-loans`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRows(res.data);
      } catch (err) {
        console.error("Error loading overdue loans:", err);
      }
    };
    fetchOverdue();
  }, []);

  return (
    <Layout>
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <h2 className="text-white text-xl font-bold mb-6">Pagos vencidos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-white bg-black border border-crediyaGreen">
            <thead>
              <tr className="bg-gray-900 text-lime-400">
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-left">ID Préstamo</th>
                <th className="px-4 py-2 text-left">Semana</th>
                <th className="px-4 py-2 text-left">Fecha de pago</th>
                <th className="px-4 py-2 text-left">Días de atraso</th>
                <th className="px-4 py-2 text-left">Monto vencido</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.loan_id}-${r.week_number}`} className="border-t border-crediyaGreen">
                  <td className="px-4 py-2 text-lime-400 underline">
                    <a href={`/customer/${r.customer_id}`}>{r.customer_name}</a>
                  </td>
                  <td className="px-4 py-2">{r.phone}</td>
                  <td className="px-4 py-2">#{r.loan_id}</td>
                  <td className="px-4 py-2">Semana {r.week_number}</td>
                  <td className="px-4 py-2">{new Date(r.due_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-yellow-400">
                    {Math.ceil((new Date() - new Date(r.due_date)) / (1000 * 60 * 60 * 24))} días
                  </td>
                  <td className="px-4 py-2 text-red-400">
                    ${parseFloat(r.total_due).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-crediyaGreen font-bold text-white bg-black">
                <td colSpan="6" className="px-4 py-2 text-right">Total vencido:</td>
                <td className="px-4 py-2 text-red-400">
                  ${rows.reduce((sum, r) => sum + parseFloat(r.total_due), 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default OverdueLoans;