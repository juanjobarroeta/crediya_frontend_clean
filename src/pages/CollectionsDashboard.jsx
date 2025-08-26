import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_BASE_URL } from '../utils/constants';

const CollectionsDashboard = () => {
  // State Management
  const [dashboardData, setDashboardData] = useState({
    overdue_installments: [],
    summary: {}
  });
  const [recommendations, setRecommendations] = useState([]);
  const [activity, setActivity] = useState([]);
  const [performance, setPerformance] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const token = localStorage.getItem('token');

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/collections/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch Recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/collections/recommendations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }, [token]);

  // Fetch Activity Feed
  const fetchActivity = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/collections/activity?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivity(response.data);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  }, [token]);

  // Fetch Performance Metrics
  const fetchPerformance = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/collections/performance?period=today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerformance(response.data);
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  }, [token]);

  // Quick Contact Handler
  const handleQuickContact = async (customerId, contactMethod, result = 'attempted') => {
    try {
      await axios.post(`${API_BASE_URL}/collections/contact/${customerId}`, {
        contact_method: contactMethod,
        contact_result: result,
        note: `Contacto rápido por ${contactMethod}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchDashboardData();
      fetchActivity();
      alert(`Contacto por ${contactMethod} registrado exitosamente`);
    } catch (error) {
      console.error('Error logging contact:', error);
      alert('Error al registrar el contacto');
    }
  };

  // Utility Functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX');
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-500',
      urgent: 'bg-orange-500', 
      warning: 'bg-yellow-500',
      normal: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const getPriorityText = (priority) => {
    const texts = {
      critical: 'Crítico',
      urgent: 'Urgente',
      warning: 'Advertencia', 
      normal: 'Normal'
    };
    return texts[priority] || 'Normal';
  };

  const formatRelativeTime = (date) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  };

  // Initial Data Load
  useEffect(() => {
    fetchDashboardData();
    fetchRecommendations();
    fetchActivity();
    fetchPerformance();
  }, [fetchDashboardData, fetchRecommendations, fetchActivity, fetchPerformance]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchActivity();
      fetchPerformance();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData, fetchActivity, fetchPerformance]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Cargando sistema de cobranza...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 bg-black text-white min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-crediyaGreen mb-2">
            🎯 Centro de Cobranza Inteligente
          </h1>
          <p className="text-gray-400">
            Sistema avanzado de gestión de cobranza con inteligencia artificial
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Total Vencido</h3>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-red-400">
              {formatCurrency(dashboardData.summary.total_overdue_amount)}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {dashboardData.summary.total_overdue_installments} cuotas vencidas
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Clientes Afectados</h3>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-orange-400">
              {dashboardData.summary.affected_customers}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Promedio: {dashboardData.summary.avg_days_overdue} días
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Cobrado Hoy</h3>
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-3xl font-bold text-green-400">
              {formatCurrency(dashboardData.summary.collected_today)}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {dashboardData.summary.payments_today} pagos registrados
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tasa de Éxito</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {dashboardData.summary.success_rate}%
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Últimos 30 días
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {Object.keys(performance).length > 0 && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">📊 Tu Rendimiento Hoy</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{performance.calls_made || 0}</div>
                <div className="text-sm text-gray-400">Llamadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{performance.whatsapp_sent || 0}</div>
                <div className="text-sm text-gray-400">WhatsApp</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{performance.success_rate || 0}%</div>
                <div className="text-sm text-gray-400">Éxito</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{formatCurrency(performance.collected_amount)}</div>
                <div className="text-sm text-gray-400">Cobrado</div>
              </div>
            </div>
            {performance.goal_progress && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Meta Diaria</span>
                  <span>{performance.goal_progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-crediyaGreen h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, performance.goal_progress)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'recommendations', label: '🤖 Recomendaciones' },
            { id: 'activity', label: '📱 Actividad' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-crediyaGreen text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">📋 Clientes con Pagos Vencidos</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vencido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Días</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Prioridad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {dashboardData.overdue_installments.map((item, index) => (
                    <tr key={`${item.customer_id}-${item.installment_id}`} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-white">{item.customer_name}</div>
                            <div className="text-sm text-gray-400">Préstamo #{item.loan_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{item.customer_phone}</div>
                        <div className="text-sm text-gray-400">{item.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-400">
                          {formatCurrency(item.amount_due)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Vence: {formatDate(item.due_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-red-400">
                          {item.days_overdue}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getPriorityColor(item.priority_level)}`}>
                          {getPriorityText(item.priority_level)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleQuickContact(item.customer_id, 'call')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-all"
                            title="Llamar"
                          >
                            📞
                          </button>
                          <button
                            onClick={() => handleQuickContact(item.customer_id, 'whatsapp')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-all"
                            title="WhatsApp"
                          >
                            💬
                          </button>
                          <button
                            onClick={() => window.open(`/register-payment?customer=${item.customer_id}`, '_blank')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-all"
                            title="Registrar pago"
                          >
                            💰
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {dashboardData.overdue_installments.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold text-white mb-2">¡Excelente!</h3>
                  <p className="text-gray-400">No hay pagos vencidos en este momento.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">🤖 Recomendaciones Inteligentes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white">{rec.name}</h4>
                        <p className="text-sm text-gray-400">{rec.phone}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                        {Math.round(rec.priority_score || 0)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{rec.recommendation_text}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Mejor horario: {rec.best_contact_time}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleQuickContact(rec.customer_id, rec.suggested_method)}
                          className={`px-3 py-1 rounded-lg text-white text-sm transition-all ${
                            rec.suggested_method === 'call' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {rec.suggested_method === 'call' ? '📞' : '💬'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {recommendations.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Sin Recomendaciones</h3>
                  <p className="text-gray-400">No hay recomendaciones disponibles en este momento.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">📱 Actividad Reciente</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activity.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg">
                  <div className="text-2xl">
                    {item.activity_type === 'payment' ? '💰' : '📝'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {item.customer_name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {item.description}
                      {item.amount && ` - ${formatCurrency(item.amount)}`}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatRelativeTime(item.created_at)}
                  </div>
                  {item.agent_name && (
                    <div className="text-xs text-gray-400">
                      por {item.agent_name}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {activity.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-xl font-semibold text-white mb-2">Sin Actividad</h3>
                <p className="text-gray-400">No hay actividad reciente para mostrar.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CollectionsDashboard;
