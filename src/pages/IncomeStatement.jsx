import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/constants";
import Layout from "../components/Layout";
import axios from "axios";

const IncomeStatement = () => {
  const [statement, setStatement] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [store, setStore] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const today = new Date();
    const defaultStart = "2000-01-01";
    const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, []);

  const loadData = async () => {
    try {
      const url = `${API_BASE_URL}/accounting/income-statement?start=${startDate}&end=${endDate}${store ? `&store=${store}` : ""}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatement(res.data);
    } catch (err) {
      console.error("Error fetching income statement:", err);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      loadData();
    }
  }, [startDate, endDate]);

  if (!statement) return <p>Cargando estado de resultados...</p>;

  const totalIncome = statement.INGRESO.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = statement.EGRESO.reduce((sum, i) => sum + Math.abs(i.amount), 0);
  const costOfGoods = statement.EGRESO.filter(i => i.label.toLowerCase().includes("costo") || i.label.toLowerCase().includes("cogs")).reduce((sum, i) => sum + Math.abs(i.amount), 0);
  const generalExpenses = totalExpenses - costOfGoods;
  const grossProfit = totalIncome - costOfGoods;
  const netIncome = grossProfit - generalExpenses;

  return (
    <Layout>
      <div className="bg-[#0a0a0a] p-4 rounded-lg border border-green-400 overflow-x-auto w-full">
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-white text-sm mb-1">Fecha Inicio</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 bg-black border border-green-400 text-white rounded" />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">Fecha Fin</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 bg-black border border-green-400 text-white rounded" />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">Sucursal</label>
            <select value={store} onChange={e => setStore(e.target.value)} className="p-2 bg-black border border-green-400 text-white rounded">
              <option value="">Todas</option>
              <option value="atlixco">Atlixco</option>
              <option value="cholula">Cholula</option>
              <option value="chipilo">Chipilo</option>
            </select>
          </div>
          <button onClick={loadData} className="bg-lime-500 hover:bg-lime-600 text-black px-4 py-2 rounded font-bold">
            Filtrar
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
              const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
              setStartDate(start);
              setEndDate(end);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold"
          >
            Filtrar por mes actual
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const start = new Date(today.getFullYear(), 0, 1).toISOString().slice(0, 10);
              const end = today.toISOString().slice(0, 10);
              setStartDate(start);
              setEndDate(end);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-bold"
          >
            Filtrar Año en Curso
          </button>
          <button
            onClick={async () => {
              const confirmClose = window.confirm(`¿Cerrar el periodo del ${startDate} al ${endDate}? Esta acción moverá las utilidades a la cuenta correspondiente.`);
              if (!confirmClose) return;
              try {
                const res = await axios.post(
                  `${API_BASE_URL}/accounting/close-period`,
                  { start: startDate, end: endDate },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                alert(`✅ Periodo cerrado. Utilidad: $${res.data.netResult.toLocaleString()}`);
                loadData();
              } catch (err) {
                console.error("Error closing period:", err);
                alert("❌ Error al cerrar el periodo");
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold"
          >
            Cerrar Periodo
          </button>
        </div>
        <h2 className="text-xl font-bold text-center mb-4 text-crediyaGreen">Estado de Resultados</h2>
        <div className="flex flex-col items-center w-full">
          <table className="min-w-max text-sm text-white border border-green-400">
            <thead>
              <tr className="bg-crediyaGreen text-black">
                <th className="p-2 text-left">Cuenta</th>
                <th className="p-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {["INGRESO", "EGRESO"].map(type => (
                statement?.[type]?.map((item, idx) => (
                  <tr key={`${type}-${idx}`} className="border-t border-green-400">
                    <td className="p-2">{item.label}</td>
                    <td className="p-2 text-right">${item.amount.toLocaleString()}</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
          <div className="mt-6 text-right text-white space-y-2 w-full max-w-md">
            <p><span className="font-bold text-lime-400">Total Ingresos:</span> ${totalIncome.toLocaleString()}</p>
            <p><span className="font-bold text-yellow-300">Costo de Venta:</span> ${costOfGoods.toLocaleString()}</p>
            <p><span className="font-bold text-white">Utilidad Bruta:</span> ${grossProfit.toLocaleString()}</p>
            <p><span className="font-bold text-blue-300">Gastos Generales:</span> ${generalExpenses.toLocaleString()}</p>
            <p>
              <span className={`font-bold ${netIncome >= 0 ? "text-crediyaGreen" : "text-red-400"}`}>Utilidad Neta:</span>
              ${netIncome.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IncomeStatement;