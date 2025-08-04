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
  const [periodType, setPeriodType] = useState("month"); // month, quarter, year, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [showCharts, setShowCharts] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const token = localStorage.getItem("token");

  // Initialize with current month and year
  useEffect(() => {
    const today = new Date();
    setSelectedMonth((today.getMonth() + 1).toString());
    setSelectedYear(today.getFullYear().toString());
    setCustomStartDate(today.toISOString().slice(0, 10));
    setCustomEndDate(today.toISOString().slice(0, 10));
  }, []);

  const loadData = useCallback(async (isComparison = false) => {
    if (!selectedMonth || !selectedYear) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let url = `${API_BASE_URL}/income-statement?month=${selectedMonth}&year=${selectedYear}&details=${showDetails}`;
      
      if (periodType === "custom" && customStartDate && customEndDate) {
        url = `${API_BASE_URL}/income-statement?start=${customStartDate}&end=${customEndDate}&details=${showDetails}`;
      } else if (periodType === "quarter" && selectedQuarter) {
        url = `${API_BASE_URL}/income-statement?quarter=${selectedQuarter}&year=${selectedYear}&details=${showDetails}`;
      } else if (periodType === "year") {
        url = `${API_BASE_URL}/income-statement?year=${selectedYear}&details=${showDetails}`;
      }
      
      console.log("🔍 Fetching income statement:", url);
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("📊 Income statement data:", res.data);
      
      if (isComparison) {
        setComparisonData(res.data);
      } else {
        setStatement(res.data);
      }
    } catch (err) {
      console.error("❌ Error fetching income statement:", err);
      setError(err.response?.data?.message || "Error al cargar el estado de resultados");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, showDetails, periodType, customStartDate, customEndDate, selectedQuarter, token]);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      loadData();
    }
  }, [selectedMonth, selectedYear, showDetails, periodType, customStartDate, customEndDate, selectedQuarter, loadData]);

  // Memoized calculations
  const calculations = useMemo(() => {
    if (!statement) return null;
    
    const totalIncome = (statement.interestPaid || 0) + (statement.productMargin || 0) + (statement.penalties || 0);
    const totalExpenses = (statement.costOfGoods || 0) + (statement.expenses || 0);
    const grossProfit = totalIncome - (statement.costOfGoods || 0);
    const netIncome = grossProfit - (statement.expenses || 0);
    const profitMargin = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
    
    return {
      totalIncome,
      totalExpenses,
      grossProfit,
      netIncome,
      profitMargin,
      expenseRatio,
      interestPaid: statement.interestPaid || 0,
      penalties: statement.penalties || 0,
      productMargin: statement.productMargin || 0,
      costOfGoods: statement.costOfGoods || 0,
      expenses: statement.expenses || 0
    };
  }, [statement]);

  const comparisonCalculations = useMemo(() => {
    if (!comparisonData) return null;
    
    const totalIncome = (comparisonData.interestPaid || 0) + (comparisonData.productMargin || 0) + (comparisonData.penalties || 0);
    const totalExpenses = (comparisonData.costOfGoods || 0) + (comparisonData.expenses || 0);
    const grossProfit = totalIncome - (comparisonData.costOfGoods || 0);
    const netIncome = grossProfit - (comparisonData.expenses || 0);
    
    return {
      totalIncome,
      totalExpenses,
      grossProfit,
      netIncome,
      interestPaid: comparisonData.interestPaid || 0,
      penalties: comparisonData.penalties || 0,
      productMargin: comparisonData.productMargin || 0,
      costOfGoods: comparisonData.costOfGoods || 0,
      expenses: comparisonData.expenses || 0
    };
  }, [comparisonData]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handlePeriodTypeChange = (e) => {
    setPeriodType(e.target.value);
  };

  const handleCurrentMonth = () => {
    const today = new Date();
    setSelectedMonth((today.getMonth() + 1).toString());
    setSelectedYear(today.getFullYear().toString());
    setPeriodType("month");
  };

  const handleCurrentYear = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear().toString());
    setPeriodType("year");
  };

  const handleYTD = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear().toString());
    setCustomStartDate(`${today.getFullYear()}-01-01`);
    setCustomEndDate(today.toISOString().slice(0, 10));
    setPeriodType("custom");
  };

  const handlePreviousPeriod = () => {
    if (periodType === "month") {
      const currentMonth = parseInt(selectedMonth);
      const currentYear = parseInt(selectedYear);
      
      if (currentMonth === 1) {
        setSelectedMonth("12");
        setSelectedYear((currentYear - 1).toString());
      } else {
        setSelectedMonth((currentMonth - 1).toString());
      }
    } else if (periodType === "quarter") {
      const currentQuarter = parseInt(selectedQuarter);
      const currentYear = parseInt(selectedYear);
      
      if (currentQuarter === 1) {
        setSelectedQuarter("4");
        setSelectedYear((currentYear - 1).toString());
      } else {
        setSelectedQuarter((currentQuarter - 1).toString());
      }
    } else if (periodType === "year") {
      setSelectedYear((parseInt(selectedYear) - 1).toString());
    }
  };

  const handleNextPeriod = () => {
    if (periodType === "month") {
      const currentMonth = parseInt(selectedMonth);
      const currentYear = parseInt(selectedYear);
      
      if (currentMonth === 12) {
        setSelectedMonth("1");
        setSelectedYear((currentYear + 1).toString());
      } else {
        setSelectedMonth((currentMonth + 1).toString());
      }
    } else if (periodType === "quarter") {
      const currentQuarter = parseInt(selectedQuarter);
      const currentYear = parseInt(selectedYear);
      
      if (currentQuarter === 4) {
        setSelectedQuarter("1");
        setSelectedYear((currentYear + 1).toString());
      } else {
        setSelectedQuarter((currentQuarter + 1).toString());
      }
    } else if (periodType === "year") {
      setSelectedYear((parseInt(selectedYear) + 1).toString());
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportLoading(true);
      const response = await axios.get(`${API_BASE_URL}/income-statement/export-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `income-statement-${selectedYear}-${selectedMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Error al exportar PDF");
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      const response = await axios.get(`${API_BASE_URL}/income-statement/export-excel`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `income-statement-${selectedYear}-${selectedMonth}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error exporting Excel:", err);
      alert("Error al exportar Excel");
    } finally {
      setExportLoading(false);
    }
  };

  const handleComparison = async () => {
    if (comparisonMode) {
      await loadData(true);
    }
  };

  const getPeriodLabel = () => {
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    if (periodType === "month") {
      return `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`;
    } else if (periodType === "quarter") {
      return `Q${selectedQuarter} ${selectedYear}`;
    } else if (periodType === "year") {
      return `Año ${selectedYear}`;
    } else if (periodType === "custom") {
      return `${customStartDate} - ${customEndDate}`;
    }
    return "";
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-crediyaGreen">
              Estado de Resultados
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold"
              >
                {showCharts ? "📊 Tabla" : "📈 Gráficos"}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={exportLoading}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded font-semibold"
              >
                {exportLoading ? "⏳" : "📄 PDF"}
              </button>
              <button
                onClick={handleExportExcel}
                disabled={exportLoading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded font-semibold"
              >
                {exportLoading ? "⏳" : "📊 Excel"}
              </button>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-900 border border-red-400 text-red-200 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Period Selection */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4">
            <div className="flex flex-wrap items-end gap-4 mb-4">
              <div>
                <label className="block text-white text-sm mb-1">Tipo de Período</label>
                <select 
                  value={periodType} 
                  onChange={handlePeriodTypeChange}
                  className="p-2 bg-black border border-green-400 text-white rounded"
                >
                  <option value="month">Mes</option>
                  <option value="quarter">Trimestre</option>
                  <option value="year">Año</option>
                  <option value="custom">Período Personalizado</option>
                </select>
              </div>

              {periodType === "month" && (
                <>
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
                </>
              )}

              {periodType === "quarter" && (
                <>
                  <div>
                    <label className="block text-white text-sm mb-1">Trimestre</label>
                    <select 
                      value={selectedQuarter} 
                      onChange={(e) => setSelectedQuarter(e.target.value)}
                      className="p-2 bg-black border border-green-400 text-white rounded"
                    >
                      <option value="1">Q1 (Ene-Mar)</option>
                      <option value="2">Q2 (Abr-Jun)</option>
                      <option value="3">Q3 (Jul-Sep)</option>
                      <option value="4">Q4 (Oct-Dic)</option>
                    </select>
                  </div>
                </>
              )}

              {(periodType === "month" || periodType === "quarter" || periodType === "year") && (
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
              )}

              {periodType === "custom" && (
                <>
                  <div>
                    <label className="block text-white text-sm mb-1">Fecha Inicio</label>
                    <input 
                      type="date" 
                      value={customStartDate} 
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="p-2 bg-black border border-green-400 text-white rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-1">Fecha Fin</label>
                    <input 
                      type="date" 
                      value={customEndDate} 
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="p-2 bg-black border border-green-400 text-white rounded"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center">
                <label className="flex items-center text-white text-sm">
                  <input
                    type="checkbox"
                    checked={showDetails}
                    onChange={(e) => setShowDetails(e.target.checked)}
                    className="mr-2"
                  />
                  Detalles semanales
                </label>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={handleCurrentMonth}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold"
              >
                Mes Actual
              </button>
              <button 
                onClick={handleCurrentYear}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm font-semibold"
              >
                Año Actual
              </button>
              <button 
                onClick={handleYTD}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm font-semibold"
              >
                YTD
              </button>
              <div className="flex gap-1">
                <button 
                  onClick={handlePreviousPeriod}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  title="Período anterior"
                >
                  ←
                </button>
                <button 
                  onClick={handleNextPeriod}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  title="Período siguiente"
                >
                  →
                </button>
              </div>
              <button
                onClick={() => setComparisonMode(!comparisonMode)}
                className={`px-3 py-1 rounded text-sm font-semibold ${
                  comparisonMode 
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white" 
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                }`}
              >
                {comparisonMode ? "Comparación ON" : "Comparación"}
              </button>
            </div>

            {/* Period Label */}
            <div className="mt-2">
              <span className="text-lime-400 font-semibold">Período: {getPeriodLabel()}</span>
            </div>
          </div>
        </div>

        {/* Charts View */}
        {showCharts && statement && calculations && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-center mb-4 text-crediyaGreen">
              Análisis Gráfico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Revenue Breakdown */}
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h4 className="text-white font-semibold mb-2">Desglose de Ingresos</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Intereses:</span>
                    <span className="text-lime-400">${calculations.interestPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Penalidades:</span>
                    <span className="text-lime-400">${calculations.penalties.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Productos:</span>
                    <span className="text-lime-400">${calculations.productMargin.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Total:</span>
                      <span className="text-lime-400">${calculations.totalIncome.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h4 className="text-white font-semibold mb-2">Desglose de Gastos</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Costo de Venta:</span>
                    <span className="text-red-400">${calculations.costOfGoods.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Gastos Operativos:</span>
                    <span className="text-red-400">${calculations.expenses.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Total:</span>
                      <span className="text-red-400">${calculations.totalExpenses.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h4 className="text-white font-semibold mb-2">Métricas Clave</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Margen de Utilidad:</span>
                    <span className={`font-semibold ${calculations.profitMargin >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {calculations.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Ratio de Gastos:</span>
                    <span className="text-orange-400 font-semibold">
                      {calculations.expenseRatio.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Utilidad Bruta:</span>
                    <span className="text-blue-400 font-semibold">
                      ${calculations.grossProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-600 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Utilidad Neta:</span>
                      <span className={`${calculations.netIncome >= 0 ? "text-green-400" : "text-red-400"}`}>
                        ${calculations.netIncome.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Income Statement Table */}
        {statement && calculations && (
          <div className="flex flex-col items-center w-full">
            <table className="min-w-max text-sm text-white border border-green-400">
              <thead>
                <tr className="bg-crediyaGreen text-black">
                  <th className="p-2 text-left">Concepto</th>
                  <th className="p-2 text-right">Monto</th>
                  {comparisonMode && comparisonCalculations && (
                    <th className="p-2 text-right">Comparación</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-green-400">
                  <td className="p-2 font-semibold text-lime-400">INGRESOS</td>
                  <td className="p-2 text-right"></td>
                  {comparisonMode && comparisonCalculations && <td className="p-2 text-right"></td>}
                </tr>
                <tr className="border-t border-green-400">
                  <td className="p-2 pl-4">Intereses cobrados</td>
                  <td className="p-2 text-right text-lime-400">${calculations.interestPaid.toLocaleString()}</td>
                  {comparisonMode && comparisonCalculations && (
                    <td className="p-2 text-right text-lime-400">${comparisonCalculations.interestPaid.toLocaleString()}</td>
                  )}
                </tr>
                <tr className="border-t border-green-400">
                  <td className="p-2 pl-4">Penalidades</td>
                  <td className="p-2 text-right text-lime-400">${calculations.penalties.toLocaleString()}</td>
                  {comparisonMode && comparisonCalculations && (
                    <td className="p-2 text-right text-lime-400">${comparisonCalculations.penalties.toLocaleString()}</td>
                  )}
                </tr>
                <tr className="border-t border-green-400">
                  <td className="p-2 pl-4">Margen de productos</td>
                  <td className="p-2 text-right text-lime-400">${calculations.productMargin.toLocaleString()}</td>
                  {comparisonMode && comparisonCalculations && (
                    <td className="p-2 text-right text-lime-400">${comparisonCalculations.productMargin.toLocaleString()}</td>
                  )}
                </tr>
                
                <tr className="border-t border-green-400">
                  <td className="p-2 font-semibold text-red-400">COSTOS Y GASTOS</td>
                  <td className="p-2 text-right"></td>
                  {comparisonMode && comparisonCalculations && <td className="p-2 text-right"></td>}
                </tr>
                <tr className="border-t border-green-400">
                  <td className="p-2 pl-4">Costo de ventas</td>
                  <td className="p-2 text-right text-red-400">${calculations.costOfGoods.toLocaleString()}</td>
                  {comparisonMode && comparisonCalculations && (
                    <td className="p-2 text-right text-red-400">${comparisonCalculations.costOfGoods.toLocaleString()}</td>
                  )}
                </tr>
                <tr className="border-t border-green-400">
                  <td className="p-2 pl-4">Gastos operativos</td>
                  <td className="p-2 text-right text-red-400">${calculations.expenses.toLocaleString()}</td>
                  {comparisonMode && comparisonCalculations && (
                    <td className="p-2 text-right text-red-400">${comparisonCalculations.expenses.toLocaleString()}</td>
                  )}
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
              <p>
                <span className="font-bold text-purple-400">Margen de Utilidad:</span>
                {calculations.profitMargin.toFixed(1)}%
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