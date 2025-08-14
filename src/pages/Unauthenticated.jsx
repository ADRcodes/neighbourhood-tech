import React, { useState } from "react";
import "./Unauthenticated.css";
import NetworkingStock from "../assets/NetworkingStock.jpg";
import NTlogo from "../assets/NTlogo.png";
import { useNavigate } from "react-router-dom";

const Unauthenticated = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const msg = await response.text();
        alert(msg || "Login failed");
        return;
      }

      const user = await response.json();
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userName", user.name || "");

      alert(`Welcome, ${user.name || "user"}!`);

      navigate("/"); // Redirect to home after login
    } catch (err) {
      console.error("Login error:", err);
      alert("Login error");
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const msg = await response.text();
        alert(msg || "Registration failed");
        return;
      }

      const user = await response.json();
      alert(`Registration successful! Welcome, ${user.name}!`);
      setFormData({ name: "", email: "", password: "" });
      setIsRegistering(false);
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="phone-frame tiled-background">
      <div className="unauth-container">
        <h1 className="text-[28px] font-bold text-[#3F72FF] drop-shadow-md text-center mb-10">
          Neighbourhood Tech
        </h1>

        <img
          src={NetworkingStock}
          alt="Networking meeting"
          className="banner-image"
        />

        <div className="form-section">
          {isRegistering && (
            <input
              type="text"
              name="name"
              placeholder="Enter desired username"
              className="input-field"
              value={formData.name}
              onChange={handleChange}
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input-field"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input-field"
            value={formData.password}
            onChange={handleChange}
          />

          {isRegistering ? (
            <>
              <button
                className="auth-button register-button"
                onClick={handleRegister}
              >
                Register
              </button>
              <button
                className="auth-button login-button px-3 py-1 text-sm !px-3 !py-1 !text-sm"
                onClick={() => setIsRegistering(false)}
              >
                Back to Login
              </button>
            </>
          ) : (
            <>
              <button
                className="auth-button login-button"
                onClick={handleLogin}
              >
                Log In
              </button>
              <button
                className="auth-button register-button"
                onClick={() => setIsRegistering(true)}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthenticated;
