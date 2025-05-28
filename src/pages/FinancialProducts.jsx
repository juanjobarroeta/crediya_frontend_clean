import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const FinancialProducts = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    title: "",
    interest_rate: "",
    term_weeks: "",
    payment_frequency: "",
    penalty_fee: "",
    down_payment: "",
    notes: "",
  });

  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5001/financial-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching financial products:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        interest_rate: parseFloat(form.interest_rate),
        penalty_fee: parseFloat(form.penalty_fee),
        down_payment: parseFloat(form.down_payment),
        term_weeks: parseInt(form.term_weeks),
      };

      const response = await axios.post("http://localhost:5001/financial-products", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Financial product created:", response.data);
      alert("Producto financiero creado correctamente");

      fetchProducts();
      setForm({
        title: "",
        interest_rate: "",
        term_weeks: "",
        payment_frequency: "",
        penalty_fee: "",
        down_payment: "",
        notes: "",
      });
    } catch (err) {
      console.error("Error creating financial product:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Layout>
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <h2 className="mb-4">Productos Financieros</h2>

      <form className="mb-5" onSubmit={handleSubmit}>
        <div className="row g-3">
          {[
            ["title", "Nombre del producto"],
            ["interest_rate", "Tasa de interés (%)"],
            ["term_weeks", "Plazo (semanas)"],
            ["payment_frequency", "Frecuencia de pago"],
            ["penalty_fee", "Penalización ($)"],
            ["down_payment", "Enganche ($)"],
            ["notes", "Notas"],
          ].map(([name, label]) => (
            <div className="col-md-4" key={name}>
              <input
                type="text"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
                name={name}
                value={form[name]}
                placeholder={label}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>
        <button type="submit" className="mt-4 bg-lime-500 hover:bg-lime-600 text-black font-medium py-2 px-4 rounded">
          Agregar producto financiero
        </button>
      </form>

      <h3 className="text-lg font-semibold mt-10 mb-4 text-white">Plantillas existentes</h3>
      <div className="bg-black border-t-4 border-lime-500 rounded-md overflow-x-auto">
        <table className="min-w-full text-sm text-white">
          <thead className="bg-lime-500 text-black">
            <tr>
              <th>Nombre</th>
              <th>Interés</th>
              <th>Plazo</th>
              <th>Frecuencia</th>
              <th>Enganche</th>
              <th>Penalización</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-gray-700 hover:bg-gray-800">
                <td>{p.title}</td>
                <td>{p.interest_rate}%</td>
                <td>{p.term_weeks} semanas</td>
                <td>{p.payment_frequency}</td>
                <td>${p.down_payment}</td>
                <td>${p.penalty_fee}</td>
                <td>{p.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </Layout>
  );
};

export default FinancialProducts;
