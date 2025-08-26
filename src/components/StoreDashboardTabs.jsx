import React from 'react';

// Tab Components for Store Dashboard
export const OverviewTab = ({ analyticsData, formatCurrency, formatNumber, getTrendIcon }) => {
  const overview = analyticsData.overview[0] || {};
  const financial = analyticsData.financial[0] || {};
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Key Metrics Cards */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Ingresos Totales</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(financial.total_revenue)}</p>
            <p className="text-green-400 text-sm">
              {getTrendIcon(financial.total_revenue, financial.avg_daily_revenue * 30)} 
              vs promedio mensual
            </p>
          </div>
          <div className="text-3xl">💰</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Clientes Únicos</p>
            <p className="text-2xl font-bold text-white">{formatNumber(overview.unique_customers)}</p>
            <p className="text-blue-400 text-sm">
              {formatNumber(overview.active_loans)} préstamos activos
            </p>
          </div>
          <div className="text-3xl">👥</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Transacciones</p>
            <p className="text-2xl font-bold text-white">{formatNumber(financial.total_transactions)}</p>
            <p className="text-purple-400 text-sm">
              {formatCurrency(financial.avg_transaction_value)} promedio
            </p>
          </div>
          <div className="text-3xl">🔄</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Volumen de Préstamos</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(overview.total_loan_amount)}</p>
            <p className="text-orange-400 text-sm">
              {formatNumber(overview.total_loans)} préstamos totales
            </p>
          </div>
          <div className="text-3xl">📊</div>
        </div>
      </div>
    </div>
  );
};

