import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";

const Tesoreria = () => {
  const [inventoryOrders, setInventoryOrders] = useState([]);
  const [expenseOrders, setExpenseOrders] = useState([]);
  const [proofFiles, setProofFiles] = useState({});
  const [paymentMethods, setPaymentMethods] = useState({});
  const [paidInventoryOrders, setPaidInventoryOrders] = useState([]);
  const [paidExpenseOrders, setPaidExpenseOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/treasury/payment-orders`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setInventoryOrders(res.data.inventory || []);
      setExpenseOrders(res.data.expenses || []);

      const historyRes = await axios.get(`${API_BASE_URL}/treasury/payment-orders/history`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setPaidInventoryOrders(historyRes.data.inventory || []);
      setPaidExpenseOrders(historyRes.data.expenses || []);
    } catch (err) {
      console.error("Error fetching payment orders:", err);
    }
  };

  const handlePaymentConfirmation = async (type, id) => {
    const file = proofFiles[id];
    if (!file) return alert("Por favor sube un comprobante antes de confirmar.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", id);
    formData.append("type", type);
    formData.append("method", paymentMethods[id] || "efectivo");

    // Debug log of what is being submitted
    console.log("🔍 Submitting payment:", {
      id,
      type,
      method: paymentMethods[id],
      file: proofFiles[id]
    });

    try {
      await axios.post(`${API_BASE_URL}/treasury/mark-paid`, formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Pago registrado correctamente.");
      await new Promise(resolve => setTimeout(resolve, 500)); // give the backend time to commit
      await fetchOrders();
    } catch (err) {
      console.error("Error uploading proof:", err);
      alert("Error al registrar el pago.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const today = new Date();
  const expensesDueTodayOrOverdue = expenseOrders.filter(
    e => e.status === "approved" && new Date(e.due_date) <= today
  );
  const expensesNotYetDue = expenseOrders.filter(
    e => e.status === "approved" && new Date(e.due_date) > today
  );

  return (
    <Layout>
    <div className="p-6 bg-black text-white min-h-screen">
      <h2>Tesorería - Órdenes de Pago</h2>

      <h4 className="mt-5">Pagos de Inventario</h4>
      <table className="w-full border border-crediyaGreen text-sm">
        <thead>
          <tr>
            <th className="bg-crediyaGreen text-black font-bold">ID</th>
            <th className="bg-crediyaGreen text-black font-bold">Categoría</th>
            <th className="bg-crediyaGreen text-black font-bold">Monto</th>
            <th className="bg-crediyaGreen text-black font-bold">Notas</th>
            <th className="bg-crediyaGreen text-black font-bold">Ver Cotización</th>
            <th className="bg-crediyaGreen text-black font-bold">Comprobante</th>
            <th className="bg-crediyaGreen text-black font-bold">Método</th>
            <th className="bg-crediyaGreen text-black font-bold">Acción</th>
          </tr>
        </thead>
        <tbody>
          {inventoryOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.category}</td>
              <td>${order.amount}</td>
              <td>{order.notes}</td>
              <td>
                {order.quote_path ? (
                  <a
                    href={`${API_BASE_URL}/uploads/${order.quote_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver PDF
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td>
                <input
                  type="file"
                  className="bg-black text-white border border-crediyaGreen p-1 rounded"
                  onChange={(e) => setProofFiles({ ...proofFiles, [order.id]: e.target.files[0] })}
                />
              </td>
              <td>
                <select
                  className="bg-black text-white border border-crediyaGreen p-1 rounded"
                  onChange={(e) => setPaymentMethods({ ...paymentMethods, [order.id]: e.target.value })}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </td>
              <td>
                <button className="bg-crediyaGreen text-black font-bold px-3 py-1 rounded hover:bg-white hover:text-crediyaGreen transition" onClick={() => handlePaymentConfirmation("inventory", order.id)}>
                  Marcar como Pagado
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="mt-5">Pagos de Gastos Generales - Vencidos o Hoy</h4>
      <table className="w-full border border-crediyaGreen text-sm">
        <thead>
          <tr>
            <th className="bg-crediyaGreen text-black font-bold">ID</th>
            <th className="bg-crediyaGreen text-black font-bold">Tipo</th>
            <th className="bg-crediyaGreen text-black font-bold">Monto</th>
            <th className="bg-crediyaGreen text-black font-bold">Descripción</th>
            <th className="bg-crediyaGreen text-black font-bold">Comprobante</th>
            <th className="bg-crediyaGreen text-black font-bold">Método</th>
            <th className="bg-crediyaGreen text-black font-bold">Acción</th>
          </tr>
        </thead>
        <tbody>
          {expensesDueTodayOrOverdue.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.id}</td>
              <td>{expense.type || "-"}</td>
              <td>${parseFloat(expense.amount || 0).toLocaleString()}</td>
              <td>{expense.description || "-"}</td>
              <td>
                <input
                  type="file"
                  className="bg-black text-white border border-crediyaGreen p-1 rounded"
                  onChange={(e) => setProofFiles({ ...proofFiles, [expense.id]: e.target.files[0] })}
                />
              </td>
              <td>
                <select
                  className="bg-black text-white border border-crediyaGreen p-1 rounded"
                  onChange={(e) => setPaymentMethods({ ...paymentMethods, [expense.id]: e.target.value })}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </td>
              <td>
                <button className="bg-yellow-400 text-black font-bold px-3 py-1 rounded hover:bg-white hover:text-yellow-500 transition" onClick={() => handlePaymentConfirmation("expense", expense.id)}>
                  Marcar como Pagado
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="mt-5">Pagos de Gastos Generales - Pendientes Futuras</h4>
      <table className="w-full border border-crediyaGreen text-sm">
        <thead>
          <tr>
            <th className="bg-crediyaGreen text-black font-bold">ID</th>
            <th className="bg-crediyaGreen text-black font-bold">Tipo</th>
            <th className="bg-crediyaGreen text-black font-bold">Monto</th>
            <th className="bg-crediyaGreen text-black font-bold">Descripción</th>
            <th className="bg-crediyaGreen text-black font-bold">Comprobante</th>
            <th className="bg-crediyaGreen text-black font-bold">Método</th>
            <th className="bg-crediyaGreen text-black font-bold">Acción</th>
          </tr>
        </thead>
        <tbody>
          {expensesNotYetDue.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.id}</td>
              <td>{expense.type || "-"}</td>
              <td>${parseFloat(expense.amount || 0).toLocaleString()}</td>
              <td>{expense.description || "-"}</td>
              <td>
                <input
                  type="file"
                  className="bg-black text-white border border-crediyaGreen p-1 rounded"
                  onChange={(e) => setProofFiles({ ...proofFiles, [expense.id]: e.target.files[0] })}
                />
              </td>
              <td>
                <select
                  className="bg-black text-white border border-crediyaGreen p-1 rounded"
                  onChange={(e) => setPaymentMethods({ ...paymentMethods, [expense.id]: e.target.value })}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </td>
              <td>
                <button className="bg-yellow-400 text-black font-bold px-3 py-1 rounded hover:bg-white hover:text-yellow-500 transition" onClick={() => handlePaymentConfirmation("expense", expense.id)}>
                  Marcar como Pagado
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="mt-10">Historial de Pagos de Inventario</h4>
      <table className="w-full border border-crediyaGreen text-sm mt-2">
        <thead>
          <tr>
            <th className="bg-crediyaGreen text-black font-bold">ID</th>
            <th className="bg-crediyaGreen text-black font-bold">Categoría</th>
            <th className="bg-crediyaGreen text-black font-bold">Monto</th>
            <th className="bg-crediyaGreen text-black font-bold">Notas</th>
            <th className="bg-crediyaGreen text-black font-bold">Fecha de Pago</th>
            <th className="bg-crediyaGreen text-black font-bold">Método</th>
          </tr>
        </thead>
        <tbody>
          {paidInventoryOrders.map((order) => (
            <tr key={order.id}>
              <td className="text-center">{order.id}</td>
              <td className="text-center">{order.category}</td>
              <td className="text-center">${order.amount}</td>
              <td className="text-center">{order.notes}</td>
              <td className="text-center">{new Date(order.updated_at).toLocaleDateString()}</td>
              <td className="text-center">{order.method || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="mt-10">Historial de Pagos de Gastos Generales</h4>
      <table className="w-full border border-crediyaGreen text-sm mt-2">
        <thead>
          <tr>
            <th className="bg-crediyaGreen text-black font-bold">ID</th>
            <th className="bg-crediyaGreen text-black font-bold">Tipo</th>
            <th className="bg-crediyaGreen text-black font-bold">Monto</th>
            <th className="bg-crediyaGreen text-black font-bold">Descripción</th>
            <th className="bg-crediyaGreen text-black font-bold">Fecha de Pago</th>
            <th className="bg-crediyaGreen text-black font-bold">Método</th>
          </tr>
        </thead>
        <tbody>
          {paidExpenseOrders.map((expense) => (
            <tr key={expense.id}>
              <td className="text-center">{expense.id}</td>
              <td className="text-center">{expense.type || "-"}</td>
              <td className="text-center">${parseFloat(expense.amount || 0).toLocaleString()}</td>
              <td className="text-center">{expense.description || "-"}</td>
              <td className="text-center">{new Date(expense.updated_at).toLocaleDateString()}</td>
              <td className="text-center">{expense.method || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </Layout>
  );
};

export default Tesoreria;