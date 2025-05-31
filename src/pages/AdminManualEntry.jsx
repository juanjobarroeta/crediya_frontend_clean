import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import Layout from "../components/Layout";

const AdminManualEntry = () => {
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    type: "",
    amount: "",
    description: "",
    store_id: "",
    source: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      alert("Entrada registrada correctamente.");
      setForm({ type: "", amount: "", description: "", store_id: "", source: "" });
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert("Hubo un error al registrar la entrada.");
    }
  };

  return (
    <Layout>
    <div className="p-6 max-w-3xl mx-auto mt-10 bg-black rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold mb-8 text-white">Registrar Movimiento Contable Manual</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Tipo</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="block w-full bg-black border border-crediyaGreen text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="capital">Aportación de Capital</option>
            <option value="internalLoan">Préstamo Interno</option>
            <option value="fixedAsset">Activo Fijo</option>
            <option value="retained">Utilidad Retenida</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Monto</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="block w-full bg-black border border-crediyaGreen text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="2"
            className="block w-full bg-black border border-crediyaGreen text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Origen del Movimiento</label>
          <select
            name="source"
            value={form.source}
            onChange={handleChange}
            className="block w-full bg-black border border-crediyaGreen text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="1101">Efectivo (Fondo Fijo de Caja)</option>
            <option value="1102">Transferencia (Cuenta Bancaria)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Sucursal (opcional)</label>
          <select
            name="store_id"
            value={form.store_id}
            onChange={handleChange}
            className="block w-full bg-black border border-crediyaGreen text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
          >
            <option value="">Ninguna</option>
            <option value="1">Atlixco</option>
            <option value="2">Cholula</option>
            <option value="3">Chipilo</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-crediyaGreen text-black font-semibold px-4 py-2 rounded hover:bg-white hover:text-crediyaGreen transition"
        >
          Registrar
        </button>
      </form>
    </div>
    </Layout>
  );
};

export default AdminManualEntry;