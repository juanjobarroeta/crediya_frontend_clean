import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";

const CreateCustomer = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  
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
    customer_type: "Persona",
    
    // Address Information
    address: "",
    address2: "",
    postal_code: "",
    city: "",
    state: "",
    
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
    emergency_contact_name: "",
    emergency_contact_phone: "",
    notes: ""
  });

  const [files, setFiles] = useState({
    ine: null,
    bureau: null,
    proof_income: null,
    proof_address: null
  });

  const [dragActive, setDragActive] = useState({});

  // Step configuration
  const steps = [
    {
      id: 1,
      title: "Información Personal",
      icon: "👤",
      description: "Datos básicos del cliente"
    },
    {
      id: 2,
      title: "Dirección",
      icon: "🏠",
      description: "Información de domicilio"
    },
    {
      id: 3,
      title: "Información Financiera",
      icon: "💰",
      description: "Ingresos y empleo"
    },
    {
      id: 4,
      title: "Documentos",
      icon: "📄",
      description: "Subir documentación"
    },
    {
      id: 5,
      title: "Confirmación",
      icon: "✅",
      description: "Revisar y crear"
    }
  ];

  // Validation rules
  const validateStep = useCallback((step) => {
    const errors = {};
    
    switch (step) {
      case 1:
        if (!form.first_name.trim()) errors.first_name = "Nombres son requeridos";
        if (!form.last_name.trim()) errors.last_name = "Apellidos son requeridos";
        if (!form.phone.trim()) errors.phone = "Teléfono es requerido";
        if (form.phone && !/^\+?\d{10,}$/.test(form.phone.replace(/\s/g, ''))) {
          errors.phone = "Formato de teléfono inválido";
        }
        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
          errors.email = "Email inválido";
        }
        if (!form.curp.trim()) errors.curp = "CURP/INE es requerido";
        break;
        
      case 2:
        if (!form.address.trim()) errors.address = "Dirección es requerida";
        if (!form.postal_code.trim()) errors.postal_code = "Código postal es requerido";
        if (form.postal_code && !/^\d{5}$/.test(form.postal_code)) {
          errors.postal_code = "Código postal debe tener 5 dígitos";
        }
        break;
        
      case 3:
        if (!form.employment_status.trim()) errors.employment_status = "Estado laboral es requerido";
        if (!form.income.trim()) errors.income = "Ingresos son requeridos";
        if (form.income && parseFloat(form.income) <= 0) {
          errors.income = "Los ingresos deben ser mayores a 0";
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileUpload = useCallback((type, file) => {
    if (file && file.size > 10 * 1024 * 1024) { // 10MB limit
      alert("El archivo es demasiado grande. Máximo 10MB.");
      return;
    }
    
    setFiles(prev => ({ ...prev, [type]: file }));
  }, []);

  const handleDrag = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  const handleDrop = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(type, e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setUploadProgress(0);
    
    const token = localStorage.getItem("token");
    const formData = new FormData();
    
    // Add all form fields
    Object.keys(form).forEach(key => {
      if (form[key]) {
        formData.append(key, form[key]);
      }
    });
    
    // Add files
    Object.keys(files).forEach(type => {
      if (files[type]) {
        formData.append(type, files[type]);
      }
    });

    try {
      const res = await fetch(`${API_BASE_URL}/customers/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        alert("✅ Cliente creado correctamente");
        navigate("/crm");
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.message || 'Error al crear cliente'}`);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("❌ Error de conexión");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const requiredFields = {
      1: ['first_name', 'last_name', 'phone', 'curp'],
      2: ['address', 'postal_code'],
      3: ['employment_status', 'income'],
      4: [],
      5: []
    };
    
    const totalRequired = Object.values(requiredFields).flat().length;
    const completed = Object.values(requiredFields).flat().filter(field => form[field]?.trim()).length;
    
    return Math.round((completed / totalRequired) * 100);
  }, [form]);

  const FileUploadZone = ({ type, title, accept, description }) => (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
        dragActive[type] 
          ? 'border-lime-400 bg-lime-50 bg-opacity-5' 
          : files[type] 
            ? 'border-green-500 bg-green-50 bg-opacity-5' 
            : 'border-gray-600 hover:border-gray-500'
      }`}
      onDragEnter={(e) => handleDrag(e, type)}
      onDragLeave={(e) => handleDrag(e, type)}
      onDragOver={(e) => handleDrag(e, type)}
      onDrop={(e) => handleDrop(e, type)}
    >
      <input
        type="file"
        accept={accept}
        onChange={(e) => handleFileUpload(type, e.target.files[0])}
        className="hidden"
        id={`file-${type}`}
      />
      
      <label htmlFor={`file-${type}`} className="cursor-pointer">
        <div className="text-4xl mb-2">
          {files[type] ? '✅' : '📎'}
        </div>
        <div className="text-white font-medium mb-1">{title}</div>
        <div className="text-gray-400 text-sm mb-3">{description}</div>
        
        {files[type] ? (
          <div className="text-green-400 text-sm">
            ✓ {files[type].name}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            Arrastra aquí o haz clic para seleccionar
          </div>
        )}
      </label>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => navigate("/crm")}
                  className="mr-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  ← Volver
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-white">Crear Nuevo Cliente</h1>
                  <p className="text-gray-400">Complete la información del cliente paso a paso</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-lime-400">{completionPercentage}%</div>
                <div className="text-gray-400 text-sm">Completado</div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center space-x-4 overflow-x-auto pb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                    currentStep > step.id
                      ? 'bg-lime-500 border-lime-500 text-black'
                      : currentStep === step.id
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-gray-800 border-gray-600 text-gray-400'
                  }`}>
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <div className="ml-3 min-w-0">
                    <div className={`font-medium text-sm ${
                      currentStep >= step.id ? 'text-white' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-gray-400 text-xs">{step.description}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-px mx-4 ${
                      currentStep > step.id ? 'bg-lime-500' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl">
            
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">👤</div>
                  <h2 className="text-2xl font-bold text-white">Información Personal</h2>
                  <p className="text-gray-400">Datos básicos del cliente</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Tipo de Cliente *</label>
                    <select
                      name="customer_type"
                      value={form.customer_type}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none transition-colors"
                    >
                      <option value="Persona">👤 Persona Física</option>
                      <option value="Empresa">🏢 Persona Moral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Nombres *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:outline-none transition-colors ${
                        validationErrors.first_name ? 'border-red-500' : 'border-gray-600 focus:border-lime-400'
                      }`}
                      placeholder="Nombres del cliente"
                    />
                    {validationErrors.first_name && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Apellidos *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:outline-none transition-colors ${
                        validationErrors.last_name ? 'border-red-500' : 'border-gray-600 focus:border-lime-400'
                      }`}
                      placeholder="Apellidos del cliente"
                    />
                    {validationErrors.last_name && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.last_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Teléfono *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-400 bg-gray-600 border border-r-0 border-gray-600 rounded-l-lg">
                        🇲🇽 +52
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={`flex-1 p-3 bg-gray-700 border rounded-r-lg text-white focus:outline-none transition-colors ${
                          validationErrors.phone ? 'border-red-500' : 'border-gray-600 focus:border-lime-400'
                        }`}
                        placeholder="Número de celular"
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Teléfono Fijo</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-400 bg-gray-600 border border-r-0 border-gray-600 rounded-l-lg">
                        🇲🇽 +52
                      </span>
                      <input
                        type="tel"
                        name="landline"
                        value={form.landline || ''}
                        onChange={handleChange}
                        className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-r-lg text-white focus:border-lime-400 focus:outline-none transition-colors"
                        placeholder="Teléfono fijo (opcional)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:outline-none transition-colors ${
                        validationErrors.email ? 'border-red-500' : 'border-gray-600 focus:border-lime-400'
                      }`}
                      placeholder="correo@ejemplo.com"
                    />
                    {validationErrors.email && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">CURP / INE *</label>
                    <input
                      type="text"
                      name="curp"
                      value={form.curp}
                      onChange={handleChange}
                      className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:outline-none transition-colors ${
                        validationErrors.curp ? 'border-red-500' : 'border-gray-600 focus:border-lime-400'
                      }`}
                      placeholder="CURP o número de INE"
                    />
                    {validationErrors.curp && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.curp}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Género</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none transition-colors"
                    >
                      <option value="">Seleccione</option>
                      <option value="Masculino">👨 Masculino</option>
                      <option value="Femenino">👩 Femenino</option>
                      <option value="Otro">⚪ Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      name="birthdate"
                      value={form.birthdate}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🏠</div>
                  <h2 className="text-2xl font-bold text-white">Información de Domicilio</h2>
                  <p className="text-gray-400">Dirección completa del cliente</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 font-medium mb-2">Dirección Principal *</label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:outline-none transition-colors ${
                        validationErrors.address ? 'border-red-500' : 'border-gray-600 focus:border-lime-400'
                      }`}
                      placeholder="Calle, número exterior e interior"
                    />
                    {validationErrors.address && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.address}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-300 font-medium mb-2">Dirección Adicional</label>
                    <input
                      type="text"
                      name="address2"
                      value={form.address2}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none transition-colors"
                      placeholder="Colonia, referencias"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Código Postal *</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={form.postal_code}
                      onChange={handleChange}
                      className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:outline-none transition-colors ${
                        validationErrors.postal_code ? 'border-red-500' : 'border-gray-600 focus:border-lime-400'
                      }`}
                      placeholder="12345"
                      maxLength="5"
                    />
                    {validationErrors.postal_code && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.postal_code}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Ciudad</label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none transition-colors"
                      placeholder="Ciudad"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Estado</label>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none transition-colors"
                    >
                      <option value="">Seleccione estado</option>
                      <option value="Puebla">Puebla</option>
                      <option value="Ciudad de México">Ciudad de México</option>
                      <option value="Tlaxcala">Tlaxcala</option>
                      <option value="Morelos">Morelos</option>
                      <option value="Hidalgo">Hidalgo</option>
                      <option value="Estado de México">Estado de México</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Tipo de Vivienda</label>
                    <select
                      name="housing"
                      value={form.housing}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none transition-colors"
                    >
                      <option value="">Seleccione</option>
                      <option value="Propia">🏠 Casa Propia</option>
                      <option value="Rentada">🏘️ Casa Rentada</option>
                      <option value="Familiar">👨‍👩‍👧‍👦 Casa Familiar</option>
                      <option value="Departamento">🏢 Departamento</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Financial Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">💰</div>
                  <h2 className="text-2xl font-bold text-white">Información Financiera</h2>
                  <p className="text-gray-400">Datos laborales e ingresos</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Estado Laboral *</label>
                    <select
                      name="employment_status"
                      value={form.employment_status}
                      onChange={handleChange}
                      className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:outline-none transition-colors ${
                        validationErrors.employment_status ? 'border-red-500' : 'border-gray-600 focus:border-lime-400'
                      }`}
                    >
                      <option value="">Seleccione</option>
                      <option value="Empleado">👔 Empleado</option>
                      <option value="Independiente">🔧 Trabajador Independiente</option>
                      <option value="Comerciante">🏪 Comerciante</option>
                      <option value="Estudiante">🎓 Estudiante</option>
                      <option value="Jubilado">🏖️ Jubilado</option>
                      <option value="Desempleado">❌ Desempleado</option>
                    </select>
                    {validationErrors.employment_status && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.employment_status}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Lugar de Trabajo</label>
                    <input
                      type="text"
                      name="employment"
                      value={form.employment}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none transition-colors"
                      placeholder="Empresa o negocio"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Ingresos Mensuales *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">$</span>
                      <input
                        type="number"
                        name="income"
                        value={form.income}
                        onChange={handleChange}
                        className={`w-full pl-8 pr-3 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none transition-colors ${
                          validationErrors.income ? 'border-red-500' : 'border-gray-600 focus:border-lime-400'
                        }`}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {validationErrors.income && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.income}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Límite de Crédito Sugerido</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">$</span>
                      <input
                        type="number"
                        name="credit_limit"
                        value={form.credit_limit}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none transition-colors"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Estado Civil</label>
                    <select
                      name="marital_status"
                      value={form.marital_status}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none transition-colors"
                    >
                      <option value="">Seleccione</option>
                      <option value="Soltero">💍 Soltero(a)</option>
                      <option value="Casado">💒 Casado(a)</option>
                      <option value="Divorciado">📄 Divorciado(a)</option>
                      <option value="Viudo">🖤 Viudo(a)</option>
                      <option value="Union_Libre">👫 Unión Libre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Número de Dependientes</label>
                    <input
                      type="number"
                      name="dependents"
                      value={form.dependents}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-lime-400 focus:outline-none transition-colors"
                      min="0"
                      max="10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">📄</div>
                  <h2 className="text-2xl font-bold text-white">Documentación</h2>
                  <p className="text-gray-400">Subir documentos del cliente</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadZone
                    type="ine"
                    title="INE / IFE"
                    accept="image/*,.pdf"
                    description="Identificación oficial vigente"
                  />
                  
                  <FileUploadZone
                    type="proof_address"
                    title="Comprobante de Domicilio"
                    accept="image/*,.pdf"
                    description="Recibo de servicios o estado de cuenta"
                  />
                  
                  <FileUploadZone
                    type="proof_income"
                    title="Comprobante de Ingresos"
                    accept="image/*,.pdf"
                    description="Recibo de nómina o declaración"
                  />
                  
                  <FileUploadZone
                    type="bureau"
                    title="Buró de Crédito"
                    accept="image/*,.pdf"
                    description="Reporte de buró de crédito (opcional)"
                  />
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">📋 Información sobre Documentos</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Formatos aceptados: JPG, PNG, PDF</li>
                    <li>• Tamaño máximo: 10MB por archivo</li>
                    <li>• Los documentos deben ser legibles y vigentes</li>
                    <li>• El Buró de Crédito es opcional pero recomendado</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-white">Confirmación</h2>
                  <p className="text-gray-400">Revisar información antes de crear</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info Summary */}
                  <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-lime-400 mb-4">👤 Información Personal</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Nombre:</span> <span className="text-white">{form.first_name} {form.last_name}</span></div>
                      <div><span className="text-gray-400">Teléfono:</span> <span className="text-white">{form.phone}</span></div>
                      <div><span className="text-gray-400">Email:</span> <span className="text-white">{form.email || 'No proporcionado'}</span></div>
                      <div><span className="text-gray-400">CURP/INE:</span> <span className="text-white">{form.curp}</span></div>
                    </div>
                  </div>

                  {/* Address Summary */}
                  <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-lime-400 mb-4">🏠 Domicilio</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Dirección:</span> <span className="text-white">{form.address}</span></div>
                      <div><span className="text-gray-400">C.P.:</span> <span className="text-white">{form.postal_code}</span></div>
                      <div><span className="text-gray-400">Ciudad:</span> <span className="text-white">{form.city || 'No especificada'}</span></div>
                      <div><span className="text-gray-400">Estado:</span> <span className="text-white">{form.state || 'No especificado'}</span></div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-lime-400 mb-4">💰 Información Financiera</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Estado Laboral:</span> <span className="text-white">{form.employment_status}</span></div>
                      <div><span className="text-gray-400">Ingresos:</span> <span className="text-white">${parseFloat(form.income || 0).toLocaleString()}</span></div>
                      <div><span className="text-gray-400">Límite Sugerido:</span> <span className="text-white">${parseFloat(form.credit_limit || 0).toLocaleString()}</span></div>
                      <div><span className="text-gray-400">Estado Civil:</span> <span className="text-white">{form.marital_status || 'No especificado'}</span></div>
                    </div>
                  </div>

                  {/* Documents Summary */}
                  <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-lime-400 mb-4">📄 Documentos</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">INE/IFE:</span>
                        <span className={files.ine ? 'text-green-400' : 'text-red-400'}>
                          {files.ine ? '✓ Subido' : '✗ Faltante'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Comp. Domicilio:</span>
                        <span className={files.proof_address ? 'text-green-400' : 'text-gray-400'}>
                          {files.proof_address ? '✓ Subido' : '○ Opcional'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Comp. Ingresos:</span>
                        <span className={files.proof_income ? 'text-green-400' : 'text-gray-400'}>
                          {files.proof_income ? '✓ Subido' : '○ Opcional'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Buró de Crédito:</span>
                        <span className={files.bureau ? 'text-green-400' : 'text-gray-400'}>
                          {files.bureau ? '✓ Subido' : '○ Opcional'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Confirmación</h4>
                  <p className="text-gray-300 text-sm">
                    ¿La información proporcionada es correcta? Una vez creado el cliente, 
                    podrás editar algunos campos desde el perfil del cliente.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-700">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                ← Anterior
              </button>

              <div className="flex gap-3">
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-lime-600 hover:bg-lime-700 disabled:bg-gray-600 text-white rounded-lg font-bold transition-colors shadow-lg"
                  >
                    {isSubmitting ? "Creando Cliente..." : "✅ Crear Cliente"}
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar for Upload */}
            {uploadProgress > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Creando cliente...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-lime-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCustomer;