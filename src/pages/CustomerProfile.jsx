import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [notes, setNotes] = useState([]);
  const [avals, setAvals] = useState([]);
  const [references, setReferences] = useState([]);
  const [newReference, setNewReference] = useState({ name: "", phone: "", curp: "", relationship: "" });
  const [newAval, setNewAval] = useState({ name: "", phone: "", curp: "", address: "" });
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Fetch customer details
        const customerRes = await axios.get(`${API_BASE_URL}/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomer(customerRes.data);

        // Fetch customer loans
        const loansRes = await axios.get(`${API_BASE_URL}/customers/${id}/loans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLoans(loansRes.data);

        // Fetch notes
        const notesRes = await axios.get(`${API_BASE_URL}/customers/${id}/notes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes(notesRes.data);

        // Fetch avals
        const avalsRes = await axios.get(`${API_BASE_URL}/customers/${id}/avals`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvals(avalsRes.data);

        // Fetch references
        const referencesRes = await axios.get(`${API_BASE_URL}/customers/${id}/references`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReferences(referencesRes.data);

      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError("Error al cargar los datos del cliente");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const handleAddNote = async () => {
    if (!note.trim()) return;
    
    try {
      await axios.post(
        `${API_BASE_URL}/customers/${id}/notes`,
        { note },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      setNote("");
      setNoteMessage("✅ Nota guardada exitosamente");
      
      // Refresh notes
      const notesRes = await axios.get(`${API_BASE_URL}/customers/${id}/notes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setNotes(notesRes.data);
      
      setTimeout(() => setNoteMessage(""), 3000);
    } catch (err) {
      console.error("Error saving note:", err);
      setNoteMessage("❌ Error al guardar nota");
      setTimeout(() => setNoteMessage(""), 3000);
    }
  };

  const handleAddAval = async () => {
    if (!newAval.name.trim()) return;
    
    try {
      await axios.post(
        `${API_BASE_URL}/customers/${id}/avals`,
        newAval,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      setNewAval({ name: "", phone: "", curp: "", address: "" });
      
      // Refresh avals
      const avalsRes = await axios.get(`${API_BASE_URL}/customers/${id}/avals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setAvals(avalsRes.data);
    } catch (err) {
      console.error("Error adding aval:", err);
    }
  };

  const handleAddReference = async () => {
    if (!newReference.name.trim()) return;
    
    try {
      await axios.post(
        `${API_BASE_URL}/customers/${id}/references`,
        newReference,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      setNewReference({ name: "", phone: "", curp: "", relationship: "" });
      
      // Refresh references
      const referencesRes = await axios.get(`${API_BASE_URL}/customers/${id}/references`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setReferences(referencesRes.data);
    } catch (err) {
      console.error("Error adding reference:", err);
    }
  };

  const getCustomerStatus = () => {
    const overdueLoans = loans.filter(l => l.status === "atrasado").length;
    const activeLoans = loans.filter(l => ["pending", "approved", "activo"].includes(l.status)).length;
    
    if (overdueLoans > 0) return { status: "overdue", label: "🔴 Con Atrasos", color: "bg-red-900 text-red-200" };
    if (activeLoans > 0) return { status: "active", label: "🟢 Activo", color: "bg-green-900 text-green-200" };
    return { status: "inactive", label: "⚪ Inactivo", color: "bg-gray-700 text-gray-300" };
  };

  const calculateTotals = () => {
    const totalLoaned = loans.reduce((sum, loan) => sum + parseFloat(loan.amount || 0), 0);
    const totalPaid = loans.reduce((sum, loan) => sum + parseFloat(loan.paid_amount || 0), 0);
    const currentBalance = totalLoaned - totalPaid;
    
    return { totalLoaned, totalPaid, currentBalance };
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando perfil del cliente...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !customer) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-gray-400 mb-6">{error || "Cliente no encontrado"}</p>
            <button
              onClick={() => navigate("/customer-directory")}
              className="bg-lime-500 hover:bg-lime-600 text-black px-6 py-3 rounded-lg font-medium"
            >
              ← Volver al Directorio
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const customerStatus = getCustomerStatus();
  const totals = calculateTotals();

  const tabs = [
    { id: "overview", label: "📊 Resumen", icon: "📊" },
    { id: "loans", label: "💰 Préstamos", icon: "💰" },
    { id: "notes", label: "📝 Notas", icon: "📝" },
    { id: "guarantors", label: "👥 Avales", icon: "👥" },
    { id: "references", label: "📞 Referencias", icon: "📞" }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-black border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/customer-directory")}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Volver
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-lime-500 rounded-full flex items-center justify-center text-black font-bold text-2xl">
                  {customer.first_name?.[0]}{customer.last_name?.[0]}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-lime-400">
                    {customer.first_name} {customer.last_name}
                  </h1>
                  <p className="text-gray-400">ID: {customer.id} • {customer.email || "Sin email"}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${customerStatus.color}`}>
                    {customerStatus.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/loans/unified/${customer.id}`}
                className="bg-lime-500 hover:bg-lime-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
              >
                💰 Nuevo Préstamo
              </Link>
              <Link
                to={`/register-payment?customer_id=${customer.id}`}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                💳 Registrar Pago
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-lime-400">${totals.totalLoaned.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Total Prestado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">${totals.totalPaid.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Total Pagado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">${totals.currentBalance.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Balance Actual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{loans.length}</div>
              <div className="text-gray-400 text-sm">Préstamos Totales</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-lime-500 text-black"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Customer Information Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-lime-400 mb-4 flex items-center gap-2">
                    👤 Información Personal
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">CURP:</span>
                      <span>{customer.curp || "No registrado"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fecha de Nacimiento:</span>
                      <span>{customer.birthdate ? new Date(customer.birthdate).toLocaleDateString() : "No registrada"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Teléfono:</span>
                      <span>{customer.phone || "No registrado"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dirección:</span>
                      <span className="text-right">{customer.address || "No registrada"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Empleo:</span>
                      <span>{customer.employment || "No registrado"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ingresos:</span>
                      <span>${parseFloat(customer.income || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-lime-400 mb-4 flex items-center gap-2">
                    📊 Calificación Crediticia
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nivel de Riesgo:</span>
                      <span className="bg-gray-700 px-2 py-1 rounded">Sin historial</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Préstamos Atrasados:</span>
                      <span className="text-red-400">{loans.filter(l => l.status === "atrasado").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Préstamos Activos:</span>
                      <span className="text-green-400">{loans.filter(l => ["pending", "approved", "activo"].includes(l.status)).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Préstamos Finalizados:</span>
                      <span className="text-blue-400">{loans.filter(l => ["liquidado", "completed"].includes(l.status)).length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Loans */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-lime-400 mb-4 flex items-center gap-2">
                  💰 Préstamos Recientes
                </h3>
                {loans.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No hay préstamos registrados</p>
                ) : (
                  <div className="space-y-3">
                    {loans.slice(0, 5).map(loan => (
                      <div key={loan.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium">Préstamo #{loan.id}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(loan.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${parseFloat(loan.amount || 0).toLocaleString()}</div>
                          <div className={`text-sm px-2 py-1 rounded ${
                            loan.status === "atrasado" ? "bg-red-900 text-red-200" :
                            loan.status === "activo" ? "bg-green-900 text-green-200" :
                            "bg-gray-600 text-gray-300"
                          }`}>
                            {loan.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "loans" && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-lime-400 mb-4 flex items-center gap-2">
                💰 Historial de Préstamos
              </h3>
              {loans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💰</div>
                  <h4 className="text-xl font-semibold mb-2">No hay préstamos</h4>
                  <p className="text-gray-400 mb-6">Este cliente no tiene préstamos registrados</p>
                  <Link
                    to={`/loans/unified/${customer.id}`}
                    className="bg-lime-500 hover:bg-lime-600 text-black px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    💰 Crear Primer Préstamo
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-lime-400">ID</th>
                        <th className="px-4 py-3 text-left text-lime-400">Fecha</th>
                        <th className="px-4 py-3 text-left text-lime-400">Monto</th>
                        <th className="px-4 py-3 text-left text-lime-400">Pagado</th>
                        <th className="px-4 py-3 text-left text-lime-400">Balance</th>
                        <th className="px-4 py-3 text-left text-lime-400">Estado</th>
                        <th className="px-4 py-3 text-left text-lime-400">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loans.map(loan => (
                        <tr key={loan.id} className="border-t border-gray-700 hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-3 font-mono text-sm">{loan.id}</td>
                          <td className="px-4 py-3 text-sm">{new Date(loan.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-mono">${parseFloat(loan.amount || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 font-mono">${parseFloat(loan.paid_amount || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 font-mono">${(parseFloat(loan.amount || 0) - parseFloat(loan.paid_amount || 0)).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              loan.status === "atrasado" ? "bg-red-900 text-red-200" :
                              loan.status === "activo" ? "bg-green-900 text-green-200" :
                              loan.status === "liquidado" ? "bg-blue-900 text-blue-200" :
                              "bg-gray-700 text-gray-300"
                            }`}>
                              {loan.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              to={`/loan-details/${loan.id}`}
                              className="text-lime-400 hover:text-lime-300 text-sm font-medium"
                            >
                              Ver Detalles
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-lime-400 mb-4 flex items-center gap-2">
                📝 Notas Internas
              </h3>
              
              {/* Add Note */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <textarea
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-lime-500 focus:outline-none"
                  rows={3}
                  placeholder="Agregar nueva nota sobre el cliente..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="text-sm text-gray-400">
                    Registra comentarios, comportamiento, historial, etc.
                  </div>
                  <button
                    onClick={handleAddNote}
                    disabled={!note.trim()}
                    className="bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 disabled:text-gray-400 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    💾 Guardar Nota
                  </button>
                </div>
                {noteMessage && (
                  <div className="mt-2 text-sm text-gray-300">{noteMessage}</div>
                )}
              </div>

              {/* Notes History */}
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-gray-400">No hay notas registradas</p>
                  </div>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className="p-4 bg-gray-700 rounded-lg border-l-4 border-lime-500">
                      <p className="text-gray-200 mb-2">{note.note}</p>
                      <p className="text-xs text-gray-400">
                        📅 {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "guarantors" && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-lime-400 mb-4 flex items-center gap-2">
                👥 Información de Avales
              </h3>
              
              {/* Add Aval */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h4 className="font-semibold mb-3">Agregar Nuevo Aval</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-lime-500 focus:outline-none"
                    placeholder="Nombre completo"
                    value={newAval.name}
                    onChange={(e) => setNewAval({ ...newAval, name: e.target.value })}
                  />
                  <input
                    className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-lime-500 focus:outline-none"
                    placeholder="Teléfono"
                    value={newAval.phone}
                    onChange={(e) => setNewAval({ ...newAval, phone: e.target.value })}
                  />
                  <input
                    className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-lime-500 focus:outline-none"
                    placeholder="CURP"
                    value={newAval.curp}
                    onChange={(e) => setNewAval({ ...newAval, curp: e.target.value })}
                  />
                  <input
                    className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-lime-500 focus:outline-none"
                    placeholder="Dirección"
                    value={newAval.address}
                    onChange={(e) => setNewAval({ ...newAval, address: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleAddAval}
                  disabled={!newAval.name.trim()}
                  className="bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 disabled:text-gray-400 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ➕ Agregar Aval
                </button>
              </div>

              {/* Avals List */}
              <div className="space-y-4">
                {avals.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">👥</div>
                    <p className="text-gray-400">No hay avales registrados</p>
                  </div>
                ) : (
                  avals.map(aval => (
                    <div key={aval.id} className="p-4 bg-gray-700 rounded-lg border-l-4 border-lime-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold text-lime-400">{aval.name}</p>
                          <p className="text-sm text-gray-300">📱 {aval.phone || "Sin teléfono"}</p>
                          <p className="text-sm text-gray-300">🆔 {aval.curp || "Sin CURP"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">🏠 {aval.address || "Sin dirección"}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            📅 Registrado: {new Date(aval.created_at).toLocaleDateString()}
                          </p>
                          {aval.loan_id && (
                            <p className="text-xs text-gray-400">💰 Préstamo #{aval.loan_id}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "references" && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-lime-400 mb-4 flex items-center gap-2">
                📞 Referencias Personales
              </h3>
              
              {/* Add Reference */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h4 className="font-semibold mb-3">Agregar Nueva Referencia</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-lime-500 focus:outline-none"
                    placeholder="Nombre completo"
                    value={newReference.name}
                    onChange={(e) => setNewReference({ ...newReference, name: e.target.value })}
                  />
                  <input
                    className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-lime-500 focus:outline-none"
                    placeholder="Teléfono"
                    value={newReference.phone}
                    onChange={(e) => setNewReference({ ...newReference, phone: e.target.value })}
                  />
                  <input
                    className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-lime-500 focus:outline-none"
                    placeholder="CURP (opcional)"
                    value={newReference.curp}
                    onChange={(e) => setNewReference({ ...newReference, curp: e.target.value })}
                  />
                  <select
                    className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                    value={newReference.relationship}
                    onChange={(e) => setNewReference({ ...newReference, relationship: e.target.value })}
                  >
                    <option value="">Seleccionar relación</option>
                    <option value="Familiar">👨‍👩‍👧‍👦 Familiar</option>
                    <option value="Amigo">👫 Amigo</option>
                    <option value="Compañero de trabajo">👔 Compañero de trabajo</option>
                    <option value="Vecino">🏠 Vecino</option>
                    <option value="Otro">🤝 Otro</option>
                  </select>
                </div>
                <button
                  onClick={handleAddReference}
                  disabled={!newReference.name.trim()}
                  className="bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 disabled:text-gray-400 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ➕ Agregar Referencia
                </button>
              </div>

              {/* References List */}
              <div className="space-y-4">
                {references.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📞</div>
                    <p className="text-gray-400">No hay referencias registradas</p>
                  </div>
                ) : (
                  references.map(reference => (
                    <div key={reference.id} className="p-4 bg-gray-700 rounded-lg border-l-4 border-lime-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold text-lime-400">{reference.name}</p>
                          <p className="text-sm text-gray-300">📱 {reference.phone || "Sin teléfono"}</p>
                          <p className="text-sm text-gray-300">🆔 {reference.curp || "Sin CURP"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">🤝 {reference.relationship || "Sin relación especificada"}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            📅 Registrado: {new Date(reference.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CustomerProfile;