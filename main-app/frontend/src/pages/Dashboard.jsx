import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/reports/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Data load nahi hua."));
  }, []);

  if (error) return <p className="error-text">{error}</p>;
  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h1>📊 Aaj ka Summary</h1>
      <div className="card grid-stats">
        <div className="stat-box">
          <div className="label">Aaj ki Sale</div>
          <div className="value">₹{stats.todaySales.toFixed(2)}</div>
        </div>
        <div className="stat-box">
          <div className="label">Aaj ki Purchase</div>
          <div className="value">₹{stats.todayPurchases.toFixed(2)}</div>
        </div>
        <div className="stat-box">
          <div className="label">Aaj ka Profit</div>
          <div className="value">₹{stats.todayProfit.toFixed(2)}</div>
        </div>
        <div className="stat-box">
          <div className="label">Low Stock Items</div>
          <div className="value">{stats.lowStockCount}</div>
        </div>
        <div className="stat-box">
          <div className="label">Customers se Lena hai</div>
          <div className="value">₹{stats.totalReceivable.toFixed(2)}</div>
        </div>
        <div className="stat-box">
          <div className="label">Suppliers ko Dena hai</div>
          <div className="value">₹{stats.totalPayable.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
