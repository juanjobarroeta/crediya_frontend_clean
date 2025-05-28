import React, { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";


const InventoryRequest = () => {
  const [form, setForm] = useState({
    category: "",
    amount: "",
    notes: "",
    quoteFile: null,
    inventoryFile: null,
    store: "atlixco",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("category", form.category);
      formData.append("amount", form.amount);
      formData.append("notes", form.notes);
      if (form.quoteFile) {
        formData.append("quoteFile", form.quoteFile);
      }

      const res = await axios.post("http://localhost:5001/inventory-requests", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const createdRequest = res.data.request;

      if (form.inventoryFile) {
        const inventoryData = new FormData();
        inventoryData.append("inventoryFile", form.inventoryFile);
        inventoryData.append("inventory_request_id", createdRequest.id);
        inventoryData.append("store", form.store);

        await axios.post("http://localhost:5001/inventory-items/upload", inventoryData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setMessage("✅ Solicitud enviada con éxito");
      setForm({ category: "", amount: "", notes: "", quoteFile: null, inventoryFile: null, store: "atlixco" });
    } catch (err) {
      console.error("Error submitting inventory request:", err);
      setMessage("❌ Error al enviar la solicitud");
    }
  };

  return (
    <Layout>
      <div className="px-6 py-6 max-w-4xl mx-auto bg-black text-white border-t-4 border-lime-500 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Solicitud de Inventario</h2>
        {message && (
          <div
            className={`mb-6 p-4 rounded font-medium ${
              message.startsWith("✅")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold text-white">Categoría</label>
            <select
              className="w-full border border-crediyaGreen rounded-md p-2 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una categoría</option>
              <option value="phones">Teléfonos</option>
              <option value="licenses">Licencias</option>
              <option value="accessories">Accesorios</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-white">Monto total (MXN)</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="w-full border border-crediyaGreen rounded-md p-2 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-white">Notas (opcional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border border-crediyaGreen rounded-md p-2 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
              rows={4}
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-white">Sucursal destino</label>
            <select
              name="store"
              value={form.store}
              onChange={handleChange}
              className="w-full border border-crediyaGreen rounded-md p-2 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
              required
            >
              <option value="atlixco">Atlixco</option>
              <option value="cholula">Cholula</option>
              <option value="chipilo">Chipilo</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-white">Cotización del proveedor (PDF o imagen)</label>
            <input
              type="file"
              name="quoteFile"
              className="w-full border border-crediyaGreen rounded-md p-2 bg-white text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-lime-500 file:text-black hover:file:bg-lime-600"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setForm({ ...form, quoteFile: e.target.files[0] })}
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-white">Archivo de inventario (Excel o CSV)</label>
            <input
              type="file"
              name="inventoryFile"
              className="w-full border border-crediyaGreen rounded-md p-2 bg-white text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-lime-500 file:text-black hover:file:bg-lime-600"
              accept=".xlsx,.csv"
              required
              onChange={(e) => setForm({ ...form, inventoryFile: e.target.files[0] })}
            />
          </div>
          <button
            type="submit"
            className="bg-lime-500 hover:bg-lime-600 text-black px-6 py-2 rounded-md font-bold transition-colors"
          >
            Enviar Solicitud
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default InventoryRequest;
