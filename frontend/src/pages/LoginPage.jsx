import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@appolice.local");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      setError("");
      await login(email, password);
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="login-container">
      <form className="card" onSubmit={onSubmit}>
        <h1>Police Hierarchy Login</h1>
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
