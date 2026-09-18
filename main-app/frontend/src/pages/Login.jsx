import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login fail ho gaya.");
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-box">
        <h2>🏪 Dukaan ERP Login</h2>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn" type="submit" style={{ width: "100%" }}>
            Login
          </button>
        </form>
        <p style={{ marginTop: 14 }}>
          Naya account? <Link to="/register">Register karein</Link>
        </p>
      </div>
    </div>
  );
}
