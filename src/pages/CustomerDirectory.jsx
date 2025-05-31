import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";

const CustomerDirectory = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
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

  const filtered = customers.filter(
    (c) =>
      (c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search))
  );

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

      <div className="bg-black border-t-4 border-lime-500 rounded-md overflow-x-auto">
        <table className="min-w-full text-sm text-white">
          <thead className="bg-lime-500 text-black">
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              console.log("🧾 Rendering customer:", c);
              return (
                <tr key={c.id} className="border-t border-gray-700 hover:bg-gray-800">
                  <td>{c.first_name} {c.last_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>
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
