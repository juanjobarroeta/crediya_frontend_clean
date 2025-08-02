import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import Layout from "../components/Layout";
import MovementLog from "../components/MovementLog";
import { API_BASE_URL } from "../utils/constants";

const RegisterPayment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [customerLoans, setCustomerLoans] = useState([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("efectivo");
  const [storeId, setStoreId] = useState("");
  const [installments, setInstallments] = useState([]);
  const [movements, setMovements] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentBreakdowns, setPaymentBreakdowns] = useState([]);
  const [applyExtraTo, setApplyExtraTo] = useState("next");
  const [lastPayment, setLastPayment] = useState(null);
  const receiptRef = useRef(null);
  const token = localStorage.getItem("token");
  // Collapsible section states
  const [showLoanInfo, setShowLoanInfo] = useState(true);
  const [showAmortization, setShowAmortization] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showLastPayment, setShowLastPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showMovements, setShowMovements] = useState(false);

  const fetchLoans = async () => {
    try {
      // Fetch customers with loan summary
      const res = await axios.get(`${API_BASE_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFilteredCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  useEffect(() => {
    fetchLoans();
    console.log("🔁 Fetched customers on mount");
  }, []);

  const fetchLoanDetails = async (loanId) => {
    if (!loanId) return console.warn("🚨 No loan ID provided to fetchLoanDetails");
    try {
      const [loanDetailRes, paymentsRes, breakdownsRes, movementsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/loans/${loanId}/details`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/loans/${loanId}/payments`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/loans/${loanId}/payment-breakdown`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/loans/${loanId}/financial-movements`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      // Extract installments from the details response
      const installmentsData = loanDetailRes.data?.installments || [];
      setInstallments(Array.isArray(installmentsData) ? installmentsData : []);
      console.log("💡 Installments received:", installmentsData);
      
      // Ensure paymentsRes.data includes actual payment records with amounts
      const paymentsWithAmounts = Array.isArray(paymentsRes.data)
        ? paymentsRes.data.filter(p => typeof p.amount !== "undefined")
        : [];
      setPaymentHistory(paymentsWithAmounts);
      setPaymentBreakdowns(breakdownsRes.data);
      // Movements are already filtered by loan_id in backend
      setMovements(
        Array.isArray(movementsRes.data)
          ? movementsRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          : []
      );
    } catch (err) {
      console.error("Error fetching loan details:", err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectLoan = (loan) => {
    // Fallback guard: Ensure loan.id is defined
    if (!loan?.id) {
      console.error("❌ Loan ID is missing. Cannot proceed.");
      return;
    }

    // Debug log for selected loan
    console.log("🟢 Selected loan object:", loan);
    // Debug log before fetching loan details
    console.log("Fetching loan details for ID:", loan?.id);

    setSelectedLoan(loan);
    fetchLoanDetails(loan.id);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;

    // Debug log before payment POST
    console.log("🧠 selectedLoan before payment:", selectedLoan);

    // Determine the next unpaid installment
    const nextInstallment = installments.find(i => i.status === 'pending');
    const installment_week = nextInstallment?.week_number;

    try {
      console.log("🟡 Submitting payment:", {
        loan_id: selectedLoan.id,
        amount: parseFloat(amount),
        method,
        store_id: parseInt(storeId),
        apply_extra_to: applyExtraTo,
        installment_week,
      });
      const res = await axios.post(`${API_BASE_URL}/make-installment-payment`, {
        loan_id: selectedLoan.id,
        amount: parseFloat(amount),
        method,
        store_id: parseInt(storeId),
        apply_extra_to: applyExtraTo,
        installment_week,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Payment response:", res.data);
      // Safe fallback for paidInstallments and remaining
      const paidInstallments = res.data.paidInstallments || [];
      alert(`✅ Payment applied: ${paidInstallments.join(", ") || "N/A"}. Remaining: $${res.data.remaining ?? "unknown"}`);
      setLastPayment(res.data);
      fetchLoanDetails(selectedLoan.id);
      setAmount("");
    } catch (err) {
      console.error("Payment error:", err);
      const errorMessage = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join(" - ")
        : err?.response?.data?.message || "Unknown error";
      alert(`❌ Error registering payment: ${errorMessage}`);
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

  const matchingCustomers = filteredCustomers.filter((customer) => {
    console.log("Evaluating customer match:", customer);
    return (
      `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toString() === searchTerm ||
      (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleSelectCustomer = async (customer) => {
    try {
      // Fetch all loans for this customer
      const res = await axios.get(`${API_BASE_URL}/customers/${customer.id}/loans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data) && res.data.length > 0) {
        // Attach customer info to each loan if not present, and parse id as integer (support loan_id fallback)
        const loansWithCustomer = res.data.map(loan => ({
          ...loan,
          id: Number(loan.loan_id || loan.id),
          first_name: loan.first_name || customer.first_name,
          last_name: loan.last_name || customer.last_name,
          customer_phone: loan.customer_phone || customer.phone,
          customer_address: loan.customer_address || customer.address,
        }));
        setCustomerLoans(loansWithCustomer);
        setSelectedLoan(null);
        console.log("🧹 Loan cleared");
      } else {
        setCustomerLoans([]);
        alert("Este cliente no tiene préstamos registrados.");
      }
    } catch (err) {
      setCustomerLoans([]);
      console.error("Error fetching loans for customer:", err);
    }
  };

  // --- UI Split into 3 clear sections ---
  return (
    <Layout>
      <div className="container mt-4 bg-black text-white p-6 rounded-lg shadow-lg border border-crediyaGreen">
        {/* Progress Flow */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-bold text-crediyaGreen">Paso 1: Cliente</span>
            <span className="text-crediyaGreen">→</span>
            <span className={`font-bold ${selectedLoan ? "text-crediyaGreen" : "text-gray-400"}`}>Paso 2: Préstamo</span>
            <span className="text-crediyaGreen">→</span>
            <span className={`font-bold ${selectedLoan && storeId ? "text-crediyaGreen" : "text-gray-400"}`}>Paso 3: Pago</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Customer Selection Panel */}
          <section className="md:w-1/3 w-full mb-6 md:mb-0">
            <div className="bg-black border border-crediyaGreen rounded-lg p-4 shadow mb-4">
              <h3 className="text-lg font-semibold text-crediyaGreen mb-3">👤 Seleccionar Cliente</h3>
              <input
                type="text"
                className="form-control bg-black text-white border border-crediyaGreen rounded mb-3"
                placeholder="Buscar por nombre, ID o teléfono..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {matchingCustomers.length > 0 && (
                <div className="max-h-60 overflow-y-auto border border-crediyaGreen rounded-lg">
                  <ul className="divide-y divide-crediyaGreen text-sm">
                    {matchingCustomers.map(customer => (
                      <li
                        key={customer.id}
                        className={`flex justify-between items-center p-2 ${
                          customer.has_overdue ? 'bg-red-900 text-white' : 'bg-black text-white'
                        }`}
                      >
                        <span className="truncate">
                          <span className="font-bold text-crediyaGreen">#{customer.id}</span>{" "}
                          {customer.first_name} {customer.last_name}{" "}
                          <span className="text-gray-400 ml-1">
                            ({customer.loan_count || 0} préstamos)
                          </span>
                          {customer.has_overdue && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded bg-red-600 text-white">
                              Vencido
                            </span>
                          )}
                        </span>
                        <button
                          className="bg-crediyaGreen hover:bg-white hover:text-crediyaGreen text-black font-bold py-1 px-3 rounded transition duration-200"
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          Seleccionar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Customer Loans List */}
              {customerLoans.length > 0 && (
                <div className="mt-4 border-t border-crediyaGreen pt-4">
                  <h4 className="text-crediyaGreen font-semibold mb-2">📑 Seleccionar Préstamo</h4>
                  <ul className="space-y-2 text-sm">
                    {customerLoans.map((loan) => {
                      // Defensive: Ensure loan object is fully defined and id is an integer
                      const safeLoan = {
                        ...loan,
                        id: parseInt(loan.id),
                        amount: loan.amount,
                        status: loan.status,
                        first_name: loan.first_name,
                        last_name: loan.last_name,
                        customer_phone: loan.customer_phone,
                        customer_address: loan.customer_address,
                        store_id: loan.store_id,
                        financial_product_id: loan.financial_product_id,
                      };
                      return (
                        <li key={`${safeLoan.id}-${safeLoan.amount}`} className="flex justify-between items-center bg-gray-900 p-2 rounded border border-crediyaGreen">
                          <span>#{safeLoan.id} — ${safeLoan.amount} — {safeLoan.status}</span>
                          <button
                            className="bg-crediyaGreen hover:bg-white hover:text-crediyaGreen text-black font-bold py-1 px-3 rounded transition duration-200"
                            onClick={() => {
                              console.log("🟢 Selected loan object:", safeLoan);
                              handleSelectLoan(safeLoan);
                            }}
                          >
                            Seleccionar
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </section>
          {/* Main Panel: Loan + Amortization + Payment */}
          <section className="md:w-2/3 w-full flex flex-col gap-6">
            {/* Loan Summary + Amortization Panel */}
            {selectedLoan && (
              <div className="space-y-6">
                {/* Loan Summary */}
                <div className="sticky top-0 z-20 bg-black border-b border-crediyaGreen shadow-lg mb-4">
                  <div className="card bg-black text-white border border-crediyaGreen rounded-none p-4 shadow">
                    <h4
                      onClick={() => setShowLoanInfo(!showLoanInfo)}
                      className="mb-2 text-lg font-semibold text-crediyaGreen cursor-pointer flex items-center justify-between"
                    >
                      <span>📋 Resumen del Préstamo</span>
                      <span>{showLoanInfo ? "🔽" : "▶️"}</span>
                    </h4>
                    {showLoanInfo && (
                      <div className="space-y-1">
                        <p><strong>Cliente:</strong> {selectedLoan.first_name || ""} {selectedLoan.last_name || ""}</p>
                        <p><strong>Teléfono:</strong> {selectedLoan.customer_phone || "N/A"}</p>
                        <p><strong>Dirección:</strong> {selectedLoan.customer_address || "N/A"}</p>
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
                        <p><strong>Saldo restante:</strong> ${
                          (
                            parseFloat(selectedLoan.amount) -
                            paymentBreakdowns
                              .filter(b => b.type === 'capital')
                              .reduce((acc, b) => acc + parseFloat(b.amount), 0) +
                            installments.reduce((acc, i) => acc + parseFloat(i.penalty_applied), 0)
                          ).toFixed(2)
                        }</p>
                        <p><strong>Penalidades acumuladas:</strong> ${installments.reduce((acc, i) => acc + parseFloat(i.penalty_applied), 0).toFixed(2)}</p>
                        {/* Warning if missing store_id or financial_product_id */}
                        {(!selectedLoan.store_id || !selectedLoan.financial_product_id) && (
                          <p className="text-red-400 font-bold mt-2">⚠️ Este préstamo no tiene sucursal o producto financiero asignado.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {/* Amortization Table */}
                <div className="card bg-black text-white border border-crediyaGreen rounded-lg p-4 shadow">
                  <h4
                    onClick={() => setShowAmortization(!showAmortization)}
                    className="mb-2 text-lg font-semibold text-crediyaGreen cursor-pointer flex items-center justify-between"
                  >
                    <span>📆 Amortización</span>
                    <span>{showAmortization ? "🔽" : "▶️"}</span>
                  </h4>
                  {showAmortization && (
                    <div className="overflow-x-auto">
                      {installments.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <p>📋 No hay datos de amortización disponibles</p>
                          <p className="text-sm">Selecciona un préstamo para ver el calendario de pagos</p>
                        </div>
                      ) : (
                        <>
                          <table className="min-w-full text-xs border-separate border-spacing-y-1">
                            <thead>
                              <tr className="bg-gray-900 text-lime-400">
                                <th className="px-2 py-1 text-left">Semana</th>
                                <th className="px-2 py-1 text-left">Fecha</th>
                                <th className="px-2 py-1 text-right">Capital</th>
                                <th className="px-2 py-1 text-right">Interés</th>
                                <th className="px-2 py-1 text-right">Penalidad</th>
                                <th className="px-2 py-1 text-right">Total</th>
                                <th className="px-2 py-1 text-right">Pagado</th>
                                <th className="px-2 py-1 text-right">Saldo</th>
                                <th className="px-2 py-1 text-center">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {installments.map(inst => {
                                const dueDate = new Date(inst.due_date);
                                const today = new Date();
                                const msInDay = 1000 * 60 * 60 * 24;
                                const daysOverdue = Math.floor((today - dueDate) / msInDay);
                                let bgClass = "";
                                if (inst.status === "pending") {
                                  if (daysOverdue > 7) bgClass = "bg-red-800";
                                  else if (daysOverdue > 0) bgClass = "bg-yellow-600";
                                  else bgClass = "bg-gray-800";
                                } else if (inst.status === "paid") {
                                  bgClass = "bg-green-800";
                                } else {
                                  bgClass = "bg-gray-800";
                                }
                                return (
                                  <tr key={inst.week_number} className={`${bgClass} border-b border-crediyaGreen`}>
                                    <td className="px-2 py-1 font-bold">{inst.week_number}</td>
                                    <td className="px-2 py-1">{dueDate.toLocaleDateString()}</td>
                                    <td className="px-2 py-1 text-right">
                                      ${inst.capital_portion}
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                      {inst.interest_paid > 0 && inst.interest_paid < inst.interest_portion
                                        ? `$${inst.interest_paid.toFixed(2)} (de $${inst.interest_portion})`
                                        : `$${inst.interest_portion}`}
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                      {inst.penalty_paid > 0 && inst.penalty_paid < inst.penalty_applied
                                        ? `$${inst.penalty_paid.toFixed(2)} (de $${Number(inst.penalty_applied || 0).toFixed(2)})`
                                        : `$${Number(inst.penalty_applied || 0).toFixed(2)}`}
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                      ${(
                                        parseFloat(inst.capital_portion || 0) +
                                        parseFloat(inst.interest_portion || 0) +
                                        Number(inst.penalty_applied || 0)
                                      ).toFixed(2)}
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                      ${(
                                        parseFloat(inst.capital_paid || 0) +
                                        parseFloat(inst.interest_paid || 0) +
                                        parseFloat(inst.penalty_paid || 0)
                                      ).toFixed(2)}
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                      ${(
                                        (parseFloat(inst.capital_portion || 0) +
                                         parseFloat(inst.interest_portion || 0) +
                                         parseFloat(inst.penalty_applied || 0)) -
                                        (parseFloat(inst.capital_paid || 0) +
                                         parseFloat(inst.interest_paid || 0) +
                                         parseFloat(inst.penalty_paid || 0))
                                      ).toFixed(2)}
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                      <span className="badge bg-secondary">{inst.status}</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          {/* Color Legend */}
                          <div className="flex gap-4 text-xs mt-4 text-white">
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 bg-red-800 rounded-sm"></div> &gt;7 días vencido
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 bg-yellow-600 rounded-sm"></div> 1-7 días vencido
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 bg-gray-800 rounded-sm"></div> Pendiente
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 bg-green-800 rounded-sm"></div> Pagado
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Payment Entry Panel */}
            {selectedLoan && (
              <div>
                <div className="card bg-black text-white border border-crediyaGreen rounded-lg p-4 shadow">
                  <h4
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    className="mb-2 text-lg font-semibold text-crediyaGreen cursor-pointer flex items-center justify-between"
                  >
                    <span>💳 Registrar un Pago</span>
                    <span>{showPaymentForm ? "🔽" : "▶️"}</span>
                  </h4>
                  {showPaymentForm && (
                    <form onSubmit={handlePayment} className="mb-4">
                      <fieldset className="mb-4 border border-crediyaGreen rounded p-4">
                        <legend className="text-crediyaGreen font-semibold mb-2">Detalles del Pago</legend>
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1">Monto a pagar</label>
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full form-control bg-black text-white border border-crediyaGreen rounded px-3 py-2" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            placeholder="0.00"
                            required 
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1">Método de Pago</label>
                          <select className="w-full form-select bg-black text-white border border-crediyaGreen rounded px-3 py-2" value={method} onChange={(e) => setMethod(e.target.value)} required>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="tarjeta">Tarjeta</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1">Sucursal</label>
                          <select
                            className={`w-full form-select bg-black text-white border border-crediyaGreen rounded px-3 py-2 ${!storeId ? "text-gray-400" : ""}`}
                            value={storeId}
                            onChange={(e) => setStoreId(e.target.value)}
                            required
                          >
                            <option value="" className="text-gray-400">Seleccione una sucursal</option>
                            <option value="1">Atlixco</option>
                            <option value="2">Cholula</option>
                            <option value="3">Chipilo</option>
                          </select>
                        </div>
                      </fieldset>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Aplicar extra a</label>
                        <select className="w-full form-select bg-black text-white border border-crediyaGreen rounded px-3 py-2" value={applyExtraTo} onChange={(e) => setApplyExtraTo(e.target.value)}>
                          <option value="next">Siguiente semana</option>
                          <option value="capital">Amortizar capital</option>
                        </select>
                      </div>
                      <button
                        className={`w-full bg-crediyaGreen hover:bg-white hover:text-crediyaGreen text-black font-bold py-3 px-4 rounded transition duration-200 ${!storeId ? "opacity-50 cursor-not-allowed" : ""}`}
                        type="submit"
                        disabled={!storeId}
                      >
                        💳 Registrar Pago
                      </button>
                    </form>
                  )}
                </div>
                {/* Último Pago */}
                {lastPayment && (
                  <div ref={receiptRef} className="card bg-black text-white border border-crediyaGreen rounded-lg p-4 mt-6 shadow">
                    <h4
                      onClick={() => setShowLastPayment(!showLastPayment)}
                      className="mb-2 text-lg font-semibold text-crediyaGreen cursor-pointer flex items-center justify-between"
                    >
                      <span>🧾 Último Pago</span>
                      <span>{showLastPayment ? "🔽" : "▶️"}</span>
                    </h4>
                    {showLastPayment && (
                      <div>
                        <p>Cuotas pagadas: {lastPayment.paidInstallments.join(", ")}</p>
                        <p>Restante: ${lastPayment.remaining}</p>
                        <button className="bg-crediyaGreen hover:bg-white hover:text-crediyaGreen text-black font-bold py-2 px-4 rounded transition duration-200 mt-2" onClick={downloadPDF}>Descargar PDF</button>
                      </div>
                    )}
                  </div>
                )}
                {/* Historial de Pagos */}
                {paymentHistory.length > 0 && (
                  <div className="card bg-black text-white border border-crediyaGreen rounded-lg p-4 mt-6 shadow">
                    <h4
                      onClick={() => setShowHistory(!showHistory)}
                      className="mb-2 text-lg font-semibold text-crediyaGreen cursor-pointer flex items-center justify-between"
                    >
                      <span>📜 Historial de Pagos</span>
                      <span>{showHistory ? "🔽" : "▶️"}</span>
                    </h4>
                    {showHistory && (
                      <ul className="list-group text-xs">
                        {paymentHistory.map((p, idx) => (
                          <li key={idx} className="list-group-item">
                            {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "Fecha desconocida"} — ${p.amount} vía {p.method}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {/* Desglose de Pagos */}
                {Array.isArray(paymentBreakdowns) && paymentBreakdowns.length > 0 && (
                  <div className="card bg-black text-white border border-crediyaGreen rounded-lg p-4 mt-6 shadow">
                    <h4
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="mb-2 text-lg font-semibold text-crediyaGreen cursor-pointer flex items-center justify-between"
                    >
                      <span>📊 Desglose de Pagos</span>
                      <span>{showBreakdown ? "🔽" : "▶️"}</span>
                    </h4>
                    {showBreakdown && (
                      <table className="min-w-full text-xs text-white border border-crediyaGreen mt-2">
                        <thead>
                          <tr className="bg-gray-900 text-lime-400">
                            <th className="px-2 py-1 text-left">Fecha</th>
                            <th className="px-2 py-1 text-left">Tipo</th>
                            <th className="px-2 py-1 text-left">Semana</th>
                            <th className="px-2 py-1 text-right">Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentBreakdowns?.map((b, idx) => (
                            <tr key={idx} className="border-t border-crediyaGreen">
                              <td className="px-2 py-1">{new Date(b.created_at).toLocaleDateString()}</td>
                              <td className="px-2 py-1">{b.type}</td>
                              <td className="px-2 py-1">Semana {b.week_number}</td>
                              <td className="px-2 py-1 text-right">${parseFloat(b.amount).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
                {/* Movimientos Financieros */}
                <div className="card bg-black text-white border border-crediyaGreen rounded-lg p-4 mt-6 shadow">
                  <h4
                    onClick={() => setShowMovements(!showMovements)}
                    className="mb-2 text-lg font-semibold text-crediyaGreen cursor-pointer flex items-center justify-between"
                  >
                    <span>📘 Movimientos Financieros</span>
                    <span>{showMovements ? "🔽" : "▶️"}</span>
                  </h4>
                  {showMovements && (
                    <>
                      <p className="text-sm text-gray-400 mb-2">
                        Mostrando historial completo de pagos, penalidades y movimientos financieros registrados.
                      </p>
                      <MovementLog loanId={selectedLoan.id} movements={movements} />
                    </>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPayment;
