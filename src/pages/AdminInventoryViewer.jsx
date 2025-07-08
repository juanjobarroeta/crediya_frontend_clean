import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";

const AdminInventoryViewer = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [store, setStore] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [targetStore, setTargetStore] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/inventory-items`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setItems(res.data || []);
        setFiltered(res.data || []);
      } catch (err) {
        console.error("Error fetching inventory items:", err);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    let filtered = [...items];
    if (store !== "all") filtered = filtered.filter(item => item.store === store);
    if (status !== "all") filtered = filtered.filter(item => item.status === status);
    setFiltered(filtered);
  }, [store, status, items]);

  const toggleItemSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleTransfer = async () => {
    if (!targetStore || selectedItems.length === 0) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/inventory-items/transfer`,
        {
          item_ids: selectedItems,
          new_store: targetStore,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      window.location.reload();
    } catch (err) {
      console.error("Error transferring items:", err);
    }
  };

  return (
    <Layout>
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-white">Inventario General</h2>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label text-white">Sucursal</label>
          <select className="form-select bg-gray-900 text-white border border-gray-600" value={store} onChange={(e) => setStore(e.target.value)}>
            <option value="all">Todas</option>
            <option value="atlixco">Atlixco</option>
            <option value="cholula">Cholula</option>
            <option value="chipilo">Chipilo</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label text-white">Estatus</label>
          <select className="form-select bg-gray-900 text-white border border-gray-600" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Todos</option>
            <option value="in_stock">Disponible</option>
            <option value="reserved">Reservado</option>
            <option value="sold">Vendido</option>
            <option value="repossessed">Reposeído</option>
            <option value="assigned">Asignado</option>
            <option value="pending_admin_approval">Por aprobar admin</option>
            <option value="approved_by_admin">Aprobado por admin</option>
            <option value="paid_by_treasury">Pagado por tesorería</option>
            <option value="pending_reception">Pendiente de recepción</option>
            <option value="delivered">Entregado</option>
          </select>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label text-white">Transferir seleccionados a:</label>
          <select
            className="form-select bg-gray-900 text-white border border-gray-600"
            value={targetStore}
            onChange={(e) => setTargetStore(e.target.value)}
          >
            <option value="">Selecciona sucursal</option>
            <option value="atlixco">Atlixco</option>
            <option value="cholula">Cholula</option>
            <option value="chipilo">Chipilo</option>
          </select>
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded disabled:opacity-50"
            onClick={handleTransfer}
            disabled={!targetStore || selectedItems.length === 0}
          >
            Transferir
          </button>
        </div>
      </div>

      <div className="bg-black border-t-4 border-lime-500 rounded-md overflow-x-auto">
        <table className="min-w-full text-sm text-white">
          <thead className="bg-lime-500 text-black">
            <tr>
              <th>✓</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Color</th>
              <th>IMEI</th>
              <th>RAM</th>
              <th>Almacenamiento</th>
              <th>Status</th>
              <th>Sucursal</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                className={`border-t border-gray-700 hover:bg-gray-800 ${
                  item.status === 'in_stock' ? 'bg-green-900/30' :
                  item.status === 'reserved' ? 'bg-yellow-900/30' :
                  item.status === 'sold' ? 'bg-red-900/30' :
                  item.status === 'repossessed' ? 'bg-purple-900/30' :
                  item.status === 'assigned' ? 'bg-blue-900/30' :
                  item.status === 'pending_admin_approval' ? 'bg-orange-900/30' :
                  item.status === 'approved_by_admin' ? 'bg-orange-800/30' :
                  item.status === 'paid_by_treasury' ? 'bg-orange-700/30' :
                  item.status === 'pending_reception' ? 'bg-gray-800/30' :
                  item.status === 'delivered' ? 'bg-red-800/30' :
                  ''
                }`}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                  />
                </td>
                <td>{item.category}</td>
                <td>{item.brand}</td>
                <td>{item.model}</td>
                <td>{item.color}</td>
                <td>{item.imei || "—"}</td>
                <td>{item.ram}</td>
                <td>{item.storage}</td>
                <td>{item.status}</td>
                <td>{item.store}</td>
                <td>
                  <a
                    href={`/inventory/${item.id}`}
                    className="text-lime-400 underline hover:text-lime-300"
                  >
                    Ver detalles
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </Layout>
  );
};

export default AdminInventoryViewer;