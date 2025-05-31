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
    const fetchData = async () => {
      console.log("Fetching weekly balance sheet from backend with:", { month, year });
      try {
        const res = await axios.get(`${API_BASE_URL}/balance-sheet-weekly`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });
        setEntries({
          weeks: res.data.map((week, i) => ({
            label: `Semana ${i + 1} (${week.week_start.slice(0, 10)} → ${week.week_end.slice(0, 10)})`,
            key: `week${i}`
          })),
          categories: convertToCategoryFormat(res.data)
        });
      } catch (err) {
        console.error("Error fetching balance sheet:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year]);

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto bg-black text-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-crediyaGreen mb-6">Balance General</h2>
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
                {entries.categories?.map((category, cidx) => (
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
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BalanceSheet;
