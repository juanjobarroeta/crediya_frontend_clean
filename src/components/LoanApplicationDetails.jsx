import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Layout from "./Layout";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const LoanApplicationDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        console.log("🌐 API Base URL:", API_BASE_URL);
        console.log("🌐 Fetching from:", `${API_BASE_URL}/admin/loan-applications/${id}/details`);
        const res = await axios.get(`${API_BASE_URL}/admin/loan-applications/${id}/details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("🚀 API response:", res.data);
        console.log("🧾 Loan content:", res.data.loan);
        console.log("👤 Customer:", res.data.customer);
        console.log("📎 Documents:", res.data.documents);
        console.log("👥 Avals:", res.data.avals);
        console.log("🕵️ Investigation:", res.data.investigation);
        setData(res.data);
      } catch (err) {
        console.error("❌ Error caught in fetchDetails:", err);
        setData(null);
      } finally {
        console.log("✅ Done fetching, setting loading to false");
        setLoading(false);
      }
    };
    fetchDetails().catch((err) => {
      console.error("💥 Uncaught error in useEffect:", err);
      setLoading(false);
    });
  }, [id, token]);

  if (loading) return <Layout><div className="p-6 text-white">Cargando...</div></Layout>;
  if (!data || !data.loan) return <Layout><div className="p-6 text-red-500">No se pudo cargar la información del préstamo.</div></Layout>;

  const { loan, customer, avals, investigation, documents } = data;

  return (
    <Layout>
      <div className="p-6 text-white space-y-6">
        <h1 className="text-2xl font-bold">Detalles de la Solicitud de Préstamo #{loan.id}</h1>

        {/* Loan Summary */}
        <section className="bg-gray-900 p-4 rounded shadow space-y-2">
          <h2 className="text-xl font-semibold text-lime-400">Resumen del Préstamo</h2>
          <p><strong>Monto:</strong> ${loan.amount}</p>
          <p><strong>Plazo:</strong> {loan.term} semanas</p>
          <p><strong>Status:</strong> {loan.status}</p>
          <p><strong>Sucursal:</strong> {loan.store_id || "N/A"}</p>
          <p><strong>Empleado que capturó:</strong> {loan.employee_name || "No registrado"}</p>
          <p><strong>Producto Financiero:</strong> {loan.financial_product || "N/A"}</p>
          <p><strong>Contrato:</strong> {documents.contract_uploaded ? "📄 Cargado" : "❌ No cargado"}</p>
        </section>

        {/* Customer Info */}
        <section className="bg-gray-900 p-4 rounded shadow space-y-2">
          <h2 className="text-xl font-semibold text-lime-400">Información del Cliente</h2>
          <p><strong>Nombre:</strong> {customer.first_name} {customer.last_name}</p>
          <p><strong>Teléfono:</strong> {customer.phone}</p>
          <p><strong>CURP:</strong> {customer.curp}</p>
          <p><strong>Dirección:</strong> {customer.address}</p>
          <p><strong>Empleo:</strong> {customer.employment}</p>
          <p><strong>Ingreso Mensual:</strong> ${customer.income}</p>
          <p><strong>Documentos:</strong></p>
          <ul className="list-disc ml-6">
            <li>INE: {documents.ine ? "✅" : "❌"}</li>
            <li>Buró: {documents.bureau ? "✅" : "❌"}</li>
            <li>Selfie: {documents.selfie ? "✅" : "❌"}</li>
            <li>Video: {documents.video ? "✅" : "❌"}</li>
          </ul>
        </section>

        {/* Aval Information */}
        <section className="bg-gray-900 p-4 rounded shadow space-y-2">
          <h2 className="text-xl font-semibold text-lime-400">Avales</h2>
          {avals.length === 0 ? (
            <p>No hay avales registrados.</p>
          ) : (
            <ul className="list-disc ml-6">
              {avals.map((a) => (
                <li key={a.id}>
                  {a.name} – CURP: {a.curp || "N/A"} – Tel: {a.phone || "N/A"}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Investigator Report */}
        <section className="bg-gray-900 p-4 rounded shadow space-y-2">
          <h2 className="text-xl font-semibold text-lime-400">Reporte del Investigador</h2>
          {investigation ? (
            <>
              <p><strong>Fecha:</strong> {investigation.fecha}</p>
              <p><strong>Nombre del asesor:</strong> {investigation.nombre_asesor}</p>
              <p><strong>Sucursal:</strong> {investigation.sucursal}</p>
              <p><strong>Ocupación:</strong> {investigation.ocupacion}</p>
              <p><strong>Antigüedad:</strong> {investigation.antiguedad}</p>
              <p><strong>Frecuencia de pago:</strong> {investigation.frecuencia_pago}</p>
              <p><strong>Calificación:</strong> {investigation.calificacion}</p>
              <p><strong>Observaciones:</strong> {investigation.observaciones}</p>
            </>
          ) : (
            <p>No se ha registrado una investigación.</p>
          )}
        </section>

        {/* Contract Preview (if uploaded) */}
        {loan.contract_path && (
          <section className="bg-gray-900 p-4 rounded shadow space-y-2">
            <h2 className="text-xl font-semibold text-lime-400">Contrato Subido</h2>
            <button
              onClick={async () => {
                try {
                  const response = await axios.get(`${API_BASE_URL}/contracts/view/${loan.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob"
                  });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", loan.contract_path || "contrato.pdf");
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                } catch (err) {
                  console.error("Error downloading contract:", err);
                  alert("❌ No se pudo descargar el contrato.");
                }
              }}
              className="text-blue-400 underline"
            >
              Descargar contrato firmado 📄
            </button>
            <p className="text-sm text-gray-400">
              *Solo usuarios autenticados pueden acceder al contrato. Abre el enlace en una nueva pestaña.
            </p>
          </section>
        )}

        {/* Credit Behavior (placeholder) */}
        <section className="bg-gray-900 p-4 rounded shadow space-y-2">
          <h2 className="text-xl font-semibold text-lime-400">Comportamiento Crediticio</h2>
          <p>Historial del cliente con préstamos previos y penalizaciones (próximamente)</p>
        </section>

        {/* Audit Log & Store Performance (placeholder) */}
        <section className="bg-gray-900 p-4 rounded shadow space-y-2">
          <h2 className="text-xl font-semibold text-lime-400">Auditoría y Métricas</h2>
          <p>Registro de acciones (creación, aprobación, entrega) y métricas por sucursal (por implementar)</p>
        </section>
        {/* Approve Loan Button */}
        <div className="pt-4 flex gap-4">
          <button
            className={`px-6 py-2 rounded font-semibold ${
              documents.contract_uploaded
                ? "bg-lime-500 hover:bg-lime-600 text-black"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
            disabled={!documents.contract_uploaded}
            onClick={async () => {
              try {
                await axios.post(`${API_BASE_URL}/admin/loans/${loan.id}/approve`, {}, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                alert("✅ Préstamo aprobado. Ahora puedes marcarlo como entregado.");
              } catch (err) {
                console.error("Error approving loan:", err);
                alert("❌ Error al aprobar el préstamo.");
              }
            }}
          >
            Aprobar Préstamo
          </button>

          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded"
            onClick={async () => {
              try {
                await axios.post(`${API_BASE_URL}/admin/loans/${loan.id}/reject`, {}, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                alert("🚫 Préstamo rechazado.");
              } catch (err) {
                console.error("Error rejecting loan:", err);
                alert("❌ Error al rechazar el préstamo.");
              }
            }}
          >
            Rechazar Préstamo
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default LoanApplicationDetails;