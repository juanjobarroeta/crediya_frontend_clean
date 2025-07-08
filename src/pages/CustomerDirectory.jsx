import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";

const CustomerDirectory = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/customers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(res.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };

    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.id?.toString().includes(search) ||
      c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search);

    const matchesStatus =
      !statusFilter ||
      c.loans?.some((loan) => loan.status === statusFilter);

    const matchesStore = !storeFilter || c.store === storeFilter;

    return matchesSearch && matchesStatus && matchesStore;
  });

  return (
    <Layout>
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <h2 className="mb-4">Directorio de Clientes</h2>

      <input
        type="text"
        className="w-full mb-4 px-3 py-2 rounded bg-gray-900 text-white border border-lime-500 placeholder-gray-400"
        placeholder="Buscar por nombre, email o teléfono"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex flex-wrap gap-4 mb-4">
        <select
          className="bg-gray-900 text-white border border-lime-500 px-3 py-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="activo">Con préstamos activos</option>
          <option value="atrasado">Con préstamos atrasados</option>
          <option value="liquidado">Solo préstamos finalizados</option>
        </select>

        <select
          className="bg-gray-900 text-white border border-lime-500 px-3 py-2 rounded"
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
        >
          <option value="">Todas las sucursales</option>
          <option value="Atlixco">Atlixco</option>
          <option value="Cholula">Cholula</option>
          <option value="Chipilo">Chipilo</option>
        </select>
      </div>

      <div className="bg-black border-t-4 border-lime-500 rounded-md overflow-x-auto">
        <table className="min-w-full text-sm text-white">
          <thead className="bg-lime-500 text-black">
            <tr>
              <th className="w-12">ID</th>
              <th className="w-40">Nombre</th>
              <th className="w-48">Email</th>
              <th className="w-32">Teléfono</th>
              <th className="w-32"># Préstamos</th>
              <th className="w-32">Balance Actual</th>
              <th className="w-28">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map((c) => {
              console.log("🧾 Rendering customer:", c);
              return (
                <tr
                  key={c.id}
                  className={`border-t border-gray-700 hover:bg-gray-800 ${
                    c.loans?.some((loan) => loan.status === "atrasado") ? "bg-red-950" : ""
                  }`}
                >
                  <td className="w-12">
                    <div className="flex items-center gap-2">
                      {c.id}
                      <button
                        onClick={() => navigator.clipboard.writeText(c.id)}
                        className="text-lime-400 hover:text-lime-300"
                        title="Copiar ID"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td className="w-40">{c.first_name} {c.last_name}</td>
                  <td className="w-48">{c.email}</td>
                  <td className="w-32">{c.phone}</td>
                  <td className="w-32">{c.loan_count ?? 0}</td>
                  <td className="w-32">${(c.total_balance ?? 0).toFixed(2)}</td>
                  <td className="w-28">
                    <Link to={`/customer/${c.id}`} className="text-lime-400 hover:underline text-sm font-medium">
                      Ver Perfil
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </Layout>
  );
};

export default CustomerDirectory;
