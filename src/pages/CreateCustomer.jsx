import React, { useState } from "react";
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";

const CreateCustomer = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
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
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, setFile) => {
    console.log("📄 File selected:", e.target.files[0]?.name);
    setFile(e.target.files[0]);
    // Prevent any form submission
    e.preventDefault();
    e.stopPropagation();
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return form.first_name && form.last_name && form.phone;
      case 2:
        return form.address && form.postal_code;
      case 3:
        return form.employment_status && form.income;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    console.log("🔍 handleSubmit called:", { 
      currentStep, 
      eventType: e.type, 
      target: e.target.tagName,
      submitter: e.submitter?.tagName 
    });
    
    e.preventDefault();
    
    // CRITICAL: Only allow submission on the final step (step 4)
    if (currentStep !== 4) {
      console.log("🚫 Form submission blocked - not on final step", currentStep);
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // Add form fields
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      // Add files if they exist
      if (ifeFile) formData.append("ife", ifeFile);
      if (bureauFile) formData.append("bureau", bureauFile);
      
      // CRITICAL: Add finalSave flag to indicate this is the actual customer creation
      formData.append("finalSave", "true");

      const token = localStorage.getItem("token");
      
      // Check if token exists
      if (!token) {
        alert("❌ Sesión expirada. Por favor, inicia sesión nuevamente.");
        navigate("/auth");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/customer-directory");
        }, 2000);
      } else {
        const errorData = await res.json();
        
        // Handle authentication errors specifically
        if (res.status === 401 || res.status === 403) {
          alert("❌ Sesión expirada. Por favor, inicia sesión nuevamente.");
          localStorage.removeItem("token");
          navigate("/auth");
          return;
        }
        
        alert(`❌ Error al guardar cliente: ${errorData.message || errorData.error || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: "Información Personal", icon: "👤" },
    { id: 2, title: "Dirección", icon: "🏠" },
    { id: 3, title: "Información Financiera", icon: "💰" },
    { id: 4, title: "Documentos", icon: "📄" }
  ];

  if (success) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center max-w-md">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-lime-400 mb-2">¡Cliente Creado!</h2>
            <p className="text-gray-300 mb-4">El cliente ha sido registrado exitosamente</p>
            <div className="animate-pulse text-gray-400">Redirigiendo al directorio...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-black border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/customer-directory")}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Volver
              </button>
              <div>
                <h1 className="text-2xl font-bold text-lime-400">👤 Crear Nuevo Cliente</h1>
                <p className="text-gray-400">Registro completo de información del cliente</p>
              </div>
            </div>
            <div className="text-gray-400">
              Paso {currentStep} de {steps.length}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  currentStep >= step.id ? 'text-lime-400' : 'text-gray-500'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= step.id 
                      ? 'bg-lime-500 text-black' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <span className="hidden md:block font-medium">{step.icon} {step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-lime-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
              
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-lime-400 mb-6 flex items-center gap-2">
                    👤 Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Cliente *</label>
                      <select
                        name="customer_type"
                        value={form.customer_type}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                      >
                        <option value="Persona">👤 Persona Física</option>
                        <option value="Empresa">🏢 Persona Moral</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Género</label>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="M">👨 Masculino</option>
                        <option value="F">👩 Femenino</option>
                        <option value="O">⚧ Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nombres *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        placeholder="Nombre(s) completo"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Apellidos *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        placeholder="Apellido paterno y materno"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        placeholder="222 123 4567"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        placeholder="cliente@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Nacimiento</label>
                      <input
                        type="date"
                        name="birthdate"
                        value={form.birthdate}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">CURP / RFC</label>
                      <input
                        type="text"
                        name="curp"
                        value={form.curp}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        placeholder="CURP o RFC del cliente"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Address Information */}
              {currentStep === 2 && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-lime-400 mb-6 flex items-center gap-2">
                    🏠 Información de Domicilio
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Dirección *</label>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        placeholder="Calle, número exterior e interior"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Colonia / Fraccionamiento</label>
                      <input
                        type="text"
                        name="address2"
                        value={form.address2}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        placeholder="Colonia o fraccionamiento"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Código Postal *</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={form.postal_code}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        placeholder="74000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Vivienda</label>
                      <select
                        name="housing"
                        value={form.housing}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Propia">🏠 Casa Propia</option>
                        <option value="Rentada">🏘️ Casa Rentada</option>
                        <option value="Familiar">👨‍👩‍👧‍👦 Casa Familiar</option>
                        <option value="Otro">🏢 Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ruta de Cobranza</label>
                      <input
                        type="text"
                        name="route"
                        value={form.route}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        placeholder="Ruta asignada"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Financial Information */}
              {currentStep === 3 && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-lime-400 mb-6 flex items-center gap-2">
                    💰 Información Financiera
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Estado Civil</label>
                      <select
                        name="marital_status"
                        value={form.marital_status}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Soltero">💍 Soltero(a)</option>
                        <option value="Casado">👫 Casado(a)</option>
                        <option value="Divorciado">💔 Divorciado(a)</option>
                        <option value="Viudo">🖤 Viudo(a)</option>
                        <option value="Union Libre">💕 Unión Libre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Dependientes Económicos</label>
                      <input
                        type="number"
                        name="dependents"
                        value={form.dependents}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Situación Laboral *</label>
                      <select
                        name="employment_status"
                        value={form.employment_status}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        required
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Empleado">👔 Empleado</option>
                        <option value="Independiente">💼 Trabajador Independiente</option>
                        <option value="Empresario">🏢 Empresario</option>
                        <option value="Jubilado">🏖️ Jubilado</option>
                        <option value="Desempleado">❌ Desempleado</option>
                        <option value="Estudiante">🎓 Estudiante</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ocupación / Empresa</label>
                      <input
                        type="text"
                        name="employment"
                        value={form.employment}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        placeholder="Empresa o actividad laboral"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ingresos Mensuales *</label>
                      <input
                        type="number"
                        name="income"
                        value={form.income}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        placeholder="15000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Límite de Crédito Sugerido</label>
                      <input
                        type="number"
                        name="credit_limit"
                        value={form.credit_limit}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-lime-500 focus:outline-none"
                        placeholder="50000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documents */}
              {currentStep === 4 && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-lime-400 mb-6 flex items-center gap-2">
                    📄 Documentos de Identificación
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Identificación Oficial (INE/IFE)</label>
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-lime-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, setIfeFile)}
                          className="hidden"
                          id="ife-upload"
                        />
                        <label htmlFor="ife-upload" className="cursor-pointer">
                          <div className="text-4xl mb-2">📷</div>
                          <div className="text-gray-300">
                            {ifeFile ? ifeFile.name : "Subir INE/IFE"}
                          </div>
                          <div className="text-gray-500 text-sm mt-1">
                            JPG, PNG o PDF (máx. 5MB)
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Buró de Crédito (Opcional)</label>
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-lime-500 transition-colors">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileChange(e, setBureauFile)}
                          className="hidden"
                          id="bureau-upload"
                        />
                        <label htmlFor="bureau-upload" className="cursor-pointer">
                          <div className="text-4xl mb-2">📊</div>
                          <div className="text-gray-300">
                            {bureauFile ? bureauFile.name : "Subir Buró de Crédito"}
                          </div>
                          <div className="text-gray-500 text-sm mt-1">
                            Solo PDF (máx. 10MB)
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-lime-400 mb-2">📋 Resumen del Cliente</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Nombre:</span> {form.first_name} {form.last_name}
                      </div>
                      <div>
                        <span className="text-gray-400">Teléfono:</span> {form.phone}
                      </div>
                      <div>
                        <span className="text-gray-400">Email:</span> {form.email || "No proporcionado"}
                      </div>
                      <div>
                        <span className="text-gray-400">Ingresos:</span> ${parseFloat(form.income || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  ← Anterior
                </button>

                <div className="text-gray-400">
                  Paso {currentStep} de {steps.length}
                </div>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="bg-lime-500 hover:bg-lime-600 disabled:bg-gray-700 disabled:text-gray-500 text-black px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-lime-500 hover:bg-lime-600 disabled:bg-gray-700 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                        Creando Cliente...
                      </>
                    ) : (
                      <>
                        ✅ Crear Cliente
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCustomer;