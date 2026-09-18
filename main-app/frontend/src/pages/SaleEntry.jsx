import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function SaleEntry() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [party, setParty] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [items, setItems] = useState([{ product: "", quantity: 1, rate: 0, gstPercent: 0 }]);
  const [paymentType, setPaymentType] = useState("cash");
  const [amountPaid, setAmountPaid] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function loadData() {
    api.get("/api/parties?type=customer").then((res) => setCustomers(res.data.parties));
    api.get("/api/products").then((res) => setProducts(res.data.products));
  }

  useEffect(loadData, []);

  async function handleAddCustomer() {
    if (!newCustomerName.trim()) return;
    const res = await api.post("/api/parties", { name: newCustomerName, type: "customer" });
    setCustomers([...customers, res.data.party]);
    setParty(res.data.party._id);
    setNewCustomerName("");
  }

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;
    // auto-fill sale price when product selected
    if (field === "product") {
      const p = products.find((prod) => prod._id === value);
      if (p) updated[index].rate = p.salePrice;
      if (p) updated[index].gstPercent = p.gstPercent;
    }
    setItems(updated);
  }

  function addItemRow() {
    setItems([...items, { product: "", quantity: 1, rate: 0, gstPercent: 0 }]);
  }

  function removeItemRow(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.rate * (1 + i.gstPercent / 100), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/api/sales", {
        party,
        items,
        paymentType,
        amountPaid: paymentType === "udhaar" ? amountPaid : total,
      });
      setMessage("✅ Sale save ho gayi. Stock update ho gaya.");
      setItems([{ product: "", quantity: 1, rate: 0, gstPercent: 0 }]);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Sale save nahi hui.");
    }
  }

  return (
    <div>
      <h1>📤 Sale Entry</h1>
      <div className="card">
        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text">{message}</p>}
        <form onSubmit={handleSubmit}>
          <label>Customer</label>
          <div className="item-row">
            <select value={party} onChange={(e) => setParty(e.target.value)} required>
              <option value="">-- Customer chunein --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Ya naya customer naam"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
            />
            <button type="button" className="btn btn-secondary" onClick={handleAddCustomer}>
              + Add
            </button>
          </div>

          <label>Products</label>
          {items.map((item, index) => (
            <div className="item-row" key={index}>
              <select value={item.product} onChange={(e) => updateItem(index, "product", e.target.value)} required>
                <option value="">-- Product --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Stock: {p.stockQty})
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Qty"
                style={{ width: 80 }}
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
              />
              <input
                type="number"
                placeholder="Rate"
                style={{ width: 100 }}
                value={item.rate}
                onChange={(e) => updateItem(index, "rate", Number(e.target.value))}
              />
              <input
                type="number"
                placeholder="GST%"
                style={{ width: 80 }}
                value={item.gstPercent}
                onChange={(e) => updateItem(index, "gstPercent", Number(e.target.value))}
              />
              {items.length > 1 && (
                <button type="button" className="btn btn-secondary" onClick={() => removeItemRow(index)}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addItemRow} style={{ marginBottom: 16 }}>
            + Aur Product Add Karein
          </button>

          <h3>Total: ₹{total.toFixed(2)}</h3>

          <label>Payment Type</label>
          <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="udhaar">Udhaar (Credit)</option>
          </select>

          {paymentType === "udhaar" && (
            <>
              <label>Kitna abhi mila (baaki udhaar mein)</label>
              <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} />
            </>
          )}

          <button className="btn" type="submit">
            Sale Save Karein
          </button>
        </form>
      </div>
    </div>
  );
}
