import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const AccountBalances = () => {
  console.log("✅ AccountBalances mounted");
  const [from, setFrom] = useState("2000-01-01");
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [accounts, setAccounts] = useState([]);

  const token = localStorage.getItem("token");
  console.log("🔐 Token in use:", token);
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("🧠 Token payload:", payload);
  } catch (err) {
    console.error("❌ Failed to decode token:", err);
  }

  const fetchBalances = async () => {
    if (!from || !to) return;

    try {
      console.log("📅 Fetching with:", from, to);
      const res = await axios.get("http://localhost:5001/account-balances", {
        params: { from, to },
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("✅ Data received:", res.data);
      setAccounts(res.data);
    } catch (err) {
      console.error("❌ Error fetching balances:", err);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [from, to]);

  return (
    <Layout>
      <div className="px-6 py-6 max-w-6xl mx-auto text-white">
        <h2 className="text-xl font-bold mb-4">Movimientos por Cuenta</h2>

        <div className="mb-6 flex gap-4">
          <div>
            <label className="block mb-1 text-sm">Desde:</label>
            <input type="date" className="bg-gray-900 text-white border border-lime-500 px-2 py-1 rounded" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 text-sm">Hasta:</label>
            <input type="date" className="bg-gray-900 text-white border border-lime-500 px-2 py-1 rounded" value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>

        <table className="min-w-full text-sm text-white bg-black border border-lime-500">
          <thead className="bg-lime-500 text-black">
            <tr>
              <th className="px-4 py-2 text-left">Cuenta</th>
              <th className="px-4 py-2 text-right">Cargos</th>
              <th className="px-4 py-2 text-right">Abonos</th>
              <th className="px-4 py-2 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(accounts) && accounts.map((acc) => (
              <tr key={acc.code} className="border-t border-gray-700 hover:bg-gray-800">
                <td className="px-4 py-2">{acc.name}</td>
                <td className="px-4 py-2 text-right">${Number(acc.debit || 0).toFixed(2)}</td>
                <td className="px-4 py-2 text-right">${Number(acc.credit || 0).toFixed(2)}</td>
                <td className="px-4 py-2 text-right font-bold">${(Number(acc.debit || 0) - Number(acc.credit || 0)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AccountBalances;