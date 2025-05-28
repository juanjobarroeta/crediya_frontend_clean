import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import Layout from "../components/Layout";

const Dashboard = () => {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState({});
  const [paymentAmount, setPaymentAmount] = useState({});
  const [customers, setCustomers] = useState([]);
  const token = localStorage.getItem("token");

  const fetchLoans = async () => {
    try {
      const res = await axios.get("http://localhost:5001/dashboard/loans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("LOANS FROM BACKEND:", res.data); // 👈 Add this line
      setLoans(res.data);
    } catch (err) {
      console.error("Error fetching loans:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5001/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchPayments = async (loanId) => {
    try {
      const res = await axios.get(
        `http://localhost:5001/dashboard/payments/${loanId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments((prev) => ({ ...prev, [loanId]: res.data }));
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  const handlePaymentChange = (loanId, value) => {
    setPaymentAmount((prev) => ({ ...prev, [loanId]: value }));
  };

  const submitPayment = async (loanId) => {
    try {
      await axios.post(
        "http://localhost:5001/make-payment",
        { loan_id: loanId, amount: paymentAmount[loanId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPayments(loanId);
      alert("Pago registrado con éxito");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error al procesar el pago");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  useEffect(() => {
    fetchLoans();
    fetchCustomers();
  }, []);

  return (
    <Layout>
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mis Préstamos</h2>
        <div className="mb-4">
          <h4>Solicitar nuevo préstamo</h4>
          <div className="row g-2 align-items-center mb-3">
            <div className="col-auto">
              <select
                className="form-select"
                value={paymentAmount.newCustomer || ""}
                onChange={(e) => handlePaymentChange("newCustomer", e.target.value)}
              >
                <option value="">Selecciona un cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.id}) - {customer.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-auto">
              <input
                type="number"
                className="form-control"
                placeholder="Monto ($)"
                value={paymentAmount.newAmount || ""}
                onChange={(e) => handlePaymentChange("newAmount", e.target.value)}
              />
            </div>
            <div className="col-auto">
              <input
                type="number"
                className="form-control"
                placeholder="Término (semanas)"
                value={paymentAmount.newTerm || ""}
                onChange={(e) => handlePaymentChange("newTerm", e.target.value)}
              />
            </div>
            <div className="col-auto">
              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    const res = await axios.post(
                      "http://localhost:5001/apply-loan",
                      {
                        amount: paymentAmount.newAmount,
                        term: paymentAmount.newTerm,
                        customer_id: paymentAmount.newCustomer,
                      },
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    alert("Préstamo solicitado con éxito ✅");
                    fetchLoans();
                  } catch (error) {
                    alert("Error al solicitar préstamo ❌");
                    console.error(error);
                  }
                }}
              >
                Solicitar
              </button>
            </div>
          </div>
        </div>
        <button className="btn btn-danger" onClick={logout}>
          Cerrar Sesión
        </button>
      </div>
      <div className="mb-5">
        <h4>Registrar nuevo cliente</h4>
        <div className="row g-2 align-items-center mb-3">
          <div className="col-auto">
            <input
              type="text"
              className="form-control"
              placeholder="Nombre"
              value={paymentAmount.newCustomerName || ""}
              onChange={(e) => handlePaymentChange("newCustomerName", e.target.value)}
            />
          </div>
          <div className="col-auto">
            <input
              type="text"
              className="form-control"
              placeholder="Teléfono"
              value={paymentAmount.newCustomerPhone || ""}
              onChange={(e) => handlePaymentChange("newCustomerPhone", e.target.value)}
            />
          </div>
          <div className="col-auto">
            <input
              type="email"
              className="form-control"
              placeholder="Correo"
              value={paymentAmount.newCustomerEmail || ""}
              onChange={(e) => handlePaymentChange("newCustomerEmail", e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button
              className="btn btn-outline-success"
              onClick={async () => {
                try {
                  const res = await axios.post(
                    "http://localhost:5001/customers",
                    {
                      name: paymentAmount.newCustomerName,
                      phone: paymentAmount.newCustomerPhone,
                      email: paymentAmount.newCustomerEmail,
                    },
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  alert("Cliente registrado ✅");
                  fetchCustomers();
                } catch (error) {
                  alert("Error al registrar cliente ❌");
                  console.error(error);
                }
              }}
            >
              Registrar Cliente
            </button>
          </div>
        </div>
      </div>
      {loans.length === 0 ? (
        <p>No tienes préstamos registrados.</p>
      ) : (
        <div className="accordion" id="loansAccordion">
          {loans.map((loan) => (
            <div className="accordion-item" key={loan.id}>
              <h2 className="accordion-header" id={`heading${loan.id}`}>
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${loan.id}`}
                  aria-expanded="false"
                  aria-controls={`collapse${loan.id}`}
                  onClick={() => fetchPayments(loan.id)}
                >
                  Préstamo #{loan.id} - ${loan.amount} ({loan.status}) {loan.customer_name ? <Link to={`/customer/${loan.customer_id}`}>{loan.customer_name}</Link> : ""}
                </button>
              </h2>
              <div
                id={`collapse${loan.id}`}
                className="accordion-collapse collapse"
                aria-labelledby={`heading${loan.id}`}
                data-bs-parent="#loansAccordion"
              >
                <div className="accordion-body">
                  <p><strong>Término:</strong> {loan.term} semanas</p>
                  <p><strong>Fecha de Vencimiento:</strong> {new Date(loan.due_date).toLocaleDateString()}</p>
                  <p><strong>Cargo por Mora:</strong> ${loan.late_fee}</p>

                  <h5 className="mt-4">Pagos Realizados</h5>
                  {payments[loan.id] && payments[loan.id].length > 0 ? (
                    <ul className="list-group mb-3">
                      {payments[loan.id].map((p) => (
                        <li key={p.id} className="list-group-item">
                          ${p.amount} - {new Date(p.payment_date).toLocaleDateString()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No se han registrado pagos aún.</p>
                  )}

                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Monto del pago"
                      value={paymentAmount[loan.id] || ""}
                      onChange={(e) => handlePaymentChange(loan.id, e.target.value)}
                    />
                    <button
                      className="btn btn-success"
                      onClick={() => submitPayment(loan.id)}
                    >
                      Registrar Pago
                    </button>
                  </div>
                  {loan.customer_id && (
                    <Link to={`/customer/${loan.customer_id}`} className="btn btn-info mt-3">
                      Ver perfil del cliente
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </Layout>
  );
};

export default Dashboard;