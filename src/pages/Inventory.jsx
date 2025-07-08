import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import Layout from "../components/Layout";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    category: "",
    brand: "",
    model: "",
    color: "",
    imei: "",
    serial: "",
    cost: "",
    price: "",
    status: "in_stock"
  });

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(newProduct).some((val) => val === "")) return alert("Todos los campos son requeridos.");
    try {
      await axios.post(`${API_BASE_URL}/products`, newProduct, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setNewProduct({
        category: "",
        brand: "",
        model: "",
        color: "",
        imei: "",
        serial: "",
        cost: "",
        price: "",
        status: "in_stock"
      });
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  return (
    <Layout>
      <div className="px-6 py-6 max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-white">Inventario</h2>

        <div className="bg-black text-white p-4 rounded mb-6 border border-gray-700">
          <h3 className="text-lg mb-4 font-semibold">Agregar producto</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["category", "brand", "model", "color", "imei", "serial", "cost", "price"].map((field) => (
              <input
                key={field}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={newProduct[field]}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded px-2 py-1 text-sm"
              />
            ))}
            <button
              type="submit"
              className="mt-4 bg-lime-500 hover:bg-lime-600 text-black font-medium py-2 px-4 rounded col-span-2 md:col-span-4"
            >
              Agregar producto
            </button>
          </form>
        </div>

        <div className="bg-black border border-gray-700 rounded-lg overflow-x-auto shadow-lg">
          <table className="min-w-full text-sm text-white border-collapse">
            <thead className="bg-gradient-to-r from-lime-400 to-lime-600 text-black uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-2 text-left">Categoría</th>
                <th className="px-4 py-2 text-left">Marca</th>
                <th className="px-4 py-2 text-left">Modelo</th>
                <th className="px-4 py-2 text-left">Color</th>
                <th className="px-4 py-2 text-left">IMEI</th>
                <th className="px-4 py-2 text-left">Serie</th>
                <th className="px-4 py-2 text-left">Costo</th>
                <th className="px-4 py-2 text-left">Venta</th>
                <th className="px-4 py-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr
                  key={idx}
                  className={`${idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'} hover:bg-gray-700 transition-colors`}
                >
                  <td className="px-4 py-2">{p.category}</td>
                  <td className="px-4 py-2">{p.brand}</td>
                  <td className="px-4 py-2">{p.model}</td>
                  <td className="px-4 py-2">{p.color}</td>
                  <td className="px-4 py-2">{p.imei}</td>
                  <td className="px-4 py-2">{p.serial}</td>
                  <td className="px-4 py-2">${p.cost}</td>
                  <td className="px-4 py-2">${p.price}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${p.status === 'in_stock' ? 'bg-green-600 text-white' :
                        p.status === 'assigned' ? 'bg-yellow-500 text-black' :
                        'bg-red-500 text-white'}`}>
                      {p.status}
                    </span>
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

export default Inventory;