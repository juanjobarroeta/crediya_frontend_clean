import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const AssignIMEI = () => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:5001/inventory-items", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const filtered = res.data.filter(item => !item.imei);
      setItems(filtered);
    }).catch(err => console.error("Error fetching items:", err));
  }, []);

  const handleChange = (id, value) => {
    setEditing(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async (id) => {
    const imei = editing[id];
    if (!imei) return;
    try {
      await axios.put(`http://localhost:5001/inventory-items/${id}/imei`, { imei }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(prev => prev.filter(item => item.id !== id));
      alert("IMEI asignado correctamente");
    } catch (err) {
      console.error("Error updating IMEI:", err);
      alert("Error al guardar IMEI");
    }
  };

  return (
    <Layout>
      <div className="px-6 py-6 max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-white">Asignar IMEI a Equipos</h2>
        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay artículos pendientes de IMEI.</p>
        ) : (
          <div className="bg-black border-t-4 border-lime-500 rounded-md overflow-x-auto">
            <table className="min-w-full text-sm text-white">
              <thead className="bg-lime-500 text-black">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left">ID</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Modelo</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Sucursal</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">IMEI</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-800">
                    <td className="border border-gray-300 px-3 py-2">{item.id}</td>
                    <td className="border border-gray-300 px-3 py-2">{item.model}</td>
                    <td className="border border-gray-300 px-3 py-2">{item.store}</td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        className="w-full bg-gray-900 border border-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                        value={editing[item.id] || ""}
                        onChange={(e) => handleChange(item.id, e.target.value)}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <button
                        className="bg-lime-500 hover:bg-lime-600 text-black text-sm px-3 py-1 rounded font-semibold"
                        onClick={() => handleSave(item.id)}
                      >
                        Guardar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AssignIMEI; 