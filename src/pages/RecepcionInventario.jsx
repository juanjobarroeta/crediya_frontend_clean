import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";

const RecepcionInventario = () => {
  const token = localStorage.getItem("token");
  const [requests, setRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchDeliveries();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/warehouse/pending-inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("📦 Requests from backend:", res.data);
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/warehouse/pending-customer-deliveries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("📦 Deliveries from backend:", res.data);
      setDeliveries(res.data || []);
    } catch (err) {
      console.error("Error fetching deliveries:", err);
    }
  };

  const markAsReceived = async (id, amount) => {
    const confirm = window.confirm("¿Estás seguro que deseas marcar este inventario como recibido y aceptar responsabilidad?");
    if (!confirm) return;

    try {
        await axios.put(`${API_BASE_URL}/inventory-requests/${id}/receive`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          alert("Inventario marcado como recibido");
          setRequests(prev => prev.filter(req => req.id !== id));
          fetchDeliveries(); // added line
    } catch (err) {
      console.error("Error marking as received:", err);
      alert("Error al marcar como recibido.");
    }
  };

  const deliverPhone = async (loanId) => {
    const confirm = window.confirm("¿Confirmar entrega del teléfono al cliente? Esto moverá el valor al balance.");
    if (!confirm) return;

    try {
      await axios.post(`${API_BASE_URL}/loans/${loanId}/deliver`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Teléfono entregado correctamente.");
      setDeliveries(prev => prev.filter(d => d.loan_id !== loanId));
    } catch (err) {
      console.error("Error delivering phone:", err);
      alert("Error al entregar el teléfono.");
    }
  };

  return (
    <Layout>
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-white">Recepción de Inventario</h2>
      {requests.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay solicitudes pendientes de recepción.</p>
      ) : (
        <div className="bg-black border-t-4 border-lime-500 rounded-md overflow-x-auto mb-10">
          <table className="min-w-full text-sm text-white">
            <thead className="bg-lime-500 text-black">
              <tr>
                <th>ID</th>
                <th>Categoría</th>
                <th>Monto</th>
                <th>Notas</th>
                <th>Cotización</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={`request-${req.id}`} className="border-t border-gray-700 hover:bg-gray-800">
                  <td>{req.id}</td>
                  <td>{req.category}</td>
                  <td>${req.amount}</td>
                  <td>{req.notes || "N/A"}</td>
                  <td>
                    {req.quote_path ? (
                      <a href={`${API_BASE_URL}/uploads/${req.quote_path}`} target="_blank" rel="noreferrer" className="text-lime-400 hover:underline">
                        Ver cotización
                      </a>
                    ) : (
                      "No disponible"
                    )}
                  </td>
                  <td>
                    <button className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-1 rounded text-sm" onClick={() => markAsReceived(req.id, req.amount)}>
                      Marcar como Recibido
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <h2 className="text-xl font-semibold mt-10 mb-6 text-white">Entregas Pendientes a Clientes</h2>
      {deliveries.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay teléfonos pendientes de entrega.</p>
      ) : (
        <div className="bg-black border-t-4 border-lime-500 rounded-md overflow-x-auto mb-10">
          <table className="min-w-full text-sm text-white">
            <thead className="bg-lime-500 text-black">
              <tr>
                <th>Loan ID</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Monto</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((item) => (
                <tr key={`delivery-${item.loan_id || Math.random()}`} className="border-t border-gray-700 hover:bg-gray-800">
                  <td>{item.loan_id}</td>
                  <td>{item.customer}</td>
                  <td>{item.product}</td>
                  <td>${item.amount}</td>
                  <td>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-1 rounded text-sm" onClick={() => deliverPhone(item.loan_id)}>
                      Entregar Teléfono
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default RecepcionInventario;