import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/constants";
import Layout from "../components/Layout";

const IncomeStatement = () => {
  const [statement, setStatement] = useState(null);
  const [expandedTypes, setExpandedTypes] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStatement = async () => {
      try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        const res = await axios.get(`${API_BASE_URL}/income-statement?month=${month}&year=${year}&details=true`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatement(res.data);
        console.log("📦 Full Income Statement Response:", JSON.stringify(res.data, null, 2));
        console.log("📊 Income Statement Data:", res.data);
        console.log("Statement at render:", res.data);
      } catch (err) {
        console.error("Error fetching income statement:", err);
      }
    };

    fetchStatement();
  }, []);

  if (!statement) return <p>Cargando estado de resultados...</p>;

  const totalIncome = (statement.interestPaid || 0) + (statement.penalties || 0) + (statement.productMargin || 0);
  const totalCOGS = statement.costOfGoods || 0;
  const grossProfit = totalIncome - totalCOGS;
  const totalExpenses = statement.expenses || 0;
  const netIncome = grossProfit - totalExpenses;

  const groupedDetails = Array.isArray(statement.details)
    ? statement.details.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
      }, {})
    : {};

  return (
    <Layout>
      <div className="bg-[#0a0a0a] p-4 rounded-lg border border-green-400 overflow-x-auto max-w-full">
        <h2 className="text-xl font-bold text-center mb-4 text-crediyaGreen">Estado de Resultados</h2>

        <div className="overflow-x-scroll whitespace-nowrap mt-4">
          <table className="min-w-max text-sm text-white border border-green-400">
            <thead>
              <tr className="bg-crediyaGreen text-black">
                <th className="p-2 text-left">Cuenta</th>
                {statement.weeklyBreakdown.map((week, index) => (
                  <th key={index} className="p-2 text-center">Semana {index + 1}<br /><span className="text-xs">({week.range})</span></th>
                ))}
                <th className="p-2 text-center font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Ingresos", key: "income", compute: w => (w.interestPaid || 0) + (w.penalties || 0) + (w.productMargin || 0) },
                { label: "Costo de Teléfonos", key: "cogs", compute: w => w.costOfGoods || 0 },
                { label: "Utilidad Bruta", key: "gross", compute: w => ((w.interestPaid || 0) + (w.penalties || 0) + (w.productMargin || 0)) - (w.costOfGoods || 0) },
                { label: "Gastos Generales", key: "expenses", compute: w => w.expenses || 0 },
                { label: "Utilidad Neta", key: "net", compute: w => (((w.interestPaid || 0) + (w.penalties || 0) + (w.productMargin || 0)) - (w.costOfGoods || 0)) - (w.expenses || 0) }
              ].map((row, idx) => (
                <tr key={idx} className="border-t border-green-400">
                  <td className="p-2 font-bold">{row.label}</td>
                  {statement.weeklyBreakdown.map((week, i) => (
                    <td key={i} className="p-2 text-right">${row.compute(week).toFixed(2)}</td>
                  ))}
                  <td className="p-2 text-right font-bold">
                    ${statement.weeklyBreakdown.reduce((sum, week) => sum + row.compute(week), 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {groupedDetails && Object.keys(groupedDetails).length > 0 && (
          <div className="mt-4">
            <h5 className="mb-2">🔍 Detalle por Categoría</h5>
            {Object.entries(groupedDetails).map(([type, entries]) => (
              <div key={type} className="mt-3">
                <button
                  className="btn btn-sm btn-outline-secondary mb-2"
                  onClick={() => setExpandedTypes(prev => ({ ...prev, [type]: !prev[type] }))}
                >
                  {expandedTypes[type] ? "Ocultar" : "Ver Detalle"} — {type}
                </button>
                {expandedTypes[type] && (
                  <table className="w-full border-collapse text-sm text-white border border-green-400 rounded">
                    <thead>
                      <tr className="bg-crediyaGreen text-black">
                        <th className="p-2 text-left">Descripción</th>
                        <th className="p-2 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((item, idx) => (
                        <tr key={idx} className="border-t border-green-400">
                          <td className="p-2">{item.description || "Sin descripción"}</td>
                          <td className="p-2 text-right">${parseFloat(item.total).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IncomeStatement;
