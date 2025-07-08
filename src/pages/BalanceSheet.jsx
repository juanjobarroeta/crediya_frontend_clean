import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../utils/constants";

const BalanceSheet = () => {
  const [searchParams] = useSearchParams();
  const month = searchParams.get("month") || new Date().getMonth() + 1;
  const year = searchParams.get("year") || new Date().getFullYear();
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(value);
  };

  const [entries, setEntries] = useState({ categories: [], weeks: [] });
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [provisionalNetIncome, setProvisionalNetIncome] = useState(0);

  const convertToCategoryFormat = (weeks) => {
    if (!weeks.length) return [];

    const categories = [];

    const sections = ["ACTIVO", "PASIVO", "CAPITAL"];

    for (const section of sections) {
      const sectionData = {
        name: section,
        accounts: []
      };

      const labelSet = new Set();
      weeks.forEach(week => {
        week[section]?.accounts?.forEach(account => {
          labelSet.add(account.label);
        });
      });

      for (const label of labelSet) {
        const account = {
          label,
          weeklyAmounts: {},
          total: 0
        };

        weeks.forEach((week, i) => {
          const key = `week${i}`;
          const found = week[section]?.accounts?.find(acc => acc.label === label);
          const value = found ? found.value : 0;
          account.weeklyAmounts[key] = value;
          account.total += value;
        });

        sectionData.accounts.push(account);
      }

      categories.push(sectionData);
    }

    return categories;
  };

  useEffect(() => {
    const today = new Date();
    const defaultStart = "2000-01-01";
    const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, []);

  const loadData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/accounting/balance-sheet?start=${startDate}&end=${endDate}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const raw = res.data;
      const grouped = {};
      for (const row of raw) {
        if (!grouped[row.type]) grouped[row.type] = [];
        grouped[row.type].push({
          label: row.name,
          amount: row.balance,
        });
      }
      const data = grouped;

        const categories = Object.keys(data).map(name => {
          let accounts = data[name].map(account => ({
            label: account.label,
            weeklyAmounts: { week0: Math.abs(account.amount) },
            total: Math.abs(account.amount)
          }));
          // If ACTIVO, sort accounts: Fondo Fijo de Caja, Cuenta Bancaria at top
          if (name === "ACTIVO") {
            const priority = ["Fondo Fijo de Caja", "Cuenta Bancaria"];
            accounts.sort((a, b) => {
              const aIdx = priority.indexOf(a.label);
              const bIdx = priority.indexOf(b.label);
              if (aIdx === -1 && bIdx === -1) return 0;
              if (aIdx === -1) return 1;
              if (bIdx === -1) return -1;
              return aIdx - bIdx;
            });
          }
          return {
            name,
            accounts
          };
        });

      setEntries({
        weeks: [{ label: "Actual", key: "week0" }],
        categories
      });

      const todayStr = new Date().toISOString().slice(0, 10);
      try {
        const incomeRes = await axios.get(`${API_BASE_URL}/accounting/income-statement?start=2000-01-01&end=${todayStr}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const ingreso = incomeRes.data.INGRESO.reduce((sum, i) => sum + i.amount, 0);
        const egreso = incomeRes.data.EGRESO.reduce((sum, i) => sum + Math.abs(i.amount), 0);
        setProvisionalNetIncome(ingreso - egreso);
      } catch (err) {
        console.error("Error fetching provisional net income:", err);
      }
    } catch (err) {
      console.error("Error fetching balance sheet:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      loadData();
    }
  }, [startDate, endDate]);

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto bg-black text-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-crediyaGreen mb-6">Balance General</h2>
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-white text-sm mb-1">Fecha Inicio</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 bg-black border border-green-400 text-white rounded" />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">Fecha Fin</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 bg-black border border-green-400 text-white rounded" />
          </div>
          <button onClick={loadData} className="bg-lime-500 hover:bg-lime-600 text-black px-4 py-2 rounded font-bold">
            Filtrar
          </button>
        </div>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="overflow-x-auto mt-4 max-w-full">
            <table className="min-w-full text-sm text-white border border-crediyaGreen">
              <thead>
                <tr className="bg-crediyaGreen text-black">
                  <th className="p-2 text-left">Cuenta</th>
                  {entries.weeks?.map((week, i) => (
                    <th key={i} className="p-2 text-center">{week.label}</th>
                  ))}
                  <th className="p-2 text-center font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {entries.categories
                  ?.filter(category =>
                    category.name === "ACTIVO" ||
                    category.name === "PASIVO" ||
                    category.name === "CAPITAL"
                  )
                  .map((category, cidx) => (
                    <React.Fragment key={cidx}>
                      <tr>
                        <td colSpan={Math.max(entries.weeks.length + 2, 2)} className="pt-4 pb-2 text-lg text-crediyaGreen font-bold">
                          {category.name}
                        </td>
                      </tr>
                      {category.accounts.map((row, aidx) => (
                        <tr key={aidx} className="border-t border-crediyaGreen">
                          <td className="p-2">{row.label}</td>
                          {entries.weeks.map((week, widx) => {
                            const val = row.weeklyAmounts?.[week.key] ?? 0;
                            return (
                              <td key={widx} className="p-2 text-right">
                                {formatCurrency(val)}
                              </td>
                            );
                          })}
                          <td className="p-2 text-right font-bold">
                            {formatCurrency(row.total)}
                          </td>
                        </tr>
                      ))}
                      {category.name === "CAPITAL" && (
                        <tr className="border-t border-crediyaGreen">
                          <td className="p-2 italic text-yellow-400">Resultado Provisional (no cerrado)</td>
                          <td colSpan={entries.weeks.length} className="p-2 text-right italic text-yellow-400">
                            {formatCurrency(provisionalNetIncome)}
                          </td>
                          <td className="p-2 text-right font-bold italic text-yellow-400">
                            {formatCurrency(provisionalNetIncome)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                {(() => {
                  const sectionTotals = {
                    ACTIVO: 0,
                    PASIVO: 0,
                    CAPITAL: 0
                  };

                  entries.categories.forEach(category => {
                    if (sectionTotals.hasOwnProperty(category.name)) {
                      sectionTotals[category.name] = category.accounts.reduce((sum, acc) => sum + Math.abs(acc.total), 0);
                    }
                  });

                  sectionTotals.CAPITAL += provisionalNetIncome;

                  const control = sectionTotals.ACTIVO - Math.abs(sectionTotals.PASIVO + sectionTotals.CAPITAL);

                  return (
                    <>
                      <tr className="bg-black border-t-2 border-green-500">
                        <td className="p-2 font-bold text-lime-400">Total Activos</td>
                        <td colSpan={entries.weeks.length + 1} className="p-2 text-right text-lime-400 font-bold">
                          {formatCurrency(sectionTotals.ACTIVO)}
                        </td>
                      </tr>
                      <tr className="bg-black">
                        <td className="p-2 font-bold text-red-400">Total Pasivos + Capital</td>
                        <td colSpan={entries.weeks.length + 1} className="p-2 text-right text-red-400 font-bold">
                          {formatCurrency(Math.abs(sectionTotals.PASIVO + sectionTotals.CAPITAL))}
                        </td>
                      </tr>
                      <tr className={`bg-black ${control === 0 ? "text-crediyaGreen" : "text-red-400"}`}>
                        <td className="p-2 font-bold">Control (Diferencia)</td>
                        <td colSpan={entries.weeks.length + 1} className="p-2 text-right font-bold">
                          {formatCurrency(control)}
                        </td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BalanceSheet;
