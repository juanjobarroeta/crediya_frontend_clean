import { API_BASE_URL } from "../utils/constants";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const AdminExpenses = () => {
  const token = localStorage.getItem("token");
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    store_id: "",
    type: "",
    amount: "",
    description: "",
    days_of_credit: ""
  });
  const [quoteFile, setQuoteFile] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuoteUpload = (e) => {
    setQuoteFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting expense:", { ...form, quoteFile });
    try {
      const formData = new FormData();
      formData.append("store_id", form.store_id);
      formData.append("type", form.type);
      formData.append("amount", parseFloat(form.amount).toFixed(2));
      formData.append("description", form.description);
      formData.append("days_of_credit", form.days_of_credit);
      if (quoteFile) {
        formData.append("quote", quoteFile);
      }
      await axios.post(`${API_BASE_URL}/expenses`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setForm({ store_id: "", type: "", amount: "", description: "", days_of_credit: "" });
      setQuoteFile(null);
      fetchExpenses();
    } catch (err) {
      console.error("Error saving expense:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <Layout>
    <div className="p-6 bg-black text-white max-w-5xl mx-auto rounded-xl shadow-lg border border-crediyaGreen">
      <h2 className="text-2xl font-bold text-crediyaGreen mb-4">Registrar Gasto</h2>
      <form className="row g-3 mb-5" onSubmit={handleSubmit}>
        <div className="col-md-2">
          <select
            className="w-full p-2 bg-black text-white border border-crediyaGreen rounded focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
            name="store_id"
            value={form.store_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona Sucursal</option>
            <option value="1">Atlixco</option>
            <option value="2">Cholula</option>
            <option value="3">Chipilo</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="w-full p-2 bg-black text-white border border-crediyaGreen rounded focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="">Tipo de gasto</option>
            <option value="Nómina">Nómina</option>
            <option value="Renta">Renta</option>
            <option value="Agua">Agua</option>
            <option value="Luz">Luz</option>
            <option value="Internet">Internet</option>
            <option value="Software">Software</option>
            <option value="Limpieza">Limpieza</option>
            <option value="Seguridad">Seguridad</option>
            <option value="Buró de Crédito">Buró de Crédito</option>
            <option value="Pauta">Pauta</option>
            <option value="Flyers">Flyers</option>
            <option value="Papelería">Papelería</option>
            <option value="Otros Gastos">Otros Gastos</option>
          </select>
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="w-full p-2 bg-black text-white border border-crediyaGreen rounded focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
            placeholder="Monto"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="w-full p-2 bg-black text-white border border-crediyaGreen rounded focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
            placeholder="Descripción"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="w-full p-2 bg-black text-white border border-crediyaGreen rounded focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
            placeholder="Días de crédito"
            name="days_of_credit"
            value={form.days_of_credit}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3">
          <input
            type="file"
            className="w-full p-2 bg-black text-white border border-crediyaGreen rounded focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
            onChange={handleQuoteUpload}
            accept=".pdf,.png,.jpg,.jpeg"
          />
        </div>
        <div className="col-md-1 d-grid">
          <button className="bg-crediyaGreen text-black font-bold px-4 py-2 rounded hover:bg-white hover:text-crediyaGreen transition">Guardar</button>
        </div>
      </form>

      <h5 className="text-xl text-crediyaGreen mt-8 mb-2">Gastos Registrados</h5>
      <table className="w-full text-sm text-left text-white border border-crediyaGreen">
        <thead className="bg-crediyaGreen text-black">
          <tr>
            <th>Fecha</th>
            <th>Sucursal</th>
            <th>Tipo</th>
            <th>Monto</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id} className="border-t border-crediyaGreen bg-black">
              <td className="p-2 border border-crediyaGreen">{new Date(e.created_at).toLocaleDateString()}</td>
              <td className="p-2 border border-crediyaGreen">{e.store_id}</td>
              <td className="p-2 border border-crediyaGreen">{e.type}</td>
              <td className="p-2 border border-crediyaGreen">${e.amount}</td>
              <td className="p-2 border border-crediyaGreen">{e.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </Layout>
  );
};

export default AdminExpenses;
