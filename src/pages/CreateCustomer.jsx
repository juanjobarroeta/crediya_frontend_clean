import React, { useState } from "react";
import Layout from "../components/Layout";
import { API_BASE_URL } from "../utils/constants";

const CreateCustomer = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    birthdate: "",
    curp: "",
    address: "",
    employment: "",
    income: "",
  });

  const [ifeFile, setIfeFile] = useState(null);
  const [bureauFile, setBureauFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("birthdate", form.birthdate);
    formData.append("curp", form.curp);
    formData.append("address", form.address);
    formData.append("employment", form.employment);
    formData.append("income", form.income);
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
          address: "",
          employment: "",
          income: "",
        });
        setIfeFile(null);
        setBureauFile(null);
        window.location.href = "/dashboard";
      } else {
        alert("❌ Error al guardar cliente");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Error de conexión");
    }
  };

  return (
    <Layout>
    <div className="p-6 text-white bg-black min-h-screen">
      <h2 className="text-xl font-bold text-crediyaGreen mb-6">Registrar Cliente</h2>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <input
              type="text"
              className="w-full max-w-md mb-4 border border-crediyaGreen bg-black text-white p-2 rounded"
              name="first_name"
              placeholder="Nombre"
              value={form.first_name}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="w-full max-w-md mb-4 border border-crediyaGreen bg-black text-white p-2 rounded"
              name="last_name"
              placeholder="Apellido"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <input
              type="email"
              className="w-full max-w-md mb-4 border border-crediyaGreen bg-black text-white p-2 rounded"
              name="email"
              placeholder="Correo"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="w-full max-w-md mb-4 border border-crediyaGreen bg-black text-white p-2 rounded"
              name="phone"
              placeholder="Teléfono"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <input
              type="date"
              className="w-full max-w-md mb-4 border border-crediyaGreen bg-black text-white p-2 rounded"
              name="birthdate"
              value={form.birthdate}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="w-full max-w-md mb-4 border border-crediyaGreen bg-black text-white p-2 rounded"
              name="curp"
              placeholder="CURP / RFC"
              value={form.curp}
              onChange={handleChange}
            />
          </div>
          <div className="col-12">
            <input
              type="text"
              className="w-full max-w-md mb-4 border border-crediyaGreen bg-black text-white p-2 rounded"
              name="address"
              placeholder="Dirección"
              value={form.address}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="w-full max-w-md mb-4 border border-crediyaGreen bg-black text-white p-2 rounded"
              name="employment"
              placeholder="Empleo o actividad"
              value={form.employment}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <input
              type="number"
              className="w-full max-w-md mb-4 border border-crediyaGreen bg-black text-white p-2 rounded"
              name="income"
              placeholder="Ingreso mensual"
              value={form.income}
              onChange={handleChange}
            />
          </div>

          {/* File upload section */}
          <div className="col-md-6">
            <label className="form-label">Identificación (INE / IFE)</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => handleFileChange(e, setIfeFile)}
            />
            {ifeFile && <small>Archivo seleccionado: {ifeFile.name}</small>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Buró de Crédito</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => handleFileChange(e, setBureauFile)}
            />
            {bureauFile && <small>Archivo seleccionado: {bureauFile.name}</small>}
          </div>
        </div>

        <button className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-2 rounded mt-4">Guardar Cliente</button>
      </form>
    </div>
    </Layout>
  );
};

export default CreateCustomer;
