import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Parties() {
  const [parties, setParties] = useState([]);
  const [type, setType] = useState("customer");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [paymentAmount, setPaymentAmount] = useState({});
  const [error, setError] = useState("");

  function loadParties() {
    api.get(`/api/parties?type=${type}`).then((res) => setParties(res.data.parties));
  }

  useEffect(loadParties, [type]);

  async function handleAddParty(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/parties", { ...form, type });
      setForm({ name: "", phone: "", address: "" });
      loadParties();
    } catch (err) {
      setError(err.response?.data?.message || "Party add nahi hui.");
    }
  }

  async function handleSettle(partyId) {
    const amount = Number(paymentAmount[partyId]);
    if (!amount || amount <= 0) return;
    const endpoint = type === "customer" ? "/api/payments/receive" : "/api/payments/pay";
    await api.post(endpoint, { party: partyId, amount });
    setPaymentAmount({ ...paymentAmount, [partyId]: "" });
    loadParties();
  }

  return (
    <div>
      <h1>👥 Parties &amp; Udhaar</h1>

      <div className="card">
        <div className="item-row" style={{ marginBottom: 16 }}>
          <button className={`btn ${type === "customer" ? "" : "btn-secondary"}`} onClick={() => setType("customer")}>
            Customers
          </button>
          <button className={`btn ${type === "supplier" ? "" : "btn-secondary"}`} onClick={() => setType("supplier")}>
            Suppliers
          </button>
        </div>

        <h3>Naya {type === "customer" ? "Customer" : "Supplier"} Add Karein</h3>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleAddParty}>
          <label>Naam</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <label>Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <label>Address</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button className="btn" type="submit">
            Save
          </button>
        </form>
      </div>

      <div className="card">
        <h3>{type === "customer" ? "Customers" : "Suppliers"} List</h3>
        <table>
          <thead>
            <tr>
              <th>Naam</th>
              <th>Phone</th>
              <th>{type === "customer" ? "Lena hai (Udhaar)" : "Dena hai (Udhaar)"}</th>
              <th>{type === "customer" ? "Jama Karo" : "Chuka Do"}</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.phone}</td>
                <td className={p.balance > 0 ? "balance-positive" : "balance-negative"}>₹{p.balance.toFixed(2)}</td>
                <td>
                  <div className="item-row">
                    <input
                      type="number"
                      placeholder="Amount"
                      style={{ width: 100 }}
                      value={paymentAmount[p._id] || ""}
                      onChange={(e) => setPaymentAmount({ ...paymentAmount, [p._id]: e.target.value })}
                    />
                    <button className="btn btn-secondary" onClick={() => handleSettle(p._id)}>
                      OK
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
