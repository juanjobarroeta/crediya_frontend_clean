import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import Layout from "../components/Layout";

const AdminManualEntry = () => {
  const token = localStorage.getItem("token");
  
  // Add logout function to window for debugging
  React.useEffect(() => {
    window.forceLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    };
    console.log("🔧 Debug: Use window.forceLogout() in console if logout button doesn't work");
  }, []);
  
  const [form, setForm] = useState({
    type: "",
    amount: "",
    description: "",
    store_id: "",
    source: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    try {
      const res = await axios.post(`${API_BASE_URL}/manual-entry`, {
        ...form,
        method: form.source === '1102' ? 'transferencia' : 'efectivo'
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Manual entry response:", res.data);
      setSuccess(true);
      setForm({ type: "", amount: "", description: "", store_id: "", source: "" });
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert("Hubo un error al registrar la entrada.");
    } finally {
      setLoading(false);
    }
  };

  const entryTypes = [
    { value: "capital", label: "Aportación de Capital", icon: "💰", color: "from-green-500 to-emerald-600" },
    { value: "internalLoan", label: "Préstamo Interno", icon: "🏦", color: "from-blue-500 to-cyan-600" },
    { value: "fixedAsset", label: "Activo Fijo", icon: "🏢", color: "from-purple-500 to-violet-600" },
    { value: "retained", label: "Utilidad Retenida", icon: "📈", color: "from-orange-500 to-red-600" },
  ];

  const sourceOptions = [
    { value: "1101", label: "Efectivo (Fondo Fijo de Caja)", icon: "💵" },
    { value: "1102", label: "Transferencia (Cuenta Bancaria)", icon: "🏦" },
  ];

  const storeOptions = [
    { value: "", label: "Ninguna", icon: "🏠" },
    { value: "1", label: "Atlixco", icon: "📍" },
    { value: "2", label: "Cholula", icon: "📍" },
    { value: "3", label: "Chipilo", icon: "📍" },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">📝 Entrada Manual</h1>
              <p className="text-gray-400">Registra movimientos contables manuales en el sistema</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-crediyaGreen to-emerald-500 p-2 rounded-lg">
                <span className="text-2xl">💼</span>
              </div>
              {/* Quick Logout Button */}
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/auth";
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl text-white shadow-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <h3 className="font-semibold">Entrada Registrada Exitosamente</h3>
                <p className="text-sm opacity-90">El movimiento contable ha sido procesado correctamente</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 border-b border-gray-600">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="mr-3">📊</span>
              Registrar Movimiento Contable Manual
            </h2>
            <p className="text-gray-400 text-sm mt-1">Completa los campos para registrar el movimiento en el sistema contable</p>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Entry Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">Tipo de Movimiento</label>
                <div className="grid grid-cols-2 gap-4">
                  {entryTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`relative cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                        form.type === type.value ? 'ring-2 ring-crediyaGreen' : ''
                      }`}
                      onClick={() => setForm({ ...form, type: type.value })}
                    >
                      <div className={`bg-gradient-to-r ${type.color} p-4 rounded-xl text-white text-center shadow-lg hover:shadow-xl transition-all duration-200`}>
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="text-sm font-semibold">{type.label}</div>
                      </div>
                      {form.type === type.value && (
                        <div className="absolute -top-2 -right-2 bg-crediyaGreen text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Monto</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">$</span>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    className="block w-full bg-gray-800 border border-gray-600 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-crediyaGreen focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Descripción</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe el propósito y detalles del movimiento contable..."
                  className="block w-full bg-gray-800 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-crediyaGreen focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              {/* Source Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">Origen del Movimiento</label>
                <div className="grid grid-cols-2 gap-4">
                  {sourceOptions.map((source) => (
                    <div
                      key={source.value}
                      className={`relative cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                        form.source === source.value ? 'ring-2 ring-crediyaGreen' : ''
                      }`}
                      onClick={() => setForm({ ...form, source: source.value })}
                    >
                      <div className={`bg-gradient-to-r ${
                        form.source === source.value 
                          ? 'from-crediyaGreen to-emerald-600' 
                          : 'from-gray-700 to-gray-600'
                      } p-4 rounded-xl text-white text-center shadow-lg hover:shadow-xl transition-all duration-200`}>
                        <div className="text-2xl mb-2">{source.icon}</div>
                        <div className="text-sm font-semibold">{source.label}</div>
                      </div>
                      {form.source === source.value && (
                        <div className="absolute -top-2 -right-2 bg-crediyaGreen text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Store Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">Sucursal (Opcional)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {storeOptions.map((store) => (
                    <div
                      key={store.value}
                      className={`relative cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                        form.store_id === store.value ? 'ring-2 ring-crediyaGreen' : ''
                      }`}
                      onClick={() => setForm({ ...form, store_id: store.value })}
                    >
                      <div className={`bg-gradient-to-r ${
                        form.store_id === store.value 
                          ? 'from-blue-500 to-cyan-600' 
                          : 'from-gray-700 to-gray-600'
                      } p-3 rounded-xl text-white text-center shadow-lg hover:shadow-xl transition-all duration-200`}>
                        <div className="text-xl mb-1">{store.icon}</div>
                        <div className="text-xs font-semibold">{store.label}</div>
                      </div>
                      {form.store_id === store.value && (
                        <div className="absolute -top-2 -right-2 bg-crediyaGreen text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !form.type || !form.amount || !form.source}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    loading 
                      ? 'bg-gray-600 text-gray-300' 
                      : 'bg-gradient-to-r from-crediyaGreen to-emerald-500 hover:from-emerald-500 hover:to-crediyaGreen text-black shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                      Procesando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">💾</span>
                      Registrar Movimiento
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Information Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-4 border border-blue-700/50">
          <div className="flex items-start">
            <span className="text-2xl mr-3">ℹ️</span>
            <div>
              <h3 className="font-semibold text-white mb-1">Información Importante</h3>
              <p className="text-blue-200 text-sm">
                Los movimientos contables manuales se registran inmediatamente en el sistema y afectan directamente 
                los balances de las cuentas correspondientes. Asegúrate de verificar la información antes de confirmar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminManualEntry;