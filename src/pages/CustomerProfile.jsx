import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const CustomerProfile = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/customers/${id}/profile`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        setCustomer(res.data);
        console.log("✅ Customer loaded:", res.data);
      } catch (err) {
        console.error("Failed to load customer:", err);
        setError("No se pudo cargar el cliente.");
      } finally {
        setLoading(false);
      }
    };

    const fetchLoans = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/customers/${id}/loans`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        setLoans(res.data);
        console.log("✅ Loans loaded:", res.data);
      } catch (err) {
        console.error("Failed to load loans:", err);
        setError("No se pudo cargar los préstamos.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
    fetchLoans();
  }, [id]);

  if (loading || !customer) {
    return <Layout><div className="text-white p-10">Cargando cliente...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="text-red-500 p-10">{error}</div></Layout>;
  }

  return (
    <Layout>
      <div className="text-white p-6 max-w-5xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Perfil del Cliente</h2>
        <div className="mb-6">
          <p><strong>Nombre:</strong> {customer.first_name} {customer.last_name}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Teléfono:</strong> {customer.phone}</p>
        </div>

        <h3 className="text-lg font-semibold mb-2">Préstamos</h3>
        {loans.length === 0 ? (
          <p className="text-sm text-gray-400">Este cliente no tiene préstamos.</p>
        ) : (
          <table className="w-full text-sm border border-lime-500 bg-black">
            <thead className="bg-lime-500 text-black">
              <tr>
                <th className="text-left px-4 py-2">Préstamo</th>
                <th className="text-right px-4 py-2">Monto</th>
                <th className="text-right px-4 py-2">Plazo</th>
                <th className="text-right px-4 py-2">Estado</th>
                <th className="text-center px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id} className="border-t border-gray-600 hover:bg-gray-800">
                  <td className="px-4 py-2">#{loan.id}</td>
                  <td className="text-right px-4 py-2">
                    ${Number(loan.amount || 0).toFixed(2)}
                  </td>
                  <td className="text-right px-4 py-2">{loan.term} semanas</td>
                  <td className="text-right px-4 py-2">{loan.status}</td>
                  <td className="text-center px-4 py-2">
                    <Link to={`/loan/${loan.id}/statement`} className="text-lime-400 hover:underline text-sm font-medium">
                      Estado de Cuenta
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default CustomerProfile;