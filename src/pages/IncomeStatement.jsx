import React, { useEffect, useState, useCallback, useMemo } from "react";
import { API_BASE_URL } from "../utils/constants";
import Layout from "../components/Layout";
import axios from "axios";

const IncomeStatement = () => {
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const token = localStorage.getItem("token");

  // Initialize with current month and year
  useEffect(() => {
    const today = new Date();
    setSelectedMonth((today.getMonth() + 1).toString());
    setSelectedYear(today.getFullYear().toString());
  }, []);

  const loadData = useCallback(async () => {
    if (!selectedMonth || !selectedYear) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/income-statement?month=${selectedMonth}&year=${selectedYear}&details=${showDetails}`;
      console.log("🔍 Fetching income statement:", url);
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("📊 Income statement data:", res.data);
      setStatement(res.data);
    } catch (err) {
      console.error("❌ Error fetching income statement:", err);
      setError(err.response?.data?.message || "Error al cargar el estado de resultados");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, showDetails, token]);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      loadData();
    }
  }, [selectedMonth, selectedYear, showDetails, loadData]);

  // Memoized calculations
  const calculations = useMemo(() => {
    if (!statement) return null;
    
    const totalIncome = (statement.interestPaid || 0) + (statement.productMargin || 0);
    const totalExpenses = (statement.costOfGoods || 0) + (statement.expenses || 0);
    const grossProfit = totalIncome - (statement.costOfGoods || 0);
    const netIncome = grossProfit - (statement.expenses || 0);
    
    return {
      totalIncome,
      totalExpenses,
      grossProfit,
      netIncome,
      interestPaid: statement.interestPaid || 0,
      penalties: statement.penalties || 0,
      productMargin: statement.productMargin || 0,
      costOfGoods: statement.costOfGoods || 0,
      expenses: statement.expenses || 0
    };
  }, [statement]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleCurrentMonth = () => {
    const today = new Date();
    setSelectedMonth((today.getMonth() + 1).toString());
    setSelectedYear(today.getFullYear().toString());
  };

  const handleCurrentYear = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear().toString());
  };

  const handlePreviousMonth = () => {
    const currentMonth = parseInt(selectedMonth);
    const currentYear = parseInt(selectedYear);
    
    if (currentMonth === 1) {
      setSelectedMonth("12");
      setSelectedYear((currentYear - 1).toString());
    } else {
      setSelectedMonth((currentMonth - 1).toString());
    }
  };

  const handleNextMonth = () => {
    const currentMonth = parseInt(selectedMonth);
    const currentYear = parseInt(selectedYear);
    
    if (currentMonth === 12) {
      setSelectedMonth("1");
      setSelectedYear((currentYear + 1).toString());
    } else {
      setSelectedMonth((currentMonth + 1).toString());
    }
  };

  if (loading && !statement) {
    return (
      <Layout>
        <div className="bg-[#0a0a0a] p-4 rounded-lg border border-green-400 w-full">
          <div className="text-white text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p>Cargando estado de resultados...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-[#0a0a0a] p-4 rounded-lg border border-green-400 overflow-x-auto w-full">
        {/* Header and Controls */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center mb-4 text-crediyaGreen">
            Estado de Resultados
          </h2>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-900 border border-red-400 text-red-200 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-end gap-4 mb-4">
            <div>
              <label className="block text-white text-sm mb-1">Mes</label>
              <select 
                value={selectedMonth} 
                onChange={handleMonthChange}
                className="p-2 bg-black border border-green-400 text-white rounded"
              >
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white text-sm mb-1">Año</label>
              <select 
                value={selectedYear} 
                onChange={handleYearChange}
                className="p-2 bg-black border border-green-400 text-white rounded"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center text-white text-sm">
                <input
                  type="checkbox"
                  checked={showDetails}
                  onChange={(e) => setShowDetails(e.target.checked)}
                  className="mr-2"
                />
                Mostrar detalles semanales
              </label>
            </div>

            <button 
              onClick={loadData}
              disabled={loading}
              className="bg-lime-500 hover:bg-lime-600 disabled:opacity-50 text-black px-4 py-2 rounded font-bold"
            >
              {loading ? "Cargando..." : "Actualizar"}
            </button>

            <button 
              onClick={handleCurrentMonth}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold"
            >
              Mes Actual
            </button>

            <button 
              onClick={handleCurrentYear}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-bold"
            >
              Año Actual
            </button>

            <div className="flex gap-2">
              <button 
                onClick={handlePreviousMonth}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded"
                title="Mes anterior"
              >
                ←
              </button>
              <button 
                onClick={handleNextMonth}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded"
                title="Mes siguiente"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Income Statement Table */}
        {statement && calculations && (
          <div className="flex flex-col items-center w-full">
            <table className="min-w-max text-sm text-white border border-green-400">
              <thead>
                <tr className="bg-crediyaGreen text-black">
                  <th className="p-2 text-left">Concepto</th>
                  <th className="p-2 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-green-400">
                  <td className="p-2 font-semibold text-lime-400">INGRESOS</td>
                  <td className="p-2 text-right"></td>
                </tr>
                <tr className="border-t border-green-400">
                  <td className="p-2 pl-4">Intereses cobrados</td>
                  <td className="p-2 text-right text-lime-400">${calculations.interestPaid.toLocaleString()}</td>
                </tr>
                <tr className="border-t border-green-400">
                  <td className="p-2 pl-4">Penalidades</td>
                  <td className="p-2 text-right text-lime-400">${calculations.penalties.toLocaleString()}</td>
                </tr>
                <tr className="border-t border-green-400">
                  <td className="p-2 pl-4">Margen de productos</td>
                  <td className="p-2 text-right text-lime-400">${calculations.productMargin.toLocaleString()}</td>
                </tr>
                
                <tr className="border-t border-green-400">
                  <td className="p-2 font-semibold text-red-400">COSTOS Y GASTOS</td>
                  <td className="p-2 text-right"></td>
                </tr>
                <tr className="border-t border-green-400">
                  <td className="p-2 pl-4">Costo de ventas</td>
                  <td className="p-2 text-right text-red-400">${calculations.costOfGoods.toLocaleString()}</td>
                </tr>
                <tr className="border-t border-green-400">
                  <td className="p-2 pl-4">Gastos operativos</td>
                  <td className="p-2 text-right text-red-400">${calculations.expenses.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            {/* Summary */}
            <div className="mt-6 text-right text-white space-y-2 w-full max-w-md">
              <p><span className="font-bold text-lime-400">Total Ingresos:</span> ${calculations.totalIncome.toLocaleString()}</p>
              <p><span className="font-bold text-red-400">Costo de Venta:</span> ${calculations.costOfGoods.toLocaleString()}</p>
              <p><span className="font-bold text-white">Utilidad Bruta:</span> ${calculations.grossProfit.toLocaleString()}</p>
              <p><span className="font-bold text-blue-300">Gastos Generales:</span> ${calculations.expenses.toLocaleString()}</p>
              <p>
                <span className={`font-bold ${calculations.netIncome >= 0 ? "text-crediyaGreen" : "text-red-400"}`}>
                  Utilidad Neta:
                </span>
                ${calculations.netIncome.toLocaleString()}
              </p>
            </div>

            {/* Weekly Breakdown */}
            {showDetails && statement.weeklyBreakdown && (
              <div className="mt-8 w-full">
                <h3 className="text-lg font-bold text-center mb-4 text-crediyaGreen">
                  Desglose Semanal
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-white border border-green-400">
                    <thead>
                      <tr className="bg-gray-800 text-lime-400">
                        <th className="p-2 text-left">Semana</th>
                        <th className="p-2 text-right">Intereses</th>
                        <th className="p-2 text-right">Penalidades</th>
                        <th className="p-2 text-right">Productos</th>
                        <th className="p-2 text-right">Costos</th>
                        <th className="p-2 text-right">Gastos</th>
                        <th className="p-2 text-right">Neto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.weeklyBreakdown.map((week, index) => {
                        const weekNet = (week.interestPaid + week.penalties + week.productMargin) - week.costOfGoods - week.expenses;
                        return (
                          <tr key={index} className="border-t border-green-400">
                            <td className="p-2">{week.range}</td>
                            <td className="p-2 text-right text-lime-400">${week.interestPaid.toLocaleString()}</td>
                            <td className="p-2 text-right text-lime-400">${week.penalties.toLocaleString()}</td>
                            <td className="p-2 text-right text-lime-400">${week.productMargin.toLocaleString()}</td>
                            <td className="p-2 text-right text-red-400">${week.costOfGoods.toLocaleString()}</td>
                            <td className="p-2 text-right text-red-400">${week.expenses.toLocaleString()}</td>
                            <td className={`p-2 text-right font-semibold ${weekNet >= 0 ? "text-crediyaGreen" : "text-red-400"}`}>
                              ${weekNet.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Data State */}
        {!loading && !statement && !error && (
          <div className="text-center py-8">
            <div className="text-white text-xl mb-2">📊</div>
            <div className="text-gray-400">No hay datos disponibles para el período seleccionado.</div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IncomeStatement;