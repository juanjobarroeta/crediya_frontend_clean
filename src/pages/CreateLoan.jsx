import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";


const CreateLoan = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [financialProducts, setFinancialProducts] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedFinance, setSelectedFinance] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const [cRes, pRes, fRes] = await Promise.all([
        axios.get("http://localhost:5001/customers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5001/inventory-items", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5001/financial-products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCustomers(cRes.data);
      setProducts(pRes.data.filter(p => p.status === "in_stock"));
      setFinancialProducts(fRes.data);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
    <div className="p-6 bg-black text-white max-w-3xl mx-auto rounded-xl shadow-lg border border-crediyaGreen">
      <h2 className="mb-4">Crear nuevo préstamo</h2>

      {/* Step 1: Customer */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-crediyaGreen">Seleccionar cliente</label>
        <select
          className="w-full p-2 bg-black border border-crediyaGreen text-white rounded focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">-- Selecciona un cliente --</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {`${c.first_name} ${c.last_name}`} – ID: {c.id}
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Product */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-crediyaGreen">Seleccionar producto (inventario)</label>
        <select
          className="w-full p-2 bg-black border border-crediyaGreen text-white rounded focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">-- Selecciona un producto --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.brand} {p.model} – ${p.sale_price}
            </option>
          ))}
        </select>
      </div>

      {/* Step 3: Financial Product */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-crediyaGreen">Seleccionar producto financiero</label>
        <select
          className="w-full p-2 bg-black border border-crediyaGreen text-white rounded focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
          value={selectedFinance}
          onChange={(e) => setSelectedFinance(e.target.value)}
        >
          <option value="">-- Selecciona un producto financiero --</option>
          {financialProducts.map((fp) => (
            <option key={fp.id} value={fp.id}>
              {fp.title} – {fp.term_weeks} semanas @ {fp.interest_rate}%
            </option>
          ))}
        </select>
      </div>

      {selectedCustomer && selectedProduct && selectedFinance && (() => {
        const selectedProd = products.find(p => p.id === parseInt(selectedProduct));
        const selectedFin = financialProducts.find(fp => fp.id === parseInt(selectedFinance));

        const downPayment = parseFloat(selectedFin.down_payment || 0);
        const principal = parseFloat(selectedProd.sale_price) - downPayment;
        const interest = principal * (parseFloat(selectedFin.interest_rate) / 100);
        const total = principal + interest;
        const weekly = total / selectedFin.term_weeks;

        return (
          <div className="mt-6 p-6 bg-[#0f0f0f] border border-crediyaGreen rounded-xl shadow-md">
            <h5>Resumen del préstamo</h5>
            <p><strong>Precio del producto:</strong> ${selectedProd.sale_price}</p>
            <p><strong>Enganche:</strong> ${downPayment}</p>
            <p><strong>Capital a financiar:</strong> ${principal.toFixed(2)}</p>
            <p><strong>Intereses:</strong> ${interest.toFixed(2)}</p>
            <p><strong>Total a pagar:</strong> ${total.toFixed(2)}</p>
            <p><strong>Pagos semanales:</strong> ${weekly.toFixed(2)}</p>

            <table className="w-full text-sm mt-4 text-white border border-crediyaGreen">
              <thead>
                <tr>
                  <th>Semana</th>
                  <th>Pago</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: selectedFin.term_weeks }).map((_, i) => (
                  <tr key={i}>
                    <td>Semana {i + 1}</td>
                    <td>${weekly.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              className="mt-4 bg-lime-500 hover:bg-lime-600 text-black font-bold px-6 py-2 rounded transition"
              onClick={async () => {
                try {
                  const res = await axios.post("http://localhost:5001/apply-loan", {
                    customer_id: selectedCustomer,
                    inventory_item_id: selectedProduct,
                    amount: principal,
                    term: selectedFin.term_weeks,
                  }, {
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  alert("✅ Préstamo creado y producto asignado");
                  setSelectedCustomer("");
                  setSelectedProduct("");
                  setSelectedFinance("");
                  fetchData();
                } catch (err) {
                  console.error("Error creando el préstamo:", err);
                  alert("❌ Error al crear el préstamo");
                }
              }}
            >
              Crear préstamo
            </button>
          </div>
        );
      })()}
    </div>
    </Layout>
  );
};

export default CreateLoan;
