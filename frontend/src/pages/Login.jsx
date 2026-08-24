import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("manufacturer");

  const handleLogin = (e) => {
    e.preventDefault();

    navigate(`/${role}`);
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <h1>SupplyChain</h1>
          <p>Intelligent Supply Chain Resilience</p>
        </div>

        <form onSubmit={handleLogin}>

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            required
          />

          <label>Login as</label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="manufacturer">Manufacturer</option>
            <option value="distributor">Distributor</option>
            <option value="transporter">Transporter</option>
            <option value="retailer">Retailer</option>
          </select>

          <button type="submit">
            Login
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;