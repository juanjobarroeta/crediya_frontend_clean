

import React, { useEffect, useState } from "react";
import axios from "axios";

const StoreDashboard = () => {
  const [data, setData] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/dashboard/store-profitability`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );
      setData(res.data);
    } catch (err) {
      console.error("Error fetching store profitability:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>🏬 Store Dashboard</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>From: </label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <label style={{ marginLeft: "1rem" }}>To: </label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={fetchData} style={{ marginLeft: "1rem" }}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading store data...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Store</th>
              <th>Revenue</th>
              <th>COGS</th>
              <th>Interest</th>
              <th>Penalties</th>
              <th>Expenses</th>
              <th>Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.store}>
                <td>{s.store}</td>
                <td>${s.revenue.toFixed(2)}</td>
                <td>${s.cogs.toFixed(2)}</td>
                <td>${s.interest.toFixed(2)}</td>
                <td>${s.penalties.toFixed(2)}</td>
                <td>${s.expenses.toFixed(2)}</td>
                <td><strong>${s.net_profit.toFixed(2)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StoreDashboard;