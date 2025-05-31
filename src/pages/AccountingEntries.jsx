import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";

const AccountingEntries = () => {
  const [entries, setEntries] = useState([]);
  const token = localStorage.getItem("token");

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/accounting`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(res.data);
    } catch (err) {
      console.error("Error fetching accounting entries:", err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const totals = {
    down_payment: 0,
    loan_principal: 0,
    interest: 0,
  };

  entries.forEach((entry) => {
    if (totals.hasOwnProperty(entry.type)) {
      totals[entry.type] += parseFloat(entry.amount);
    }
  });

  return (
    <Layout>
    <div className="p-6 text-white bg-black min-h-screen">
      <h2 className="mb-4 text-2xl font-bold">Entradas Contables</h2>
      {entries.length === 0 ? (
        <p>No hay movimientos registrados.</p>
      ) : (
        <>
          <div className="bg-[#111] border border-crediyaGreen p-4 rounded mb-6">
            <h5 className="text-lg font-semibold mb-2">Resumen contable</h5>
            <p className="mb-1"><span className="font-bold">Total Enganches:</span> <span className="font-bold text-crediyaGreen">${totals.down_payment.toFixed(2)}</span></p>
            <p className="mb-1"><span className="font-bold">Total Monto Financiado:</span> <span className="font-bold text-crediyaGreen">${totals.loan_principal.toFixed(2)}</span></p>
            <p><span className="font-bold">Total Intereses Proyectados:</span> <span className="font-bold text-crediyaGreen">${totals.interest.toFixed(2)}</span></p>
          </div>
          <table className="w-full border border-crediyaGreen text-sm">
            <thead>
              <tr className="bg-crediyaGreen text-black">
                <th className="border border-crediyaGreen px-4 py-2">Tipo</th>
                <th className="border border-crediyaGreen px-4 py-2">Monto</th>
                <th className="border border-crediyaGreen px-4 py-2">Descripción</th>
                <th className="border border-crediyaGreen px-4 py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="border border-crediyaGreen px-4 py-2">{entry.type}</td>
                  <td className="border border-crediyaGreen px-4 py-2">${entry.amount}</td>
                  <td className="border border-crediyaGreen px-4 py-2">{entry.description}</td>
                  <td className="border border-crediyaGreen px-4 py-2">{new Date(entry.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div> 
     </Layout>
  );

};

export default AccountingEntries;
