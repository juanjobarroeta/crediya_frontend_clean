import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import Layout from "../components/Layout";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStore, setSelectedStore] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // table, grid, analytics
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [transferTarget, setTransferTarget] = useState("");
  const [editingIMEI, setEditingIMEI] = useState({});
  const [imeiValidation, setImeiValidation] = useState({});
  const [savingIMEI, setSavingIMEI] = useState({});
  const [newProduct, setNewProduct] = useState({
    category: "",
    brand: "",
    model: "",
    color: "",
    imei: "",
    serial: "",
    cost: "",
    price: "",
    status: "in_stock",
    store: "atlixco",
    ram: "",
    storage: ""
  });

  const token = localStorage.getItem("token");

  // IMEI validation function
  const validateIMEI = (imei) => {
    const imeiRegex = /^\d{15}$/;
    if (!imeiRegex.test(imei)) {
      return { valid: false, message: "IMEI debe tener 15 dígitos" };
    }
    
    // Luhn algorithm validation
    const digits = imei.split('').map(Number);
    let sum = 0;
    
    for (let i = 0; i < 14; i++) {
      let digit = digits[i];
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    const isValid = checkDigit === digits[14];
    
    return {
      valid: isValid,
      message: isValid ? "IMEI válido" : "IMEI inválido"
    };
  };

  // Handle IMEI input change
  const handleIMEIChange = async (productId, value) => {
    setEditingIMEI(prev => ({ ...prev, [productId]: value }));
    
    if (value.length === 15) {
      // Validate IMEI format
      const validation = validateIMEI(value);
      setImeiValidation(prev => ({ ...prev, [productId]: validation }));
      
      // Check for duplicates
      if (validation.valid) {
        try {
          const response = await axios.get(`${API_BASE_URL}/inventory-items/check-imei/${value}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.exists) {
            setImeiValidation(prev => ({ 
              ...prev, 
              [productId]: { valid: false, message: "IMEI ya existe en inventario" }
            }));
          }
        } catch (err) {
          console.error("Error checking IMEI:", err);
        }
      }
    } else {
      setImeiValidation(prev => ({ ...prev, [productId]: null }));
    }
  };

  // Save IMEI
  const saveIMEI = async (productId) => {
    const imei = editingIMEI[productId];
    const validation = imeiValidation[productId];
    
    if (!validation || !validation.valid) {
      alert("Por favor ingresa un IMEI válido");
      return;
    }

    setSavingIMEI(prev => ({ ...prev, [productId]: true }));
    
    try {
      await axios.put(`${API_BASE_URL}/inventory-items/${productId}/imei`, { imei }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the product in the local state
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, imei } : p
      ));
      
      // Clear editing state
      setEditingIMEI(prev => ({ ...prev, [productId]: undefined }));
      setImeiValidation(prev => ({ ...prev, [productId]: null }));
      
      alert("✅ IMEI asignado correctamente");
    } catch (err) {
      console.error("Error saving IMEI:", err);
      alert("❌ Error al guardar IMEI");
    } finally {
      setSavingIMEI(prev => ({ ...prev, [productId]: false }));
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/inventory-items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
      const matchesStore = selectedStore === "all" || product.store === selectedStore;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesStore;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus, selectedStore]);

  // Analytics data
  const analyticsData = useMemo(() => {
    const categories = {};
    const brands = {};
    const statuses = {};
    const stores = {};
    let totalValue = 0;
    let totalCost = 0;

    products.forEach(product => {
      // Categories
      categories[product.category] = (categories[product.category] || 0) + 1;
      
      // Brands
      brands[product.brand] = (brands[product.brand] || 0) + 1;
      
      // Statuses
      statuses[product.status] = (statuses[product.status] || 0) + 1;
      
      // Stores
      stores[product.store] = (stores[product.store] || 0) + 1;
      
      // Values
      totalValue += parseFloat(product.price || 0);
      totalCost += parseFloat(product.cost || 0);
    });

    return {
      categories,
      brands,
      statuses,
      stores,
      totalValue,
      totalCost,
      totalItems: products.length,
      profit: totalValue - totalCost
    };
  }, [products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(newProduct).some((val) => val === "")) {
      alert("Todos los campos son requeridos.");
      return;
    }
    
    try {
      await axios.post(`${API_BASE_URL}/inventory-items`, newProduct, {
        headers: { Authorization: `Bearer ${token}` }
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
        status: "in_stock",
        store: "atlixco",
        ram: "",
        storage: ""
      });
      setShowAddModal(false);
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Error al agregar producto.");
    }
  };

  const handleTransfer = async () => {
    if (!transferTarget || selectedProducts.length === 0) {
      alert("Seleccione productos y destino para transferir.");
      return;
    }
    
    try {
      await axios.post(`${API_BASE_URL}/inventory-items/transfer`, {
        product_ids: selectedProducts,
        target_store: transferTarget
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedProducts([]);
      setTransferTarget("");
      setShowTransferModal(false);
      fetchProducts();
      alert("Productos transferidos exitosamente.");
    } catch (err) {
      console.error("Error transferring products:", err);
      alert("Error al transferir productos.");
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  // Chart data
  const chartData = useMemo(() => ({
    categoryDistribution: {
      labels: Object.keys(analyticsData.categories),
      datasets: [{
        data: Object.values(analyticsData.categories),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(245, 158, 11, 0.8)"
        ],
        borderWidth: 2,
        borderColor: "#1f2937"
      }]
    },
    statusDistribution: {
      labels: Object.keys(analyticsData.statuses),
      datasets: [{
        data: Object.values(analyticsData.statuses),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)"
        ],
        borderWidth: 2,
        borderColor: "#1f2937"
      }]
    },
    storeDistribution: {
      labels: Object.keys(analyticsData.stores),
      datasets: [{
        label: "Productos por Sucursal",
        data: Object.values(analyticsData.stores),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2
      }]
    }
  }), [analyticsData]);

  const uniqueCategories = [...new Set(products.map(p => p.category))];
  const uniqueStores = [...new Set(products.map(p => p.store))];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-black border-b border-gray-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-lime-400">📦 Inventario General</h1>
              <p className="text-gray-400">Gestión avanzada de inventario y análisis</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-lime-500 hover:bg-lime-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ➕ Agregar Producto
              </button>
              <button
                onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                {viewMode === "table" ? "📊 Vista Cuadrícula" : "📋 Vista Tabla"}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex space-x-1">
            {[
              { id: "overview", label: "📊 Resumen", icon: "📊" },
              { id: "inventory", label: "📦 Inventario", icon: "📦" },
              { id: "analytics", label: "📈 Análisis", icon: "📈" },
              { id: "transfers", label: "🔄 Transferencias", icon: "🔄" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-lime-500 text-black"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="🔍 Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">📂 Todas las categorías</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">📊 Todos los estados</option>
              <option value="in_stock">✅ En stock</option>
              <option value="assigned">📋 Asignado</option>
              <option value="sold">💰 Vendido</option>
            </select>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">🏪 Todas las sucursales</option>
              {uniqueStores.map(store => (
                <option key={store} value={store}>{store}</option>
              ))}
            </select>
            <button
              onClick={() => setShowTransferModal(true)}
              disabled={selectedProducts.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🔄 Transferir ({selectedProducts.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    label: "Total Productos",
                    value: analyticsData.totalItems,
                    icon: "📦",
                    color: "text-blue-400"
                  },
                  {
                    label: "Valor Total",
                    value: `$${analyticsData.totalValue.toLocaleString()}`,
                    icon: "💰",
                    color: "text-green-400"
                  },
                  {
                    label: "Costo Total",
                    value: `$${analyticsData.totalCost.toLocaleString()}`,
                    icon: "💸",
                    color: "text-red-400"
                  },
                  {
                    label: "Margen de Ganancia",
                    value: `$${analyticsData.profit.toLocaleString()}`,
                    icon: "📈",
                    color: "text-lime-400"
                  }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                      <div className="text-3xl">{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">📊 Distribución por Categoría</h3>
                  <Doughnut
                    data={chartData.categoryDistribution}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { color: "white" }
                        }
                      }
                    }}
                  />
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">📈 Distribución por Estado</h3>
                  <Doughnut
                    data={chartData.statusDistribution}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { color: "white" }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-6">
              {viewMode === "table" ? (
                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-600"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-lime-400">Categoría</th>
                          <th className="px-4 py-3 text-left text-lime-400">Marca</th>
                          <th className="px-4 py-3 text-left text-lime-400">Modelo</th>
                          <th className="px-4 py-3 text-left text-lime-400">Color</th>
                          <th className="px-4 py-3 text-left text-lime-400">IMEI</th>
                          <th className="px-4 py-3 text-left text-lime-400">RAM</th>
                          <th className="px-4 py-3 text-left text-lime-400">Almacenamiento</th>
                          <th className="px-4 py-3 text-left text-lime-400">Estado</th>
                          <th className="px-4 py-3 text-left text-lime-400">Sucursal</th>
                          <th className="px-4 py-3 text-left text-lime-400">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product, idx) => (
                          <tr key={product.id || idx} className="border-t border-gray-700 hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => handleSelectProduct(product.id)}
                                className="rounded border-gray-600"
                              />
                            </td>
                            <td className="px-4 py-3">{product.category}</td>
                            <td className="px-4 py-3 font-medium">{product.brand}</td>
                            <td className="px-4 py-3">{product.model}</td>
                            <td className="px-4 py-3">{product.color}</td>
                            <td className="px-4 py-3">
                              {product.imei ? (
                                <span className="font-mono text-sm text-green-400">{product.imei}</span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Ingresa IMEI"
                                    value={editingIMEI[product.id] || ""}
                                    onChange={(e) => handleIMEIChange(product.id, e.target.value)}
                                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs font-mono w-32 focus:border-lime-500 focus:outline-none"
                                    maxLength={15}
                                  />
                                  {editingIMEI[product.id] && (
                                    <button
                                      onClick={() => saveIMEI(product.id)}
                                      disabled={savingIMEI[product.id] || !imeiValidation[product.id]?.valid}
                                      className="bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                                    >
                                      {savingIMEI[product.id] ? "💾" : "✓"}
                                    </button>
                                  )}
                                </div>
                              )}
                              {imeiValidation[product.id] && (
                                <div className={`text-xs mt-1 ${imeiValidation[product.id].valid ? 'text-green-400' : 'text-red-400'}`}>
                                  {imeiValidation[product.id].message}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">{product.ram || "-"}</td>
                            <td className="px-4 py-3">{product.storage || "-"}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                product.status === 'in_stock' ? 'bg-green-600 text-white' :
                                product.status === 'assigned' ? 'bg-yellow-500 text-black' :
                                'bg-red-500 text-white'
                              }`}>
                                {product.status === 'in_stock' ? '✅ En Stock' :
                                 product.status === 'assigned' ? '📋 Asignado' :
                                 '💰 Vendido'}
                              </span>
                            </td>
                            <td className="px-4 py-3">{product.store}</td>
                            <td className="px-4 py-3">
                              <button 
                                onClick={() => {
                                  setSelectedItem(product);
                                  setShowDetailsModal(true);
                                }}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                Ver detalles
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product, idx) => (
                    <div key={product.id || idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-lime-500 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded border-gray-600"
                        />
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.status === 'in_stock' ? 'bg-green-600 text-white' :
                          product.status === 'assigned' ? 'bg-yellow-500 text-black' :
                          'bg-red-500 text-white'
                        }`}>
                          {product.status === 'in_stock' ? '✅' :
                           product.status === 'assigned' ? '📋' : '💰'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{product.brand} {product.model}</h3>
                      <div className="space-y-1 text-sm text-gray-300 mb-4">
                        <p><span className="text-gray-400">Categoría:</span> {product.category}</p>
                        <p><span className="text-gray-400">Color:</span> {product.color}</p>
                        <p><span className="text-gray-400">RAM:</span> {product.ram || "-"}</p>
                        <p><span className="text-gray-400">Almacenamiento:</span> {product.storage || "-"}</p>
                        <p><span className="text-gray-400">Sucursal:</span> {product.store}</p>
                        <div>
                          <span className="text-gray-400">IMEI:</span>{" "}
                          {product.imei ? (
                            <span className="font-mono text-green-400">{product.imei}</span>
                          ) : (
                            <div className="mt-1">
                              <input
                                type="text"
                                placeholder="Ingresa IMEI"
                                value={editingIMEI[product.id] || ""}
                                onChange={(e) => handleIMEIChange(product.id, e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs font-mono w-full focus:border-lime-500 focus:outline-none"
                                maxLength={15}
                              />
                              {editingIMEI[product.id] && (
                                <button
                                  onClick={() => saveIMEI(product.id)}
                                  disabled={savingIMEI[product.id] || !imeiValidation[product.id]?.valid}
                                  className="bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 text-black px-2 py-1 rounded text-xs font-medium transition-colors mt-1 w-full"
                                >
                                  {savingIMEI[product.id] ? "💾 Guardando..." : "✓ Guardar IMEI"}
                                </button>
                              )}
                              {imeiValidation[product.id] && (
                                <div className={`text-xs mt-1 ${imeiValidation[product.id].valid ? 'text-green-400' : 'text-red-400'}`}>
                                  {imeiValidation[product.id].message}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <button
                        onClick={() => {
                          setSelectedItem(product);
                          setShowDetailsModal(true);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        Ver detalles
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">🏪 Productos por Sucursal</h3>
                  <Bar
                    data={chartData.storeDistribution}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          labels: { color: "white" }
                        }
                      },
                      scales: {
                        y: {
                          ticks: { color: "white" },
                          grid: { color: "rgba(255,255,255,0.1)" }
                        },
                        x: {
                          ticks: { color: "white" },
                          grid: { color: "rgba(255,255,255,0.1)" }
                        }
                      }
                    }}
                  />
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">📊 Estadísticas Detalladas</h3>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.brands).map(([brand, count]) => (
                      <div key={brand} className="flex justify-between items-center">
                        <span className="text-gray-300">{brand}</span>
                        <span className="text-lime-400 font-semibold">{count} productos</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "transfers" && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🔄 Historial de Transferencias</h3>
              <p className="text-gray-400">Funcionalidad de transferencias entre sucursales próximamente...</p>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold mb-4">➕ Agregar Nuevo Producto</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="category"
                    placeholder="Categoría"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    name="brand"
                    placeholder="Marca"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    name="model"
                    placeholder="Modelo"
                    value={newProduct.model}
                    onChange={(e) => setNewProduct({...newProduct, model: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    name="color"
                    placeholder="Color"
                    value={newProduct.color}
                    onChange={(e) => setNewProduct({...newProduct, color: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    name="imei"
                    placeholder="IMEI"
                    value={newProduct.imei}
                    onChange={(e) => setNewProduct({...newProduct, imei: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    name="serial"
                    placeholder="Número de Serie"
                    value={newProduct.serial}
                    onChange={(e) => setNewProduct({...newProduct, serial: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    name="cost"
                    placeholder="Costo"
                    type="number"
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({...newProduct, cost: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    name="price"
                    placeholder="Precio de Venta"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    name="ram"
                    placeholder="RAM"
                    value={newProduct.ram}
                    onChange={(e) => setNewProduct({...newProduct, ram: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    name="storage"
                    placeholder="Almacenamiento"
                    value={newProduct.storage}
                    onChange={(e) => setNewProduct({...newProduct, storage: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-lime-500 hover:bg-lime-600 text-black px-4 py-2 rounded-lg font-medium"
                  >
                    ✅ Agregar Producto
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg font-medium"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">🔄 Transferir Productos</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sucursal Destino:</label>
                  <select
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Selecciona sucursal</option>
                    {uniqueStores.map(store => (
                      <option key={store} value={store}>{store}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleTransfer}
                    disabled={!transferTarget}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium"
                  >
                    ✅ Transferir
                  </button>
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg font-medium"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Item Details Modal */}
        {showDetailsModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-lime-400">📦 Detalles del Producto</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
                    <p className="text-white">{selectedItem.category || "No especificada"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Marca</label>
                    <p className="text-white font-semibold">{selectedItem.brand || "No especificada"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Modelo</label>
                    <p className="text-white">{selectedItem.model || "No especificado"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Color</label>
                    <p className="text-white">{selectedItem.color || "No especificado"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">IMEI</label>
                    <p className="text-white font-mono text-sm">{selectedItem.imei || "No asignado"}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">RAM</label>
                    <p className="text-white">{selectedItem.ram || "No especificada"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Almacenamiento</label>
                    <p className="text-white">{selectedItem.storage || "No especificado"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Precio de Compra</label>
                    <p className="text-white">${parseFloat(selectedItem.purchase_price || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Precio de Venta</label>
                    <p className="text-white">${parseFloat(selectedItem.sale_price || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedItem.status === 'in_stock' ? 'bg-green-600 text-white' :
                      selectedItem.status === 'assigned' ? 'bg-yellow-500 text-black' :
                      'bg-red-500 text-white'
                    }`}>
                      {selectedItem.status === 'in_stock' ? '✅ En Stock' :
                       selectedItem.status === 'assigned' ? '📋 Asignado' :
                       '💰 Vendido'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Sucursal</label>
                    <p className="text-white">{selectedItem.store || "No especificada"}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-lime-400 mb-2">📅 Información de Registro</h3>
                <p className="text-sm text-gray-300">
                  Creado: {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString() : "No disponible"}
                </p>
                {selectedItem.inventory_request_id && (
                  <p className="text-sm text-gray-300">
                    ID de Solicitud: {selectedItem.inventory_request_id}
                  </p>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <div>
                  {!selectedItem.imei && (
                    <button
                      onClick={() => {
                        // Navigate to assign IMEI for this specific item
                        window.location.href = `/admin/assign-imei?item_id=${selectedItem.id}`;
                      }}
                      className="bg-lime-500 hover:bg-lime-600 text-black px-4 py-2 rounded-lg font-medium mr-3"
                    >
                      📱 Asignar IMEI
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Inventory;