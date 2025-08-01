import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const CustomerProfile = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [notes, setNotes] = useState([]);
  const [avals, setAvals] = useState([]);
  const [references, setReferences] = useState([]);
  const [newReference, setNewReference] = useState({ name: "", phone: "", curp: "", relationship: "" });
  const [newAval, setNewAval] = useState({ name: "", phone: "", curp: "", address: "" });

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/customers/${id}/notes`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        setNotes(res.data);
      } catch (err) {
        console.error("Error loading notes:", err);
      }
    };

    fetchNotes();
  }, [id]);

  useEffect(() => {
    const fetchAvals = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/customers/${id}/avals`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        setAvals(res.data);
      } catch (err) {
        console.error("Error loading avals:", err);
      }
    };

    fetchAvals();
  }, [id]);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/customers/${id}/references`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        setReferences(res.data);
      } catch (err) {
        console.error("Error loading references:", err);
      }
    };

    fetchReferences();
  }, [id]);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/customers/${id}/profile`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        setCustomer(res.data);
        console.log("✅ Customer loaded:", res.data);
      } catch (err) {
        console.error("Failed to load customer:", err);
        setError("No se pudo cargar el cliente.");
      } finally {
        setLoading(false);
      }
    };

    const fetchLoans = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/customers/${id}/loans`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        setLoans(res.data);
        console.log("✅ Loans loaded:", res.data);
      } catch (err) {
        console.error("Failed to load loans:", err);
        setError("No se pudo cargar los préstamos.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
    fetchLoans();
  }, [id]);

  if (loading || !customer) {
    return <Layout><div className="text-white p-10">Cargando cliente...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="text-red-500 p-10">{error}</div></Layout>;
  }

  return (
    <Layout>
      <div className="text-white p-6 max-w-5xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Perfil del Cliente</h2>
        <div className="mb-6">
          <p><strong>Nombre:</strong> {customer.first_name} {customer.last_name}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Teléfono:</strong> {customer.phone}</p>
        </div>

        {/* Summary Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 text-white p-4 rounded shadow">
            <h4 className="text-sm font-medium text-gray-400">Total Prestado</h4>
            <p className="text-xl font-bold text-lime-400">
              ${Array.isArray(loans)
    ? loans.map((loan) => Number(loan.amount) || 0).reduce((sum, amt) => sum + amt, 0).toFixed(2)
    : "0.00"}
            </p>
          </div>
          <div className="bg-gray-900 text-white p-4 rounded shadow">
            <h4 className="text-sm font-medium text-gray-400">Total Pagado</h4>
            <p className="text-xl font-bold text-lime-400">
              ${Array.isArray(loans)
    ? loans.map((loan) => Number(loan.amount_paid) || 0).reduce((sum, amt) => sum + amt, 0).toFixed(2)
    : "0.00"}
            </p>
          </div>
          <div className="bg-gray-900 text-white p-4 rounded shadow">
            <h4 className="text-sm font-medium text-gray-400">Balance Actual</h4>
            <p className="text-xl font-bold text-lime-400">
              ${((Array.isArray(loans)
    ? loans.map((loan) => Number(loan.amount) || 0).reduce((sum, amt) => sum + amt, 0)
    : 0) -
  (Array.isArray(loans)
    ? loans.map((loan) => Number(loan.amount_paid) || 0).reduce((sum, amt) => sum + amt, 0)
    : 0)
  ).toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900 text-white p-4 rounded shadow">
            <h4 className="text-sm font-medium text-gray-400">Préstamos Totales</h4>
            <p className="text-xl font-bold text-lime-400">{loans.length}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">Información del Cliente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-8">
          <div className="bg-gray-800 p-4 rounded shadow">
            <p><strong>CURP:</strong> {customer.curp || "N/A"}</p>
            <p><strong>Fecha de Nacimiento:</strong> {customer.birthdate || "N/A"}</p>
            <p><strong>Dirección:</strong> {customer.address || "N/A"}</p>
            <p><strong>Empleo:</strong> {customer.employment || "N/A"}</p>
            <p><strong>Ingreso Mensual:</strong> ${customer.income || 0}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded shadow">
            <p><strong>Archivo INE:</strong> {customer.ine_path ? <a href={`/uploads/${customer.ine_path}`} target="_blank" className="text-lime-400 underline">Ver INE</a> : "No disponible"}</p>
            <p><strong>Buró de Crédito:</strong> {customer.bureau_path ? <a href={`/uploads/${customer.bureau_path}`} target="_blank" className="text-lime-400 underline">Ver Buró</a> : "No disponible"}</p>
            <p><strong>Selfie:</strong> {customer.selfie_path ? <a href={`/uploads/${customer.selfie_path}`} target="_blank" className="text-lime-400 underline">Ver Selfie</a> : "No disponible"}</p>
            <p><strong>Video:</strong> {customer.video_path ? <a href={`/uploads/${customer.video_path}`} target="_blank" className="text-lime-400 underline">Ver Video</a> : "No disponible"}</p>
          </div>
        </div>

        {/* Calificación (Credit Rating) Section */}
        <h3 className="text-lg font-semibold mb-2">Calificación</h3>
        <div className="bg-gray-800 p-4 rounded shadow text-sm mb-8">
          <p>
            <strong>Nivel de Riesgo:</strong>
            <span
              className={`ml-2 px-2 py-1 rounded ${
                loans.length === 0
                  ? "bg-gray-600"
                  : loans.filter((l) => l.status === "atrasado").length > 0
                  ? "bg-red-600"
                  : loans.filter((l) => l.status === "activo").length > 0
                  ? "bg-yellow-600"
                  : "bg-green-600"
              }`}
            >
              {loans.length === 0
                ? "Sin historial"
                : loans.filter((l) => l.status === "atrasado").length > 0
                ? "Riesgo Alto"
                : loans.filter((l) => l.status === "activo").length > 0
                ? "Riesgo Medio"
                : "Cliente Confiable"}
            </span>
          </p>
          <p>
            <strong>Préstamos Atrasados:</strong> {loans.filter((l) => l.status === "atrasado").length}
          </p>
          <p>
            <strong>Préstamos Activos:</strong> {loans.filter((l) => l.status === "activo").length}
          </p>
          <p>
            <strong>Préstamos Finalizados:</strong> {loans.filter((l) => l.status === "liquidado").length}
          </p>
        </div>

        <h3 className="text-lg font-semibold mb-2">Notas Internas</h3>
        <div className="bg-gray-800 p-4 rounded shadow text-sm mb-6">
          <p className="text-gray-400 italic">Aquí puedes registrar comentarios sobre el cliente, historial de comportamiento, etc.</p>
          <textarea
            className="w-full p-2 mt-2 rounded bg-gray-900 text-white border border-gray-600"
            rows={3}
            placeholder="Agregar nota..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            className="mt-2 bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-1 rounded"
            onClick={async () => {
              try {
                const res = await axios.post(
                  `${API_BASE_URL}/customers/${id}/notes`,
                  { note },
                  { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
                );
                setNote("");
                setNoteMessage("✅ Nota guardada");
                // Refetch notes after saving
                try {
                  const notesRes = await axios.get(`${API_BASE_URL}/customers/${id}/notes`, {
                    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
                  });
                  setNotes(notesRes.data);
                } catch (fetchErr) {
                  // Optionally handle error
                }
                setTimeout(() => setNoteMessage(""), 3000);
              } catch (err) {
                console.error("Error saving note:", err);
                setNoteMessage("❌ Error al guardar nota");
              }
            }}
          >
            Guardar Nota
          </button>
          {noteMessage && <p className="text-xs mt-2 text-gray-400">{noteMessage}</p>}
          <hr className="my-4 border-gray-600" />
          <h4 className="text-sm font-semibold mb-2 text-lime-400">Historial de Notas</h4>
          <ul className="space-y-2">
            {notes.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay notas registradas aún.</p>
            ) : (
              notes.map((n) => (
                <li key={n.id} className="text-sm text-gray-300 border-l-4 pl-3 border-lime-500">
                  <p>{n.note}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Registrado el {new Date(n.created_at).toLocaleString()}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>

        <h3 className="text-lg font-semibold mb-2">Información de Avales</h3>
        <div className="bg-gray-800 p-4 rounded shadow text-sm mb-8">
          {avals.length === 0 ? (
            <p className="text-gray-400 italic">No hay avales registrados para este cliente.</p>
          ) : (
            <ul className="space-y-3">
              {avals.map((aval) => (
                <li key={aval.id} className="border-l-4 pl-3 border-lime-500">
                  <p><strong>Nombre:</strong> {aval.name}</p>
                  <p><strong>Teléfono:</strong> {aval.phone || "N/A"}</p>
                  <p><strong>CURP:</strong> {aval.curp || "N/A"}</p>
                  <p><strong>Dirección:</strong> {aval.address || "N/A"}</p>
                  <p className="text-xs text-gray-500 mt-1">Registrado el {new Date(aval.created_at).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Préstamo #{aval.loan_id}</p>
                </li>
              ))}
            </ul>
          )}
          <hr className="my-4 border-gray-600" />
          <h4 className="text-sm font-semibold mb-2 text-lime-400">Agregar Aval</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1"
              placeholder="Nombre"
              value={newAval.name}
              onChange={(e) => setNewAval({ ...newAval, name: e.target.value })}
            />
            <input
              className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1"
              placeholder="Teléfono"
              value={newAval.phone}
              onChange={(e) => setNewAval({ ...newAval, phone: e.target.value })}
            />
            <input
              className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1"
              placeholder="CURP"
              value={newAval.curp}
              onChange={(e) => setNewAval({ ...newAval, curp: e.target.value })}
            />
            <input
              className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1"
              placeholder="Dirección"
              value={newAval.address}
              onChange={(e) => setNewAval({ ...newAval, address: e.target.value })}
            />
          </div>
          <button
            className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-1 rounded"
            onClick={async () => {
              try {
                const res = await axios.post(
                  `${API_BASE_URL}/customers/${id}/avals`,
                  newAval,
                  { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
                );
                setNewAval({ name: "", phone: "", curp: "", address: "" });
                const res2 = await axios.get(`${API_BASE_URL}/customers/${id}/avals`, {
                  headers: { Authorization: "Bearer " + localStorage.getItem("token") },
                });
                setAvals(res2.data);
              } catch (err) {
                console.error("Error saving aval:", err);
              }
            }}
          >
            Guardar Aval
          </button>
        </div>

        <h3 className="text-lg font-semibold mb-2">Referencias</h3>
        <div className="bg-gray-800 p-4 rounded shadow text-sm mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1"
              placeholder="Nombre"
              value={newReference.name}
              onChange={(e) => setNewReference({ ...newReference, name: e.target.value })}
            />
            <input
              className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1"
              placeholder="Teléfono"
              value={newReference.phone}
              onChange={(e) => setNewReference({ ...newReference, phone: e.target.value })}
            />
            <input
              className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1"
              placeholder="CURP"
              value={newReference.curp}
              onChange={(e) => setNewReference({ ...newReference, curp: e.target.value })}
            />
            <input
              className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1"
              placeholder="Relación"
              value={newReference.relationship}
              onChange={(e) => setNewReference({ ...newReference, relationship: e.target.value })}
            />
          </div>
          <button
            className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-1 rounded"
            onClick={async () => {
              try {
                const res = await axios.post(
                  `${API_BASE_URL}/customers/${id}/references`,
                  newReference,
                  { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
                );
                setNewReference({ name: "", phone: "", curp: "", relationship: "" });
                const refRes = await axios.get(`${API_BASE_URL}/customers/${id}/references`, {
                  headers: { Authorization: "Bearer " + localStorage.getItem("token") },
                });
                setReferences(refRes.data);
              } catch (err) {
                console.error("Error adding reference:", err);
              }
            }}
          >
            Guardar Referencia
          </button>

          {references.length === 0 ? (
            <p className="text-gray-400 italic mt-4">No hay referencias registradas.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {references.map((ref) => (
                <li key={ref.id} className="border-l-4 pl-3 border-lime-500">
                  <p><strong>Nombre:</strong> {ref.name}</p>
                  <p><strong>Teléfono:</strong> {ref.phone || "N/A"}</p>
                  <p><strong>CURP:</strong> {ref.curp || "N/A"}</p>
                  <p><strong>Relación:</strong> {ref.relationship || "N/A"}</p>
                  <p className="text-xs text-gray-500">Registrado el {new Date(ref.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2">Préstamos</h3>
        {loans.length === 0 ? (
          <p className="text-sm text-gray-400">Este cliente no tiene préstamos.</p>
        ) : (
          <table className="w-full text-sm border border-lime-500 bg-black">
            <thead className="bg-lime-500 text-black">
              <tr>
                <th className="text-left px-4 py-2">Préstamo</th>
                <th className="text-right px-4 py-2">Monto</th>
                <th className="text-right px-4 py-2">Plazo</th>
                <th className="text-right px-4 py-2">Estado</th>
                <th className="text-center px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id} className="border-t border-gray-600 hover:bg-gray-800">
                  <td className="px-4 py-2">#{loan.id}</td>
                  <td className="text-right px-4 py-2">
                    ${Number(loan.amount || 0).toFixed(2)}
                  </td>
                  <td className="text-right px-4 py-2">{loan.term} semanas</td>
                  <td className="text-right px-4 py-2">{loan.status}</td>
                  <td className="text-center px-4 py-2">
                    <Link to={`/loans/${loan.id}/statement`} className="text-lime-400 hover:underline text-sm font-medium">
                      Estado de Cuenta
                    </Link>
                    <br />
                    <Link to={`/loans/${loan.id}/details`} className="text-blue-400 hover:underline text-sm font-medium">
                      Detalles Internos
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default CustomerProfile;