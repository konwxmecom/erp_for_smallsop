import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [shopName, setShopName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(shopName, name, email, password);
      setSuccess("Account ban gaya! Ab login karein.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration fail ho gaya.");
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-box">
        <h2>🏪 Naya Account Banayein</h2>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
        <form onSubmit={handleSubmit}>
          <label>Dukaan ka naam</label>
          <input value={shopName} onChange={(e) => setShopName(e.target.value)} required />
          <label>Aapka naam</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <button className="btn" type="submit" style={{ width: "100%" }}>
            Register
          </button>
        </form>
        <p style={{ marginTop: 14 }}>
          Pehle se account hai? <Link to="/login">Login karein</Link>
        </p>
      </div>
    </div>
  );
}
