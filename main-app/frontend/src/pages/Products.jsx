import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    name: "",
    group: "",
    gstPercent: 0,
    hsnCode: "",
    unit: "pcs",
    purchasePrice: 0,
    salePrice: 0,
    stockQty: 0,
    lowStockThreshold: 5,
  });
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState("");

  function loadData() {
    api.get("/api/products").then((res) => setProducts(res.data.products));
    api.get("/api/groups").then((res) => setGroups(res.data.groups));
  }

  useEffect(loadData, []);

  async function handleAddGroup() {
    if (!newGroupName.trim()) return;
    const res = await api.post("/api/groups", { name: newGroupName });
    setGroups([...groups, res.data.group]);
    setForm({ ...form, group: res.data.group._id });
    setNewGroupName("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/products", form);
      setForm({ ...form, name: "", hsnCode: "", stockQty: 0 });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Product add nahi hua.");
    }
  }

  return (
    <div>
      <h1>📦 Products &amp; Groups</h1>

      <div className="card">
        <h3>Naya Product Add Karein</h3>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Product Naam</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

          <label>Group</label>
          <div className="item-row">
            <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
              <option value="">-- Group chunein --</option>
              {groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Ya naya group naam"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button type="button" className="btn btn-secondary" onClick={handleAddGroup}>
              + Add
            </button>
          </div>

          <label>GST %</label>
          <input
            type="number"
            value={form.gstPercent}
            onChange={(e) => setForm({ ...form, gstPercent: Number(e.target.value) })}
          />

          <label>HSN Code</label>
          <input value={form.hsnCode} onChange={(e) => setForm({ ...form, hsnCode: e.target.value })} />

          <label>Unit (pcs / kg / litre)</label>
          <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />

          <label>Purchase Price</label>
          <input
            type="number"
            value={form.purchasePrice}
            onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
          />

          <label>Sale Price</label>
          <input
            type="number"
            value={form.salePrice}
            onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })}
          />

          <label>Starting Stock</label>
          <input
            type="number"
            value={form.stockQty}
            onChange={(e) => setForm({ ...form, stockQty: Number(e.target.value) })}
          />

          <label>Low Stock Alert kab dikhaye (threshold)</label>
          <input
            type="number"
            value={form.lowStockThreshold}
            onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
          />

          <button className="btn" type="submit">
            Product Save Karein
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Sabhi Products</h3>
        <table>
          <thead>
            <tr>
              <th>Naam</th>
              <th>Group</th>
              <th>Stock</th>
              <th>GST%</th>
              <th>Sale Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.group?.name || "-"}</td>
                <td style={{ color: p.stockQty <= p.lowStockThreshold ? "#c0392b" : "inherit" }}>
                  {p.stockQty} {p.unit}
                </td>
                <td>{p.gstPercent}%</td>
                <td>₹{p.salePrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