export const FinancialTab = ({ analyticsData, formatCurrency }) => {
  const financial = analyticsData.financial[0] || {};
  
  return (
    <div className="space-y-6">
      {/* Financial Performance Summary */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📈 Rendimiento Financiero</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Ingresos Totales</p>
            <p className="text-3xl font-bold text-green-400">{formatCurrency(financial.total_revenue)}</p>
            <p className="text-gray-500 text-sm">Principal: {formatCurrency(financial.total_principal)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Ingresos por Intereses</p>
            <p className="text-3xl font-bold text-blue-400">{formatCurrency(financial.total_interest)}</p>
            <p className="text-gray-500 text-sm">Penalizaciones: {formatCurrency(financial.total_penalties)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Promedio Diario</p>
            <p className="text-3xl font-bold text-purple-400">{formatCurrency(financial.avg_daily_revenue)}</p>
            <p className="text-gray-500 text-sm">Mejor día: {formatCurrency(financial.best_day_revenue)}</p>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">💹 Desglose de Ingresos</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Capital Cobrado</span>
            <span className="text-white font-semibold">{formatCurrency(financial.total_principal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Intereses</span>
            <span className="text-blue-400 font-semibold">{formatCurrency(financial.total_interest)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Penalizaciones</span>
            <span className="text-yellow-400 font-semibold">{formatCurrency(financial.total_penalties)}</span>
          </div>
          <hr className="border-gray-600" />
          <div className="flex justify-between items-center text-lg">
            <span className="text-white font-bold">Total</span>
            <span className="text-green-400 font-bold">{formatCurrency(financial.total_revenue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CustomersTab = ({ analyticsData, formatCurrency, formatNumber }) => {
  const customers = analyticsData.customers[0] || {};
  
  return (
    <div className="space-y-6">
      {/* Customer Analytics */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">👥 Análisis de Clientes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Clientes Totales</p>
            <p className="text-3xl font-bold text-white">{formatNumber(customers.total_customers)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Nuevos (30 días)</p>
            <p className="text-3xl font-bold text-green-400">{formatNumber(customers.new_customers_30d)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Activos (30 días)</p>
            <p className="text-3xl font-bold text-blue-400">{formatNumber(customers.active_customers_30d)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Nuevos (7 días)</p>
            <p className="text-3xl font-bold text-purple-400">{formatNumber(customers.new_customers_7d)}</p>
          </div>
        </div>
      </div>

      {/* Customer Value Metrics */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">💎 Valor del Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Préstamo Promedio</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(customers.avg_loan_amount)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Préstamos por Cliente</p>
            <p className="text-2xl font-bold text-blue-400">{(customers.loans_per_customer || 0).toFixed(1)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Ingresos por Cliente</p>
            <p className="text-2xl font-bold text-purple-400">{formatCurrency(customers.revenue_per_customer)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OperationalTab = ({ analyticsData, formatPercent, formatNumber }) => {
  const operational = analyticsData.operational[0] || {};
  
  return (
    <div className="space-y-6">
      {/* Operational Efficiency */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">⚙️ Eficiencia Operacional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Personal Total</p>
            <p className="text-3xl font-bold text-white">{formatNumber(operational.staff_count)}</p>
            <p className="text-green-400 text-sm">{formatNumber(operational.active_staff)} activos</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Tasa de Aprobación</p>
            <p className="text-3xl font-bold text-green-400">{formatPercent(operational.approval_rate)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Tiempo de Procesamiento</p>
            <p className="text-3xl font-bold text-blue-400">{(operational.avg_processing_hours || 0).toFixed(1)}h</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Cuotas Vencidas</p>
            <p className="text-3xl font-bold text-red-400">{formatNumber(operational.overdue_installments)}</p>
          </div>
        </div>
      </div>

      {/* Loan Processing Stats */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📋 Procesamiento de Préstamos</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Solicitudes Totales</span>
            <span className="text-white font-semibold">{formatNumber(operational.total_loan_applications)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Aprobados</span>
            <span className="text-green-400 font-semibold">{formatNumber(operational.approved_loans)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Rechazados</span>
            <span className="text-red-400 font-semibold">{formatNumber(operational.rejected_loans)}</span>
          </div>
          <hr className="border-gray-600" />
          <div className="flex justify-between items-center text-lg">
            <span className="text-white font-bold">Tasa de Aprobación</span>
            <span className="text-blue-400 font-bold">{formatPercent(operational.approval_rate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const KPITab = ({ kpiData, formatCurrency, formatPercent, formatNumber, getPerformanceColor }) => {
  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">🎯 Indicadores Clave de Rendimiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Ingresos vs Benchmark</p>
            <p className={`text-2xl font-bold ${getPerformanceColor(kpiData.revenue_vs_benchmark, 100)}`}>
              {formatPercent(kpiData.revenue_vs_benchmark)}
            </p>
            <p className="text-gray-500 text-sm">Benchmark: {formatCurrency(kpiData.avg_revenue_benchmark)}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Tasa de Aprobación</p>
            <p className={`text-2xl font-bold ${getPerformanceColor(kpiData.approval_rate, kpiData.benchmark_approval_rate)}`}>
              {formatPercent(kpiData.approval_rate)}
            </p>
            <p className="text-gray-500 text-sm">Benchmark: {formatPercent(kpiData.benchmark_approval_rate)}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Tasa de Morosidad</p>
            <p className={`text-2xl font-bold ${getPerformanceColor(kpiData.overdue_rate, kpiData.benchmark_overdue_rate, true)}`}>
              {formatPercent(kpiData.overdue_rate)}
            </p>
            <p className="text-gray-500 text-sm">Benchmark: {formatPercent(kpiData.benchmark_overdue_rate)}</p>
          </div>
        </div>
      </div>

      {/* Detailed KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">💰 KPIs Financieros</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Ingresos Totales</span>
              <span className="text-green-400 font-semibold">{formatCurrency(kpiData.total_revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Valor Promedio Transacción</span>
              <span className="text-blue-400 font-semibold">{formatCurrency(kpiData.avg_transaction_value)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Transacciones</span>
              <span className="text-purple-400 font-semibold">{formatNumber(kpiData.total_transactions)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">👥 KPIs de Clientes</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Clientes Únicos</span>
              <span className="text-green-400 font-semibold">{formatNumber(kpiData.unique_customers)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Nuevos Clientes</span>
              <span className="text-blue-400 font-semibold">{formatNumber(kpiData.new_customers)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Préstamos Totales</span>
              <span className="text-purple-400 font-semibold">{formatNumber(kpiData.total_loans)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ComparisonTab = ({ comparisonData, formatCurrency, formatNumber, formatPercent }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">🏆 Comparación de Tiendas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-4 text-gray-300">Tienda</th>
                <th className="text-right py-3 px-4 text-gray-300">Ingresos</th>
                <th className="text-right py-3 px-4 text-gray-300">Clientes</th>
                <th className="text-right py-3 px-4 text-gray-300">Préstamos</th>
                <th className="text-right py-3 px-4 text-gray-300">Morosidad</th>
                <th className="text-center py-3 px-4 text-gray-300">Nivel</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((store, index) => (
                <tr key={store.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white font-semibold">{store.name}</p>
                      <p className="text-gray-400 text-xs">{store.address}</p>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4">
                    <p className="text-green-400 font-semibold">{formatCurrency(store.payments_collected)}</p>
                    <p className="text-gray-500 text-xs">#{store.revenue_rank}</p>
                  </td>
                  <td className="text-right py-3 px-4">
                    <p className="text-blue-400 font-semibold">{formatNumber(store.unique_customers)}</p>
                    <p className="text-gray-500 text-xs">{formatCurrency(store.revenue_per_customer)}/cliente</p>
                  </td>
                  <td className="text-right py-3 px-4">
                    <p className="text-purple-400 font-semibold">{formatNumber(store.total_loans)}</p>
                    <p className="text-gray-500 text-xs">{formatCurrency(store.loan_volume)}</p>
                  </td>
                  <td className="text-right py-3 px-4">
                    <p className={`font-semibold ${store.overdue_rate > 15 ? 'text-red-400' : store.overdue_rate > 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {formatPercent(store.overdue_rate)}
                    </p>
                    <p className="text-gray-500 text-xs">{formatCurrency(store.overdue_amount)}</p>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      store.performance_tier === 'top' ? 'bg-green-900 text-green-300' :
                      store.performance_tier === 'bottom' ? 'bg-red-900 text-red-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {store.performance_tier === 'top' ? 'Alto' : 
                       store.performance_tier === 'bottom' ? 'Bajo' : 'Medio'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
