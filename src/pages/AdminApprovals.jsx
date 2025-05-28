import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const storeNames = {
  1: "Atlixco",
  2: "Cholula",
  3: "Chipilo"
};

const AdminApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5001/inventory-requests", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setRequests(res.data.requests || res.data || []);
        console.log("📦 Inventory Requests:", res.data.requests || res.data || []);
      } catch (err) {
        console.error("Error fetching inventory requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axios.get("http://localhost:5001/expenses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const filtered = res.data.filter(e => e.status === 'requested');
        setExpenses(filtered);
      } catch (err) {
        console.error("Error fetching expenses:", err);
      }
    };
    fetchExpenses();
  }, []);

  const handleAction = async (id, action, type = "inventory") => {
    if (type === "expense") {
      const endpoint = action === "approve" ? "approve" : "cancel";
      try {
        await axios.put(`http://localhost:5001/expenses/${id}/${endpoint}`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const res = await axios.get("http://localhost:5001/expenses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const filtered = res.data.filter(e => e.status === 'requested');
        setExpenses(filtered);
      } catch (err) {
        console.error(`Error processing ${action}:`, err);
      }
      return;
    }

    const endpoints = {
      approve: "approve",
      pay: "pay",
      receive: "receive",
    };

    try {
      await axios.put(`http://localhost:5001/inventory-requests/${id}/${endpoints[action]}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // Refresh data
      const res = await axios.get("http://localhost:5001/inventory-requests", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRequests(res.data.requests || res.data || []);
    } catch (err) {
      console.error(`Error processing ${action}:`, err);
    }
  };

  console.log("🧪 Rendering AdminApprovals with requests:", requests);
  console.log("🧑‍💼 Current user:", user);

  if (loading) return <p>Cargando solicitudes...</p>;

  return (
    <Layout>
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-white">Aprobaciones de Inventario</h2>
      {requests.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay solicitudes pendientes.</p>
      ) : (
        <div className="row">
          {requests.map((req) => (
            <div key={req.id} className="col-md-6 mb-4">
              <div className="bg-black border-t-4 border-lime-500 text-white rounded-md p-4 shadow mb-6">
                <h5>{req.category}</h5>
                <p><strong>Monto:</strong> ${req.amount}</p>
                <p><strong>Notas:</strong> {req.notes || "N/A"}</p>
                <p><strong>Estado:</strong> {req.status}</p>
                {req.quote_path && (
                  <p>
                    <strong>Cotización: </strong>
                    <a
                      href={`http://localhost:5001/uploads/${req.quote_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Ver cotización
                    </a>
                  </p>
                )}
                {req.status === "pending_admin_approval" && (
                  <button className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-1 rounded text-sm me-2" onClick={() => handleAction(req.id, "approve")}>
                    Aprobar
                  </button>
                )}
                {req.status === "approved_by_admin" && (
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-1 rounded text-sm me-2" onClick={() => handleAction(req.id, "pay")}>
                    Marcar como Pagado
                  </button>
                )}
                {req.status === "paid_by_treasury" && (
                  <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-1 rounded text-sm" onClick={() => handleAction(req.id, "receive")}>
                    Marcar como Recibido
                  </button>
                )}
                {/* Future: Approve / Reject buttons */}
              </div>
            </div>
          ))}
        </div>
        
      )}

      <h2 className="text-xl font-semibold mb-6 text-white mt-5">Aprobaciones de Gastos</h2>
      {expenses.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay gastos por aprobar.</p>
      ) : (
        <div className="row">
          {expenses.map((e) => (
            <div key={e.id} className="col-md-6 mb-4">
              <div className="bg-black border-t-4 border-lime-500 text-white rounded-md p-4 shadow mb-6">
                <h5>{e.type}</h5>
                <p><strong>Monto:</strong> ${e.amount}</p>
                <p><strong>Notas:</strong> {e.description || "N/A"}</p>
                <p><strong>Sucursal:</strong> {storeNames[e.store_id] || "N/A"}</p>
                <p><strong>Fecha de Solicitud:</strong> {new Date(e.created_at).toLocaleDateString()}</p>
                <p><strong>Días de Crédito:</strong> {e.days_of_credit || "0"}</p>
                <p><strong>Fecha de Vencimiento:</strong> {e.due_date ? new Date(e.due_date).toLocaleDateString() : "N/A"}</p>
                {e.quote_path && (
                  <p>
                    <strong>Cotización:</strong>{" "}
                    <a
                      href={`http://localhost:5001/uploads/${e.quote_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Ver cotización
                    </a>
                  </p>
                )}
                <div className="d-flex justify-content-start mt-2">
                  <button className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-1 rounded text-sm me-2" onClick={() => handleAction(e.id, "approve", "expense")}>
                    Aprobar
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-1 rounded text-sm" onClick={() => handleAction(e.id, "cancel", "expense")}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </Layout>
  );
  
};

export default AdminApprovals;
