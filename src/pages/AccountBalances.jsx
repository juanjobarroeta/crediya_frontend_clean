import { API_BASE_URL } from "../utils/constants";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AccountBalances = () => {
  console.log("✅ AccountBalances mounted");
  const [from, setFrom] = useState("2000-01-01");
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("movements");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("all");
  const [sortBy, setSortBy] = useState("balance");
  const [sortOrder, setSortOrder] = useState("desc");

  const token = localStorage.getItem("token");
  console.log("🔐 Token in use:", token);
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("🧠 Token payload:", payload);
  } catch (err) {
    console.error("❌ Failed to decode token:", err);
  }

  const fetchBalances = async () => {
    if (!from || !to) return;

    try {
      setLoading(true);
      console.log("📅 Fetching with:", from, to);
      const res = await axios.get(`${API_BASE_URL}/account-balances`, {
        params: { from, to },
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("✅ Data received:", res.data);
      setAccounts(res.data);
    } catch (err) {
      console.error("❌ Error fetching balances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [from, to]);

  // Filter and sort accounts
  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = accounts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(account => 
        account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Account type filter
    if (selectedAccountType !== "all") {
      filtered = filtered.filter(account => account.type === selectedAccountType);
    }

    // Sort accounts
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        case "debit":
          aValue = parseFloat(a.debit || 0);
          bValue = parseFloat(b.debit || 0);
          break;
        case "credit":
          aValue = parseFloat(a.credit || 0);
          bValue = parseFloat(b.credit || 0);
          break;
        case "balance":
        default:
          aValue = parseFloat(a.debit || 0) - parseFloat(a.credit || 0);
          bValue = parseFloat(b.debit || 0) - parseFloat(b.credit || 0);
          break;
      }
      
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [accounts, searchTerm, selectedAccountType, sortBy, sortOrder]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalDebits = accounts.reduce((sum, acc) => sum + parseFloat(acc.debit || 0), 0);
    const totalCredits = accounts.reduce((sum, acc) => sum + parseFloat(acc.credit || 0), 0);
    const netBalance = totalDebits - totalCredits;
    const activeAccounts = accounts.filter(acc => {
      const balance = parseFloat(acc.debit || 0) - parseFloat(acc.credit || 0);
      return Math.abs(balance) > 0;
    }).length;

    // Group by account type
    const byType = {};
    accounts.forEach(account => {
      const type = account.type || 'OTHER';
      if (!byType[type]) byType[type] = { count: 0, totalDebits: 0, totalCredits: 0 };
      byType[type].count++;
      byType[type].totalDebits += parseFloat(account.debit || 0);
      byType[type].totalCredits += parseFloat(account.credit || 0);
    });

    return {
      totalDebits,
      totalCredits,
      netBalance,
      activeAccounts,
      totalAccounts: accounts.length,
      byType
    };
  }, [accounts]);

  // Chart data
  const chartData = useMemo(() => {
    const topAccounts = filteredAndSortedAccounts.slice(0, 10);
    
    return {
      balanceChart: {
        labels: topAccounts.map(acc => acc.name),
        datasets: [{
          label: 'Saldo',
          data: topAccounts.map(acc => parseFloat(acc.debit || 0) - parseFloat(acc.credit || 0)),
          backgroundColor: topAccounts.map((_, index) => 
            index % 2 === 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(59, 130, 246, 0.8)'
          ),
          borderColor: topAccounts.map((_, index) => 
            index % 2 === 0 ? '#10B981' : '#3B82F6'
          ),
          borderWidth: 2
        }]
      },
      typeDistribution: {
        labels: Object.keys(analytics.byType),
        datasets: [{
          data: Object.values(analytics.byType).map(type => type.count),
          backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
          borderWidth: 2
        }]
      },
      movementTrend: {
        labels: ['Débitos', 'Créditos', 'Neto'],
        datasets: [{
          data: [analytics.totalDebits, analytics.totalCredits, analytics.netBalance],
          backgroundColor: ['#10B981', '#EF4444', '#3B82F6'],
          borderWidth: 2
        }]
      }
    };
  }, [filteredAndSortedAccounts, analytics]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      'ACTIVO': 'text-green-400',
      'PASIVO': 'text-red-400',
      'CAPITAL': 'text-blue-400',
      'INGRESO': 'text-yellow-400',
      'EGRESO': 'text-purple-400',
      'default': 'text-gray-400'
    };
    return colors[type] || colors.default;
  };

  const getAccountTypeIcon = (type) => {
    const icons = {
      'ACTIVO': '💰',
      'PASIVO': '📉',
      'CAPITAL': '🏦',
      'INGRESO': '📈',
      'EGRESO': '💸',
      'default': '📋'
    };
    return icons[type] || icons.default;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">📊 Movimientos por Cuenta</h1>
              <p className="text-gray-400">Análisis completo de movimientos y saldos de cuentas</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab("movements")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "movements" 
                    ? 'bg-lime-500 text-black' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                📋 Movimientos
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "analytics" 
                    ? 'bg-lime-500 text-black' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                📈 Análisis
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "summary" 
                    ? 'bg-lime-500 text-black' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                🏦 Resumen
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "movements" && (
            <div className="max-w-7xl mx-auto">
              {/* Filters */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
                <h3 className="text-lg font-bold mb-4 text-white">🔍 Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      📅 Desde
                    </label>
                    <input
                      type="date"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      📅 Hasta
                    </label>
                    <input
                      type="date"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      🔍 Buscar
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Nombre o código de cuenta..."
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      🏦 Tipo de Cuenta
                    </label>
                    <select
                      value={selectedAccountType}
                      onChange={(e) => setSelectedAccountType(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    >
                      <option value="all">Todos los Tipos</option>
                      <option value="ACTIVO">Activos</option>
                      <option value="PASIVO">Pasivos</option>
                      <option value="CAPITAL">Capital</option>
                      <option value="INGRESO">Ingresos</option>
                      <option value="EGRESO">Egresos</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm">Total Débitos</p>
                      <p className="text-white text-xl font-bold">{formatCurrency(analytics.totalDebits)}</p>
                    </div>
                    <div className="text-blue-200 text-2xl">📈</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-200 text-sm">Total Créditos</p>
                      <p className="text-white text-xl font-bold">{formatCurrency(analytics.totalCredits)}</p>
                    </div>
                    <div className="text-red-200 text-2xl">📉</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm">Saldo Neto</p>
                      <p className="text-white text-xl font-bold">{formatCurrency(analytics.netBalance)}</p>
                    </div>
                    <div className="text-green-200 text-2xl">⚖️</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Cuentas Activas</p>
                      <p className="text-white text-xl font-bold">{analytics.activeAccounts}</p>
                    </div>
                    <div className="text-purple-200 text-2xl">🏦</div>
                  </div>
                </div>
              </div>

              {/* Accounts Table */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">📋 Movimientos por Cuenta</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    >
                      <option value="balance">Saldo</option>
                      <option value="name">Nombre</option>
                      <option value="debit">Débitos</option>
                      <option value="credit">Créditos</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="px-3 py-1 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition"
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400"></div>
                  </div>
                ) : filteredAndSortedAccounts.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <p>No hay movimientos registrados en el período seleccionado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-white font-semibold">Cuenta</th>
                          <th className="px-4 py-3 text-left text-white font-semibold">Tipo</th>
                          <th className="px-4 py-3 text-right text-white font-semibold">Débitos</th>
                          <th className="px-4 py-3 text-right text-white font-semibold">Créditos</th>
                          <th className="px-4 py-3 text-right text-white font-semibold">Saldo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredAndSortedAccounts.map((account) => {
                          const balance = parseFloat(account.debit || 0) - parseFloat(account.credit || 0);
                          return (
                            <tr key={account.code} className="hover:bg-gray-700 transition-colors">
                              <td className="px-4 py-3 text-white font-medium">
                                {account.name}
                              </td>
                              <td className="px-4 py-3 text-white">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
                                  {getAccountTypeIcon(account.type)} {account.type || 'N/A'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-green-400">
                                {formatCurrency(account.debit || 0)}
                              </td>
                              <td className="px-4 py-3 text-right text-red-400">
                                {formatCurrency(account.credit || 0)}
                              </td>
                              <td className={`px-4 py-3 text-right font-bold ${
                                balance > 0 ? 'text-green-400' : balance < 0 ? 'text-red-400' : 'text-gray-400'
                              }`}>
                                {formatCurrency(balance)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold mb-4 text-white">📊 Distribución por Tipo</h3>
                  <div className="h-64">
                    <Doughnut 
                      data={chartData.typeDistribution}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: '#D1D5DB',
                              font: { size: 10 }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold mb-4 text-white">💰 Resumen de Movimientos</h3>
                  <div className="h-64">
                    <Bar 
                      data={chartData.movementTrend}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: {
                              color: '#D1D5DB'
                            }
                          }
                        },
                        scales: {
                          y: {
                            ticks: {
                              color: '#D1D5DB'
                            },
                            grid: {
                              color: '#374151'
                            }
                          },
                          x: {
                            ticks: {
                              color: '#D1D5DB'
                            },
                            grid: {
                              color: '#374151'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-4 text-white">📈 Top 10 Cuentas por Saldo</h3>
                <div className="h-64">
                  <Bar 
                    data={chartData.balanceChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: 'y',
                      plugins: {
                        legend: {
                          labels: {
                            color: '#D1D5DB'
                          }
                        }
                      },
                      scales: {
                        y: {
                          ticks: {
                            color: '#D1D5DB'
                          },
                          grid: {
                            color: '#374151'
                          }
                        },
                        x: {
                          ticks: {
                            color: '#D1D5DB'
                          },
                          grid: {
                            color: '#374151'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "summary" && (
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(analytics.byType).map(([type, data]) => (
                  <div key={type} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">
                        {getAccountTypeIcon(type)} {type}
                      </h3>
                      <span className="text-gray-400 text-sm">{data.count} cuentas</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Débitos:</span>
                        <span className="text-green-400 font-medium">{formatCurrency(data.totalDebits)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Créditos:</span>
                        <span className="text-red-400 font-medium">{formatCurrency(data.totalCredits)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-600 pt-2">
                        <span className="text-gray-300 font-medium">Neto:</span>
                        <span className={`font-bold ${
                          data.totalDebits - data.totalCredits > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(data.totalDebits - data.totalCredits)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AccountBalances;