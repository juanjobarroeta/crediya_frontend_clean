import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import Layout from "../components/Layout";

const InventoryRequest = () => {
  const [activeTab, setActiveTab] = useState("request");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    notes: "",
    quoteFile: null,
    inventoryFile: null,
    store: "atlixco",
    priority: "medium",
    supplier: "",
    expected_delivery: "",
    approval_required: true,
  });
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Inventory categories with icons and descriptions
  const inventoryCategories = [
    { id: "phones", name: "📱 Teléfonos", description: "Smartphones y dispositivos móviles", icon: "📱" },
    { id: "licenses", name: "🔑 Licencias", description: "Software y licencias digitales", icon: "🔑" },
    { id: "accessories", name: "🎧 Accesorios", description: "Cables, cargadores, fundas", icon: "🎧" },
    { id: "computers", name: "💻 Computadoras", description: "Laptops, desktops, tablets", icon: "💻" },
    { id: "network", name: "🌐 Redes", description: "Routers, switches, cables de red", icon: "🌐" },
    { id: "office", name: "🖨️ Oficina", description: "Impresoras, escáneres, consumibles", icon: "🖨️" },
    { id: "security", name: "🔒 Seguridad", description: "Cámaras, alarmas, sistemas", icon: "🔒" },
    { id: "otros", name: "📦 Otros", description: "Otros productos y servicios", icon: "📦" },
  ];

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/inventory-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
      
      // Separate pending approvals
      const pending = res.data.filter(req => req.status === 'pending' || !req.status);
      setPendingApprovals(pending);
    } catch (err) {
      console.error("Error fetching inventory requests:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setForm(prev => ({ ...prev, quoteFile: e.dataTransfer.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("category", form.category);
      formData.append("amount", form.amount);
      formData.append("notes", form.notes);
      formData.append("store_id", form.store);
      formData.append("priority", form.priority);
      formData.append("supplier", form.supplier);
      formData.append("expected_delivery", form.expected_delivery);
      formData.append("approval_required", form.approval_required);
      
      if (form.quoteFile) {
        formData.append("quote", form.quoteFile);
      }

      const res = await axios.post(`${API_BASE_URL}/inventory-requests`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const createdRequest = res.data.request;

      if (form.inventoryFile) {
        const inventoryData = new FormData();
        inventoryData.append("file", form.inventoryFile);
        inventoryData.append("inventory_request_id", createdRequest.id);
        inventoryData.append("store", form.store);

        await axios.post(`${API_BASE_URL}/inventory-items/upload`, inventoryData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setMessage("✅ Solicitud enviada con éxito");
      setForm({ 
        category: "", 
        amount: "", 
        notes: "", 
        quoteFile: null, 
        inventoryFile: null, 
        store: "atlixco",
        priority: "medium",
        supplier: "",
        expected_delivery: "",
        approval_required: true,
      });
      fetchRequests();
    } catch (err) {
      console.error("Error submitting inventory request:", err);
      setMessage("❌ Error al enviar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await axios.put(`${API_BASE_URL}/inventory-requests/${requestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Solicitud aprobada correctamente");
      fetchRequests();
    } catch (err) {
      console.error("Error approving request:", err);
      alert("❌ Error al aprobar la solicitud");
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = prompt("Motivo del rechazo:");
    if (!reason) return;
    
    try {
      await axios.put(`${API_BASE_URL}/inventory-requests/${requestId}/reject`, {
        reason: reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("❌ Solicitud rechazada correctamente");
      fetchRequests();
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("❌ Error al rechazar la solicitud");
    }
  };

  const handleReceiveInventory = async (requestId) => {
    try {
      await axios.put(`${API_BASE_URL}/inventory-requests/${requestId}/receive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("📦 Inventario recibido correctamente");
      fetchRequests();
    } catch (err) {
      console.error("Error receiving inventory:", err);
      alert("❌ Error al recibir el inventario");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const analytics = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const received = requests.filter(r => r.status === 'received').length;
    const totalAmount = requests.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    
    return { total, pending, approved, received, totalAmount };
  }, [requests]);

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">📦 Solicitud de Inventario</h1>
              <p className="text-gray-400">Gestión completa de solicitudes de inventario</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchRequests}
                className="bg-gradient-to-r from-crediyaGreen to-emerald-500 hover:from-emerald-500 hover:to-crediyaGreen text-black font-bold px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-xl text-white">
              <div className="text-2xl font-bold">{analytics.total}</div>
              <div className="text-sm opacity-90">Total Solicitudes</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-4 rounded-xl text-white">
              <div className="text-2xl font-bold">{analytics.pending}</div>
              <div className="text-sm opacity-90">Pendientes</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl text-white">
              <div className="text-2xl font-bold">{analytics.approved}</div>
              <div className="text-sm opacity-90">Aprobadas</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-4 rounded-xl text-white">
              <div className="text-2xl font-bold">{analytics.received}</div>
              <div className="text-sm opacity-90">Recibidas</div>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-4 rounded-xl text-white">
              <div className="text-2xl font-bold">${analytics.totalAmount.toLocaleString()}</div>
              <div className="text-sm opacity-90">Monto Total</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          {[
            { id: "request", label: "📝 Solicitar", icon: "📝" },
            { id: "approvals", label: "✅ Aprobaciones", icon: "✅" },
            { id: "tracking", label: "📊 Seguimiento", icon: "📊" },
            { id: "reception", label: "📦 Recepción", icon: "📦" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-crediyaGreen text-black shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Request Tab */}
        {activeTab === "request" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Request Form */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-crediyaGreen mb-6">📝 Nueva Solicitud de Inventario</h2>
                
                {message && (
                  <div className={`mb-6 p-4 rounded-lg font-medium ${
                    message.startsWith("✅")
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Categoría</label>
                      <select
                        className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-crediyaGreen focus:outline-none"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona una categoría</option>
                        {inventoryCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Sucursal Destino</label>
                      <select
                        className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-crediyaGreen focus:outline-none"
                        name="store"
                        value={form.store}
                        onChange={handleChange}
                        required
                      >
                        <option value="atlixco">🏢 Atlixco</option>
                        <option value="cholula">🏢 Cholula</option>
                        <option value="chipilo">🏢 Chipilo</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Monto Total (MXN)</label>
                      <input
                        type="number"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-crediyaGreen focus:outline-none"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Prioridad</label>
                      <select
                        className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-crediyaGreen focus:outline-none"
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                      >
                        <option value="low">🟢 Baja</option>
                        <option value="medium">🟡 Media</option>
                        <option value="high">🔴 Alta</option>
                        <option value="urgent">🚨 Urgente</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Proveedor</label>
                      <input
                        type="text"
                        name="supplier"
                        value={form.supplier}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-crediyaGreen focus:outline-none"
                        placeholder="Nombre del proveedor"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de Entrega Esperada</label>
                    <input
                      type="date"
                      name="expected_delivery"
                      value={form.expected_delivery}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-crediyaGreen focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Notas (opcional)</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-crediyaGreen focus:outline-none"
                      rows={3}
                      placeholder="Detalles adicionales sobre la solicitud..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="approval_required"
                        checked={form.approval_required}
                        onChange={handleChange}
                        className="mr-2"
                        disabled
                      />
                      ✅ Requiere Aprobación (Obligatorio)
                    </label>
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Cotización del Proveedor</label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          dragActive ? 'border-crediyaGreen bg-green-900/20' : 'border-gray-600'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => setForm({ ...form, quoteFile: e.target.files[0] })}
                          className="hidden"
                          id="quote-upload"
                        />
                        <label htmlFor="quote-upload" className="cursor-pointer">
                          {form.quoteFile ? (
                            <div>
                              <div className="text-crediyaGreen text-lg mb-2">✅ Archivo seleccionado</div>
                              <div className="text-sm text-gray-400">{form.quoteFile.name}</div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-4xl mb-4">📄</div>
                              <div className="text-lg mb-2">Arrastra archivos aquí o haz clic</div>
                              <div className="text-sm text-gray-400">PDF, PNG, JPG hasta 10MB</div>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Archivo de Inventario</label>
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept=".xlsx,.csv"
                          onChange={(e) => setForm({ ...form, inventoryFile: e.target.files[0] })}
                          className="hidden"
                          id="inventory-upload"
                        />
                        <label htmlFor="inventory-upload" className="cursor-pointer">
                          {form.inventoryFile ? (
                            <div>
                              <div className="text-crediyaGreen text-lg mb-2">✅ Archivo seleccionado</div>
                              <div className="text-sm text-gray-400">{form.inventoryFile.name}</div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-4xl mb-4">📊</div>
                              <div className="text-lg mb-2">Arrastra archivos aquí o haz clic</div>
                              <div className="text-sm text-gray-400">Excel, CSV hasta 10MB</div>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-crediyaGreen to-emerald-500 hover:from-emerald-500 hover:to-crediyaGreen text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                  >
                    {loading ? "⏳ Enviando..." : "📦 Enviar Solicitud"}
                  </button>
                </form>
              </div>
            </div>

            {/* Categories Overview */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-crediyaGreen mb-4">📊 Categorías</h3>
                <div className="space-y-3">
                  {inventoryCategories.map(category => (
                    <div key={category.id} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{category.icon}</div>
                        <div>
                          <div className="font-semibold text-white">{category.name}</div>
                          <div className="text-sm text-gray-400">{category.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === "approvals" && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-crediyaGreen mb-6">✅ Aprobaciones Pendientes</h2>
            
            {pendingApprovals.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-4">🎉</div>
                <div className="text-lg mb-2">¡Excelente!</div>
                <div className="text-sm">No hay aprobaciones pendientes</div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((request) => (
                  <div key={request.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            request.priority === 'urgent' ? 'bg-red-900 text-red-200' :
                            request.priority === 'high' ? 'bg-orange-900 text-orange-200' :
                            request.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                            'bg-green-900 text-green-200'
                          }`}>
                            {request.priority === 'urgent' ? '🚨 Urgente' :
                             request.priority === 'high' ? '🔴 Alta' :
                             request.priority === 'medium' ? '🟡 Media' : '🟢 Baja'}
                          </span>
                          <span className="text-sm text-gray-400">
                            {request.created_at ? new Date(request.created_at).toLocaleDateString() : "Sin fecha"}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-gray-400">Categoría</div>
                            <div className="font-semibold">{inventoryCategories.find(c => c.id === request.category)?.name || request.category}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Sucursal</div>
                            <div className="font-semibold">{request.store || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Monto</div>
                            <div className="font-semibold text-crediyaGreen">
                              ${request.amount ? parseFloat(request.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                            </div>
                          </div>
                        </div>
                        
                        {request.notes && (
                          <div className="mt-2">
                            <div className="text-sm text-gray-400">Notas</div>
                            <div className="text-sm">{request.notes}</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                        >
                          ✅ Aprobar
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                        >
                          ❌ Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === "tracking" && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-crediyaGreen mb-6">📊 Seguimiento de Solicitudes</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Categoría</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Sucursal</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Monto</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Prioridad</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Estado</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Fecha</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-3 px-4 text-white">#{request.id}</td>
                      <td className="py-3 px-4 text-white">
                        {inventoryCategories.find(c => c.id === request.category)?.name || request.category}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{request.store || "N/A"}</td>
                      <td className="py-3 px-4 text-white font-semibold">
                        ${request.amount ? parseFloat(request.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.priority === 'urgent' ? 'bg-red-900 text-red-200' :
                          request.priority === 'high' ? 'bg-orange-900 text-orange-200' :
                          request.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-green-900 text-green-200'
                        }`}>
                          {request.priority === 'urgent' ? '🚨 Urgente' :
                           request.priority === 'high' ? '🔴 Alta' :
                           request.priority === 'medium' ? '🟡 Media' : '🟢 Baja'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'pending' || !request.status ? 'bg-yellow-900 text-yellow-200' :
                          request.status === 'approved' ? 'bg-green-900 text-green-200' :
                          request.status === 'rejected' ? 'bg-red-900 text-red-200' :
                          request.status === 'received' ? 'bg-blue-900 text-blue-200' :
                          'bg-gray-900 text-gray-200'
                        }`}>
                          {request.status === 'pending' || !request.status ? '⏳ Pendiente' :
                           request.status === 'approved' ? '✅ Aprobado' :
                           request.status === 'rejected' ? '❌ Rechazado' :
                           request.status === 'received' ? '📦 Recibido' :
                           '❓ Desconocido'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {request.created_at ? new Date(request.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {request.status === 'approved' && (
                            <button
                              onClick={() => handleReceiveInventory(request.id)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              📦 Recibir
                            </button>
                          )}
                          <button className="text-crediyaGreen hover:text-emerald-400 text-sm">
                            👁️ Ver
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reception Tab */}
        {activeTab === "reception" && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-crediyaGreen mb-6">📦 Recepción de Inventario</h2>
            
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-4">📦</div>
              <div className="text-lg mb-2">Recepción de Inventario</div>
              <div className="text-sm">Aquí podrás marcar el inventario como recibido</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InventoryRequest;
