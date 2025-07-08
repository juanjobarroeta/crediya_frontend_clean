import { API_BASE_URL } from "../utils/constants";
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
  const [loanType, setLoanType] = useState("producto");
  const [cashAmount, setCashAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [storeId, setStoreId] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const [cRes, pRes, fRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/inventory-items`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/financial-products`, {
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

      {/* Step 1.5: Tipo de préstamo */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-crediyaGreen">Tipo de préstamo</label>
        <select
          className="w-full p-2 bg-black border border-crediyaGreen text-white rounded focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
          value={loanType}
          onChange={(e) => setLoanType(e.target.value)}
        >
          <option value="producto">Producto</option>
          <option value="efectivo">Efectivo</option>
        </select>
      </div>

      {loanType === "efectivo" && (
        <div className="mb-4">
          <label className="block mb-2 font-medium text-crediyaGreen">Monto del préstamo en efectivo</label>
          <input
            type="number"
            className="w-full p-2 bg-black border border-crediyaGreen text-white rounded focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
            placeholder="Ej. 3000"
          />
        </div>
      )}

      {/* Step 2: Product */}
      {loanType === "producto" && (
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
                ID: {p.id} – {p.brand} {p.model} – IMEI: {p.imei} – ${p.sale_price}
              </option>
            ))}
          </select>
        </div>
      )}

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

      <div className="mb-4">
        <label className="block mb-2 font-medium text-crediyaGreen">Seleccionar sucursal</label>
        <select
          className="w-full p-2 bg-black border border-crediyaGreen text-white rounded focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
        >
          <option value="">-- Selecciona una sucursal --</option>
          <option value="1">Atlixco</option>
          <option value="2">Cholula</option>
          <option value="3">Chipilo</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium text-crediyaGreen">Notas internas</label>
        <textarea
          className="w-full p-2 bg-black border border-crediyaGreen text-white rounded focus:outline-none focus:ring-2 focus:ring-crediyaGreen"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones internas del préstamo"
        />
      </div>

      {selectedCustomer && (loanType === "efectivo" || selectedProduct) && selectedFinance && (() => {
        const selectedProd = loanType === "producto" ? products.find(p => p.id === parseInt(selectedProduct)) : null;
        const selectedFin = financialProducts.find(fp => fp.id === parseInt(selectedFinance));

        const downPayment = parseFloat(selectedFin.down_payment || 0);
        const productPrice = selectedProd ? parseFloat(selectedProd.sale_price) : 0;
        const principal = loanType === "producto"
          ? productPrice - downPayment
          : parseFloat(cashAmount || 0);
        // Interest calculation as annual rate, proportional to term in weeks (52 weeks = 1 year)
        const annualRate = parseFloat(selectedFin.interest_rate) / 100;
        const termFraction = selectedFin.term_weeks / 52;
        const interest = principal * annualRate * termFraction;
        const total = principal + interest;
        const frequencyMap = {
          diario: 1,
          semanal: 7,
          quincenal: 14,
          mensual: 30
        };
        const intervalDays = frequencyMap[selectedFin.payment_frequency] || 7;
        const totalDays = selectedFin.term_weeks * 7;
        const numPayments = Math.ceil(totalDays / intervalDays);
        const installment = total / numPayments;

        return (
          <div className="mt-6 p-6 bg-[#0f0f0f] border border-crediyaGreen rounded-xl shadow-md">
            <h5>Resumen del préstamo</h5>
            {loanType === "producto" ? (
              <>
                <p><strong>Precio del producto:</strong> ${selectedProd.sale_price}</p>
                <p><strong>Enganche:</strong> ${downPayment}</p>
                <p><strong>Capital a financiar:</strong> ${principal.toFixed(2)}</p>
              </>
            ) : (
              <>
                <p><strong>Tipo de préstamo:</strong> Efectivo</p>
                <p><strong>Capital a financiar:</strong> ${principal.toFixed(2)}</p>
              </>
            )}
            <p><strong>Intereses:</strong> ${interest.toFixed(2)}</p>
            <p><strong>Total a pagar:</strong> ${total.toFixed(2)}</p>
            <p><strong>Pagos {selectedFin.payment_frequency}:</strong> ${installment.toFixed(2)}</p>

            <table className="w-full text-sm mt-4 text-white border border-crediyaGreen">
              <thead>
                <tr>
                  <th>Semana</th>
                  <th>Pago</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: numPayments }).map((_, i) => (
                  <tr key={i}>
                    <td>{selectedFin.payment_frequency} {i + 1}</td>
                    <td>${installment.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              className="mt-4 bg-lime-500 hover:bg-lime-600 text-black font-bold px-6 py-2 rounded transition"
              onClick={async () => {
                if (loanType === "efectivo" && !cashAmount) {
                  alert("Por favor ingresa el monto del préstamo en efectivo.");
                  return;
                }
                try {
                  const res = await axios.post(`${API_BASE_URL}/apply-loan`, {
                    customer_id: selectedCustomer,
                    inventory_item_id: loanType === "producto" ? selectedProduct : null,
                    amount: principal,
                    term: selectedFin.term_weeks,
                    loan_type: loanType,
                    financial_product_id: selectedFinance,
                    store_id: storeId,
                    notes
                  }, {
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  alert("✅ Préstamo creado y producto asignado");
                  setSelectedCustomer("");
                  setSelectedProduct("");
                  setSelectedFinance("");
                  setLoanType("producto");
                  setCashAmount("");
                  setStoreId("");
                  setNotes("");
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
