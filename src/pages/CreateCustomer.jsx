import React, { useState } from "react";
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";

const CreateCustomer = () => {
  const [form, setForm] = useState({
    // Personal Information
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    birthdate: "",
    curp: "",
    gender: "",
    nationality: "Mexicano",
    
    // Address Information
    address: "",
    address2: "",
    postal_code: "",
    
    // Financial Information
    employment: "",
    income: "",
    credit_limit: "",
    housing: "",
    employment_status: "",
    marital_status: "",
    dependents: "0",
    
    // Additional Information
    route: "",
    customer_type: "Persona"
  });

  const [ifeFile, setIfeFile] = useState(null);
  const [bureauFile, setBureauFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const token = localStorage.getItem("token");

    const formData = new FormData();
    
    // Personal Information
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("birthdate", form.birthdate);
    formData.append("curp", form.curp);
    formData.append("gender", form.gender);
    formData.append("nationality", form.nationality);
    
    // Address Information
    formData.append("address", form.address);
    formData.append("address2", form.address2);
    formData.append("postal_code", form.postal_code);
    
    // Financial Information
    formData.append("employment", form.employment);
    formData.append("income", form.income);
    formData.append("credit_limit", form.credit_limit);
    formData.append("housing", form.housing);
    formData.append("employment_status", form.employment_status);
    formData.append("marital_status", form.marital_status);
    formData.append("dependents", form.dependents);
    
    // Additional Information
    formData.append("route", form.route);
    formData.append("customer_type", form.customer_type);
    
    // Files
    if (ifeFile) formData.append("ine", ifeFile);
    if (bureauFile) formData.append("bureau", bureauFile);

    try {
      const res = await fetch(`${API_BASE_URL}/customers/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        alert("✅ Cliente creado correctamente");
        setForm({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          birthdate: "",
          curp: "",
          gender: "",
          nationality: "Mexicano",
          address: "",
          address2: "",
          postal_code: "",
          employment: "",
          income: "",
          credit_limit: "",
          housing: "",
          employment_status: "",
          marital_status: "",
          dependents: "0",
          route: "",
          customer_type: "Persona"
        });
        setIfeFile(null);
        setBureauFile(null);
        window.location.href = "/dashboard";
      } else {
        const errorData = await res.json();
        alert(`❌ Error al guardar cliente: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 text-white bg-black min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button 
              onClick={() => window.history.back()} 
              className="mr-4 text-crediyaGreen hover:text-green-400"
            >
              ←
            </button>
            <h2 className="text-2xl font-bold text-crediyaGreen">Crear Cliente</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* DATOS GENERALES Section */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-crediyaGreen mb-4">DATOS GENERALES</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Profile Picture Placeholder */}
                <div className="md:col-span-2 lg:col-span-1 flex justify-center">
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tipo *</label>
                    <select
                      name="customer_type"
                      value={form.customer_type}
                      onChange={handleChange}
                      className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    >
                      <option value="Persona">Persona</option>
                      <option value="Empresa">Empresa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Credencial de Elector *</label>
                    <input
                      type="text"
                      name="curp"
                      value={form.curp}
                      onChange={handleChange}
                      className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                      placeholder="INE / IFE"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nombres *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                      placeholder="Nombres"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Apellidos *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                      placeholder="Apellidos"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Género</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    >
                      <option value="">Seleccione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Celular *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-600 bg-gray-700 text-gray-300 text-sm">
                        🇲🇽 +52
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="flex-1 border border-gray-600 bg-gray-800 text-white p-2 rounded-r focus:border-crediyaGreen focus:outline-none"
                        placeholder="Número de celular"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-600 bg-gray-700 text-gray-300 text-sm">
                        🇲🇽 +52
                      </span>
                      <input
                        type="tel"
                        name="phone_secondary"
                        className="flex-1 border border-gray-600 bg-gray-800 text-white p-2 rounded-r focus:border-crediyaGreen focus:outline-none"
                        placeholder="Teléfono fijo"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                {/* Additional Personal Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nacionalidad</label>
                    <select
                      name="nationality"
                      value={form.nationality}
                      onChange={handleChange}
                      className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    >
                      <option value="Mexicano">Mexicano</option>
                      <option value="Extranjero">Extranjero</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      name="birthdate"
                      value={form.birthdate}
                      onChange={handleChange}
                      className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Vivienda</label>
                    <select
                      name="housing"
                      value={form.housing}
                      onChange={handleChange}
                      className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    >
                      <option value="">Seleccione</option>
                      <option value="Propia">Propia</option>
                      <option value="Rentada">Rentada</option>
                      <option value="Familiar">Familiar</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Estado Civil</label>
                    <select
                      name="marital_status"
                      value={form.marital_status}
                      onChange={handleChange}
                      className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    >
                      <option value="">Seleccione</option>
                      <option value="Soltero">Soltero</option>
                      <option value="Casado">Casado</option>
                      <option value="Divorciado">Divorciado</option>
                      <option value="Viudo">Viudo</option>
                      <option value="Unión Libre">Unión Libre</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* DIRECCIÓN Section */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-crediyaGreen mb-4">DIRECCIÓN</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
                  <div className="flex">
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="flex-1 border border-gray-600 bg-gray-800 text-white p-2 rounded-l focus:border-crediyaGreen focus:outline-none"
                      placeholder="Dirección principal"
                    />
                    <button type="button" className="px-3 border border-l-0 border-gray-600 bg-gray-700 text-gray-300 rounded-r hover:bg-gray-600">
                      📍
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Dirección 2</label>
                  <input
                    type="text"
                    name="address2"
                    value={form.address2}
                    onChange={handleChange}
                    className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    placeholder="Dirección secundaria"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Código Postal</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={form.postal_code}
                    onChange={handleChange}
                    className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    placeholder="Código postal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ruta</label>
                  <input
                    type="text"
                    name="route"
                    value={form.route}
                    onChange={handleChange}
                    className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    placeholder="Ruta asignada"
                  />
                </div>
              </div>
            </div>

            {/* INFORMACIÓN FINANCIERA Section */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-crediyaGreen mb-4">INFORMACIÓN FINANCIERA</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Condición Laboral</label>
                  <select
                    name="employment_status"
                    value={form.employment_status}
                    onChange={handleChange}
                    className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                  >
                    <option value="">Seleccione</option>
                    <option value="Empleado">Empleado</option>
                    <option value="Independiente">Independiente</option>
                    <option value="Desempleado">Desempleado</option>
                    <option value="Jubilado">Jubilado</option>
                    <option value="Estudiante">Estudiante</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Empleo o Actividad</label>
                  <input
                    type="text"
                    name="employment"
                    value={form.employment}
                    onChange={handleChange}
                    className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    placeholder="Ocupación actual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ingreso</label>
                  <input
                    type="number"
                    name="income"
                    value={form.income}
                    onChange={handleChange}
                    className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    placeholder="$0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Dependientes</label>
                  <input
                    type="number"
                    name="dependents"
                    value={form.dependents}
                    onChange={handleChange}
                    className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Límite de Crédito</label>
                  <input
                    type="number"
                    name="credit_limit"
                    value={form.credit_limit}
                    onChange={handleChange}
                    className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    placeholder="Límite de crédito"
                  />
                </div>
              </div>
            </div>

            {/* ADJUNTOS Section */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-crediyaGreen">ADJUNTOS</h3>
                <button type="button" className="text-crediyaGreen hover:text-green-400">
                  AGREGAR
                </button>
              </div>
              <p className="text-gray-400 mb-4">Agregar fotos de cédula y cualquier otro documento de interés.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Identificación (INE / IFE)</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, setIfeFile)}
                    className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    accept="image/*,.pdf"
                  />
                  {ifeFile && (
                    <p className="text-sm text-gray-400 mt-1">Archivo seleccionado: {ifeFile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Buró de Crédito</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, setBureauFile)}
                    className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded focus:border-crediyaGreen focus:outline-none"
                    accept="image/*,.pdf"
                  />
                  {bureauFile && (
                    <p className="text-sm text-gray-400 mt-1">Archivo seleccionado: {bureauFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* REFERENCIAS Section */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-crediyaGreen">REFERENCIAS</h3>
                <button type="button" className="text-crediyaGreen hover:text-green-400">
                  AGREGAR
                </button>
              </div>
              <p className="text-gray-400">Agregar contactos de referencia.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 font-semibold rounded transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? 'GUARDANDO...' : 'GUARDAR'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCustomer;
