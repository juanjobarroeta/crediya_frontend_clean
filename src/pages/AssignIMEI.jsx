import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";

const AssignIMEI = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});
  const [validation, setValidation] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStore, setSelectedStore] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // table, grid
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const token = localStorage.getItem("token");

  // IMEI Validation Functions
  const validateIMEI = (imei) => {
    const cleanIMEI = imei.replace(/[\s-]/g, '');
    
    if (!/^\d{15}$/.test(cleanIMEI)) {
      return { isValid: false, message: "IMEI debe tener exactamente 15 dígitos" };
    }

    // Luhn algorithm validation
    const luhnCheck = (imei) => {
      let sum = 0;
      let shouldDouble = false;
      
      for (let i = imei.length - 1; i >= 0; i--) {
        let digit = parseInt(imei[i]);
        
        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        shouldDouble = !shouldDouble;
      }
      
      return sum % 10 === 0;
    };

    if (!luhnCheck(cleanIMEI)) {
      return { isValid: false, message: "IMEI no es válido (falló verificación Luhn)" };
    }

    return { isValid: true, message: "✅ IMEI válido" };
  };

  const checkIMEIDuplicate = async (imei) => {
    if (!imei || imei.length < 15) return false;
    
    try {
      const cleanIMEI = imei.replace(/[\s-]/g, '');
      const response = await axios.get(`${API_BASE_URL}/inventory-items/check-imei/${cleanIMEI}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.exists;
    } catch (error) {
      console.error("Error checking IMEI duplicate:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/inventory-items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter items that need IMEI (phones without IMEI)
      const filtered = response.data.filter(item => 
        (item.category?.toLowerCase() === 'teléfono' || item.category?.toLowerCase() === 'telefono') && 
        !item.imei
      );
      
      setItems(filtered);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (id, value) => {
    // Format IMEI as user types (add spaces every 3 digits)
    const formatted = value.replace(/\D/g, '').replace(/(\d{3})(?=\d)/g, '$1 ').trim();
    
    setEditing(prev => ({ ...prev, [id]: formatted }));
    
    if (value.replace(/\s/g, '').length === 15) {
      const validation = validateIMEI(value);
      
      if (validation.isValid) {
        const isDuplicate = await checkIMEIDuplicate(value);
        if (isDuplicate) {
          setValidation(prev => ({ 
            ...prev, 
            [id]: { isValid: false, message: "❌ Este IMEI ya existe", isDuplicate: true }
          }));
        } else {
          setValidation(prev => ({ 
            ...prev, 
            [id]: { isValid: true, message: validation.message, isDuplicate: false }
          }));
        }
      } else {
        setValidation(prev => ({ 
          ...prev, 
          [id]: { isValid: false, message: validation.message, isDuplicate: false }
        }));
      }
    } else {
      setValidation(prev => ({ ...prev, [id]: { isValid: false, message: "", isDuplicate: false } }));
    }
  };

  const handleSave = async (id) => {
    const imei = editing[id];
    if (!imei) return;
    
    const validation = validateIMEI(imei);
    if (!validation.isValid) {
      alert("Por favor ingresa un IMEI válido");
      return;
    }

    try {
      const cleanIMEI = imei.replace(/\s/g, '');
      await axios.put(`${API_BASE_URL}/inventory-items/${id}/imei`, { imei: cleanIMEI }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setItems(prev => prev.filter(item => item.id !== id));
      setEditing(prev => {
        const newEditing = { ...prev };
        delete newEditing[id];
        return newEditing;
      });
      setValidation(prev => {
        const newValidation = { ...prev };
        delete newValidation[id];
        return newValidation;
      });
      
      alert("✅ IMEI asignado correctamente");
    } catch (err) {
      console.error("Error updating IMEI:", err);
      alert("❌ Error al guardar IMEI");
    }
  };

  const handleBulkSave = async () => {
    const itemsToSave = selectedItems.filter(id => {
      const imei = editing[id];
      const validation = validation[id];
      return imei && validation?.isValid && !validation?.isDuplicate;
    });

    if (itemsToSave.length === 0) {
      alert("No hay IMEIs válidos para guardar");
      return;
    }

    try {
      for (const id of itemsToSave) {
        const imei = editing[id];
        const cleanIMEI = imei.replace(/\s/g, '');
        await axios.put(`${API_BASE_URL}/inventory-items/${id}/imei`, { imei: cleanIMEI }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setEditing({});
      setValidation({});
      setSelectedItems([]);
      setBulkMode(false);
      
      alert(`✅ ${itemsToSave.length} IMEIs asignados correctamente`);
    } catch (err) {
      console.error("Error in bulk save:", err);
      alert("❌ Error al guardar IMEIs");
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id?.toString().includes(searchTerm);
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesStore = selectedStore === "all" || item.store === selectedStore;
    
    return matchesSearch && matchesCategory && matchesStore;
  });

  const categories = [...new Set(items.map(item => item.category))];
  const stores = [...new Set(items.map(item => item.store))];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Cargando productos...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                📱 Asignación de IMEI
              </h1>
              <p className="text-gray-400">
                Asigna IMEIs a productos telefónicos para control de inventario
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setBulkMode(!bulkMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  bulkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {bulkMode ? '✕ Salir Modo Masivo' : '📦 Modo Masivo'}
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {viewMode === 'table' ? '📱 Vista Cuadrícula' : '📊 Vista Tabla'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-white">{items.length}</div>
            <div className="text-gray-400 text-sm">Productos sin IMEI</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{filteredItems.length}</div>
            <div className="text-gray-400 text-sm">Filtrados</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{selectedItems.length}</div>
            <div className="text-gray-400 text-sm">Seleccionados</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">
              {selectedItems.filter(id => editing[id] && validation[id]?.isValid && !validation[id]?.isDuplicate).length}
            </div>
            <div className="text-gray-400 text-sm">Listos para guardar</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-300 font-medium mb-2">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por marca, modelo o ID..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Sucursal</label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="all">Todas las sucursales</option>
                {stores.map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              {bulkMode && selectedItems.length > 0 && (
                <button
                  onClick={handleBulkSave}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  💾 Guardar {selectedItems.length} IMEIs
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-white mb-2">¡Excelente trabajo!</h3>
            <p className="text-gray-400">
              {items.length === 0 
                ? "Todos los productos telefónicos ya tienen IMEI asignado."
                : "No hay productos que coincidan con los filtros aplicados."
              }
            </p>
          </div>
        ) : (
          <div>
            {viewMode === "table" ? (
              <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-700">
                      <tr>
                        {bulkMode && (
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-600"
                            />
                          </th>
                        )}
                        <th className="px-4 py-3 text-left text-gray-300">ID</th>
                        <th className="px-4 py-3 text-left text-gray-300">Marca</th>
                        <th className="px-4 py-3 text-left text-gray-300">Modelo</th>
                        <th className="px-4 py-3 text-left text-gray-300">Color</th>
                        <th className="px-4 py-3 text-left text-gray-300">Sucursal</th>
                        <th className="px-4 py-3 text-left text-gray-300">IMEI</th>
                        <th className="px-4 py-3 text-left text-gray-300">Estado</th>
                        <th className="px-4 py-3 text-left text-gray-300">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-700/50">
                          {bulkMode && (
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleSelectItem(item.id)}
                                className="rounded border-gray-600"
                              />
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <span className="font-mono text-lime-400 font-bold">#{item.id}</span>
                          </td>
                          <td className="px-4 py-3 text-white">{item.brand}</td>
                          <td className="px-4 py-3 text-white">{item.model}</td>
                          <td className="px-4 py-3 text-gray-300">{item.color}</td>
                          <td className="px-4 py-3 text-gray-300">{item.store}</td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editing[item.id] || ""}
                              onChange={(e) => handleChange(item.id, e.target.value)}
                              maxLength={17}
                              placeholder="123 456 789 012 345"
                              className={`w-full bg-gray-700 border rounded px-3 py-2 text-white font-mono text-sm ${
                                validation[item.id]?.message ? 
                                  (validation[item.id]?.isValid ? 'border-green-500' : 'border-red-500') : 
                                  'border-gray-600'
                              }`}
                            />
                            {validation[item.id]?.message && (
                              <p className={`text-xs mt-1 ${
                                validation[item.id]?.isValid ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {validation[item.id]?.message}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              validation[item.id]?.isValid && !validation[item.id]?.isDuplicate
                                ? 'bg-green-600 text-white'
                                : editing[item.id]
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-600 text-gray-300'
                            }`}>
                              {validation[item.id]?.isValid && !validation[item.id]?.isDuplicate
                                ? '✅ Válido'
                                : editing[item.id]
                                ? '⚠️ Pendiente'
                                : '⏳ Sin IMEI'
                              }
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {!bulkMode && (
                              <button
                                onClick={() => handleSave(item.id)}
                                disabled={!editing[item.id] || !validation[item.id]?.isValid || validation[item.id]?.isDuplicate}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  !editing[item.id] || !validation[item.id]?.isValid || validation[item.id]?.isDuplicate
                                    ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                                    : 'bg-lime-500 hover:bg-lime-600 text-black'
                                }`}
                              >
                                💾 Guardar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-lime-500 transition-colors">
                    {bulkMode && (
                      <div className="flex justify-end mb-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="rounded border-gray-600"
                        />
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-lime-400 font-bold text-sm">#{item.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          validation[item.id]?.isValid && !validation[item.id]?.isDuplicate
                            ? 'bg-green-600 text-white'
                            : editing[item.id]
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {validation[item.id]?.isValid && !validation[item.id]?.isDuplicate
                            ? '✅ Válido'
                            : editing[item.id]
                            ? '⚠️ Pendiente'
                            : '⏳ Sin IMEI'
                          }
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{item.brand} {item.model}</h3>
                      <div className="space-y-1 text-sm text-gray-300">
                        <p><span className="text-gray-400">Color:</span> {item.color}</p>
                        <p><span className="text-gray-400">Sucursal:</span> {item.store}</p>
                        <p><span className="text-gray-400">RAM:</span> {item.ram || "-"}</p>
                        <p><span className="text-gray-400">Almacenamiento:</span> {item.storage || "-"}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-300 font-medium mb-1 text-sm">IMEI</label>
                        <input
                          type="text"
                          value={editing[item.id] || ""}
                          onChange={(e) => handleChange(item.id, e.target.value)}
                          maxLength={17}
                          placeholder="123 456 789 012 345"
                          className={`w-full bg-gray-700 border rounded px-3 py-2 text-white font-mono text-sm ${
                            validation[item.id]?.message ? 
                              (validation[item.id]?.isValid ? 'border-green-500' : 'border-red-500') : 
                              'border-gray-600'
                          }`}
                        />
                        {validation[item.id]?.message && (
                          <p className={`text-xs mt-1 ${
                            validation[item.id]?.isValid ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {validation[item.id]?.message}
                          </p>
                        )}
                      </div>

                      {!bulkMode && (
                        <button
                          onClick={() => handleSave(item.id)}
                          disabled={!editing[item.id] || !validation[item.id]?.isValid || validation[item.id]?.isDuplicate}
                          className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                            !editing[item.id] || !validation[item.id]?.isValid || validation[item.id]?.isDuplicate
                              ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                              : 'bg-lime-500 hover:bg-lime-600 text-black'
                          }`}
                        >
                          💾 Guardar IMEI
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AssignIMEI; 