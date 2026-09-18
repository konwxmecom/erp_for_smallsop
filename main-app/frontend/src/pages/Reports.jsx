import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Reports() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [pnl, setPnl] = useState(null);
  const [daybookData, setDaybookData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);

  function loadReports() {
    api.get(`/api/reports/daily-pnl?date=${date}`).then((res) => setPnl(res.data));
    api.get(`/api/reports/daybook?date=${date}`).then((res) => setDaybookData(res.data));
    api.get(`/api/reports/top-products?limit=5`).then((res) => setTopProducts(res.data.topProducts));
  }

  useEffect(loadReports, [date]);

  return (
    <div>
      <h1>📈 Reports</h1>

      <div className="card">
        <label>Date chunein</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 220 }} />
      </div>

      {pnl && (
        <div className="card grid-stats">
          <div className="stat-box">
            <div className="label">Total Sale</div>
            <div className="value">₹{pnl.totalSales.toFixed(2)}</div>
          </div>
          <div className="stat-box">
            <div className="label">Cost of Goods Sold</div>
            <div className="value">₹{pnl.costOfGoodsSold.toFixed(2)}</div>
          </div>
          <div className="stat-box">
            <div className="label">Expenses</div>
            <div className="value">₹{pnl.totalExpenses.toFixed(2)}</div>
          </div>
          <div className="stat-box">
            <div className="label">Profit</div>
            <div className="value">₹{pnl.profit.toFixed(2)}</div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>🏆 Top-Selling Products (overall)</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p) => (
              <tr key={p.productId}>
                <td>{p.productName}</td>
                <td>{p.quantitySold}</td>
                <td>₹{p.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {daybookData && (
        <div className="card">
          <h3>📖 Daybook — {date}</h3>
          <p>
            <strong>Sales:</strong> {daybookData.sales.length} | <strong>Purchases:</strong>{" "}
            {daybookData.purchases.length} | <strong>Payments:</strong> {daybookData.payments.length} |{" "}
            <strong>Expenses:</strong> {daybookData.expenses.length}
          </p>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Party / Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {daybookData.sales.map((s) => (
                <tr key={s._id}>
                  <td>Sale</td>
                  <td>{s.party?.name}</td>
                  <td>₹{s.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
              {daybookData.purchases.map((p) => (
                <tr key={p._id}>
                  <td>Purchase</td>
                  <td>{p.party?.name}</td>
                  <td>₹{p.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
              {daybookData.payments.map((p) => (
                <tr key={p._id}>
                  <td>{p.direction === "received" ? "Jama (Received)" : "Chuka (Paid)"}</td>
                  <td>{p.party?.name}</td>
                  <td>₹{p.amount.toFixed(2)}</td>
                </tr>
              ))}
              {daybookData.expenses.map((e) => (
                <tr key={e._id}>
                  <td>Expense</td>
                  <td>{e.category}</td>
                  <td>₹{e.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
