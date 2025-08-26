import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";
import { 
  OverviewTab, 
  FinancialTab, 
  CustomersTab, 
  OperationalTab, 
  KPITab, 
  ComparisonTab 
} from "../components/StoreDashboardTabs";

const StoreDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: [],
    financial: [],
    customers: [],
    operational: [],
    inventory: [],
    trends: []
  });
  const [kpiData, setKpiData] = useState({});
  const [comparisonData, setComparisonData] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [stores, setStores] = useState([]);

  // Utility Functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatPercent = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-MX').format(value || 0);
  };

  const getPerformanceColor = (value, benchmark, inverse = false) => {
    const ratio = value / benchmark;
    if (inverse) {
      return ratio <= 0.8 ? 'text-green-400' : ratio <= 1.2 ? 'text-yellow-400' : 'text-red-400';
    }
    return ratio >= 1.2 ? 'text-green-400' : ratio >= 0.8 ? 'text-yellow-400' : 'text-red-400';
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return "📈";
    if (current < previous) return "📉";
    return "➡️";
  };

  // Data Fetching
  const fetchStores = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/admin/stores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStores(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (selectedStore) params.store_id = selectedStore;

      const [analyticsRes, kpiRes, comparisonRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/dashboard/store-analytics`, {
          headers: { Authorization: `Bearer ${token}` },
          params
        }),
        axios.get(`${API_BASE_URL}/dashboard/store-kpis`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ...params, period: '30' }
        }),
        axios.get(`${API_BASE_URL}/dashboard/store-comparison`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { period: '30' }
        })
      ]);

      setAnalyticsData(analyticsRes.data);
      setKpiData(kpiRes.data);
      setComparisonData(comparisonRes.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [from, to, selectedStore]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🏪 Análisis y Rentabilidad de Tiendas</h1>
          <p className="text-gray-400">Dashboard avanzado de rendimiento y analytics por tienda</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tienda</label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las tiendas</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Desde</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hasta</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? "Cargando..." : "🔄 Actualizar"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: '📊 Resumen', icon: '📊' },
              { id: 'financial', label: '💰 Financiero', icon: '💰' },
              { id: 'customers', label: '👥 Clientes', icon: '👥' },
              { id: 'operational', label: '⚙️ Operacional', icon: '⚙️' },
              { id: 'kpis', label: '🎯 KPIs', icon: '🎯' },
              { id: 'comparison', label: '🏆 Comparación', icon: '🏆' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Cargando datos de analytics...</p>
            </div>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && (
              <OverviewTab 
                analyticsData={analyticsData}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
                getTrendIcon={getTrendIcon}
              />
            )}
            {activeTab === 'financial' && (
              <FinancialTab 
                analyticsData={analyticsData}
                formatCurrency={formatCurrency}
              />
            )}
            {activeTab === 'customers' && (
              <CustomersTab 
                analyticsData={analyticsData}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
              />
            )}
            {activeTab === 'operational' && (
              <OperationalTab 
                analyticsData={analyticsData}
                formatPercent={formatPercent}
                formatNumber={formatNumber}
              />
            )}
            {activeTab === 'kpis' && (
              <KPITab 
                kpiData={kpiData}
                formatCurrency={formatCurrency}
                formatPercent={formatPercent}
                formatNumber={formatNumber}
                getPerformanceColor={getPerformanceColor}
              />
            )}
            {activeTab === 'comparison' && (
              <ComparisonTab 
                comparisonData={comparisonData}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
                formatPercent={formatPercent}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StoreDashboard;