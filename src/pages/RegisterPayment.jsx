import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import Layout from "../components/Layout";

const RegisterPayment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("efectivo");
  const [storeId, setStoreId] = useState("");
  const [installments, setInstallments] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [applyExtraTo, setApplyExtraTo] = useState("next");
  const [lastPayment, setLastPayment] = useState(null);
  const receiptRef = useRef(null);
  const token = localStorage.getItem("token");

  const fetchLoans = async () => {
    try {
      const res = await axios.get("http://localhost:5001/dashboard/loans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFilteredLoans(res.data);
    } catch (err) {
      console.error("Error fetching loans:", err);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoanDetails = async (loanId) => {
    try {
      const [installmentsRes, paymentsRes] = await Promise.all([
        axios.get(`http://localhost:5001/loans/${loanId}/installments`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5001/loans/${loanId}/payments`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setInstallments(installmentsRes.data);
      // Ensure paymentsRes.data includes actual payment records with amounts
      const paymentsWithAmounts = Array.isArray(paymentsRes.data)
        ? paymentsRes.data.filter(p => typeof p.amount !== "undefined")
        : [];
      setPaymentHistory(paymentsWithAmounts);
    } catch (err) {
      console.error("Error fetching loan details:", err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan);
    fetchLoanDetails(loan.id);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;

    try {
      const res = await axios.post("http://localhost:5001/make-installment-payment", {
        loan_id: selectedLoan.id,
        amount: parseFloat(amount),
        method,
        store_id: parseInt(storeId),
        apply_extra_to: applyExtraTo,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`✅ Payment applied: ${res.data.paidInstallments.join(", ")}. Remaining: $${res.data.remaining}`);
      setLastPayment(res.data);
      fetchLoanDetails(selectedLoan.id);
      setAmount("");
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Error registering payment");
    }
  };

  const downloadPDF = async () => {
    const input = receiptRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`recibo_prestamo_${selectedLoan.id}.pdf`);
  };

  const matchingLoans = filteredLoans.filter((loan) =>
    loan.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.id.toString() === searchTerm
  );

  return (
    <Layout>
    <div className="container mt-4 bg-black text-white p-6 rounded-lg shadow-lg border border-crediyaGreen">
      <h2 className="text-2xl font-semibold text-crediyaGreen mb-4">Buscar Cliente / Registrar Pago</h2>

      <input
        type="text"
        className="form-control bg-black text-white border border-crediyaGreen rounded my-3"
        placeholder="Buscar por nombre o ID de préstamo..."
        value={searchTerm}
        onChange={handleSearch}
      />

      <div className="mb-4">
        <h5>Scan Customer QR Code</h5>
        <QrReader
          delay={300}
          onError={(err) => console.error("QR Scan Error:", err)}
          onScan={(data) => {
            if (data) {
              setSearchTerm(data);
            }
          }}
          style={{ width: "100%" }}
        />
      </div>

      {matchingLoans.length > 0 && (
        <div className="max-h-64 overflow-y-auto border border-crediyaGreen rounded-lg mb-4">
          <ul className="list-group">
            {matchingLoans.map(loan => (
              <li key={loan.id} className="flex justify-between items-center bg-black text-white border-b border-crediyaGreen p-3">
                <span>#{loan.id} - {loan.customer_name}</span>
                <button className="bg-crediyaGreen hover:bg-white hover:text-crediyaGreen text-black font-bold py-1 px-3 rounded transition duration-200" onClick={() => handleSelectLoan(loan)}>
                  Seleccionar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedLoan && (
        <>
          <div className="card bg-black text-white border border-crediyaGreen rounded-lg p-4 mb-4">
            <h4>Información del Préstamo</h4>
            <p><strong>Cliente:</strong> {selectedLoan.customer_name}</p>
            <p><strong>Monto:</strong> ${selectedLoan.amount}</p>
            <p><strong>Próximo pago:</strong> {
              installments.filter(i => i.status === "pending").length > 0
                ? (() => {
                    const next = installments.find(i => i.status === "pending");
                    return `${new Date(next.due_date).toLocaleDateString()} — $${next.amount_due}`;
                  })()
                : "✔️ Completado"
            }</p>
            <p><strong>Último pago:</strong> {
              paymentHistory.length > 0 
                ? `${new Date(paymentHistory[paymentHistory.length - 1].payment_date).toLocaleDateString()} — $${paymentHistory[paymentHistory.length - 1].amount}` 
                : "N/A"
            }</p>
            <p><strong>Total pagado:</strong> ${paymentHistory && paymentHistory.length > 0 ? paymentHistory.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0).toFixed(2) : "0.00"}</p>
            <p><strong>Saldo restante:</strong> ${(selectedLoan.amount - paymentHistory.reduce((acc, p) => acc + parseFloat(p.amount), 0)).toFixed(2)}</p>
            <p><strong>Penalidades acumuladas:</strong> ${installments.reduce((acc, i) => acc + parseFloat(i.penalty_applied), 0).toFixed(2)}</p>
          </div>

          <div className="card bg-black text-white border border-crediyaGreen rounded-lg p-4 mb-4">
            <h5>Amortización</h5>
            <ul className="list-group">
              {installments.map(inst => (
                <li key={inst.week_number} className="list-group-item">
                  <strong>Semana {inst.week_number}</strong> — 
                  Fecha: {new Date(inst.due_date).toLocaleDateString()} | 
                  Capital: ${inst.capital_portion} | 
                  Interés: ${inst.interest_portion} | 
                  Penalidad: ${inst.penalty_applied} | 
                  Total: ${parseFloat(inst.amount_due) + parseFloat(inst.penalty_applied)} 
                  <span className="badge bg-secondary ms-2">{inst.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handlePayment} className="mb-4">
            <div className="mb-3">
              <label>Monto a pagar</label>
              <input type="number" className="form-control bg-black text-white border border-crediyaGreen rounded" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label>Método de Pago</label>
              <select className="form-select bg-black text-white border border-crediyaGreen rounded" value={method} onChange={(e) => setMethod(e.target.value)} required>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>

            <div className="mb-3">
              <label>Sucursal</label>
              <select className="form-select bg-black text-white border border-crediyaGreen rounded" value={storeId} onChange={(e) => setStoreId(e.target.value)} required>
                <option value="">Seleccione una sucursal</option>
                <option value="1">Atlixco</option>
                <option value="2">Cholula</option>
                <option value="3">Chipilo</option>
              </select>
            </div>

            <div className="mb-3">
              <label>Aplicar extra a</label>
              <select className="form-select bg-black text-white border border-crediyaGreen rounded" value={applyExtraTo} onChange={(e) => setApplyExtraTo(e.target.value)}>
                <option value="next">Siguiente semana</option>
                <option value="capital">Amortizar capital</option>
              </select>
            </div>

            <button className="bg-crediyaGreen hover:bg-white hover:text-crediyaGreen text-black font-bold py-2 px-4 rounded transition duration-200">Registrar Pago</button>
          </form>

          {lastPayment && (
            <div ref={receiptRef} className="card bg-black text-white border border-crediyaGreen rounded-lg p-4 mb-4">
              <h5>🧾 Último Pago Registrado</h5>
              <p>Cuotas pagadas: {lastPayment.paidInstallments.join(", ")}</p>
              <p>Restante: ${lastPayment.remaining}</p>
              <button className="bg-crediyaGreen hover:bg-white hover:text-crediyaGreen text-black font-bold py-2 px-4 rounded transition duration-200 mt-2" onClick={downloadPDF}>Descargar PDF</button>
            </div>
          )}

          {paymentHistory.length > 0 && (
            <div className="card bg-black text-white border border-crediyaGreen rounded-lg p-4 mb-4">
              <h5>📜 Historial de Pagos</h5>
              <ul className="list-group">
                {paymentHistory.map((p, idx) => (
                  <li key={idx} className="list-group-item">
                    {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "Fecha desconocida"} — ${p.amount} vía {p.method}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
    </Layout>
  );
};

export default RegisterPayment;
