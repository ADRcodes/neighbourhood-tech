import React from "react";
import "./Unauthenticated.css";
import NetworkingStock from "../assets/NetworkingStock.jpg";
import NTlogo from "../assets/NTlogo.png";

const Unauthenticated = () => {
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
          <input type="text" placeholder="Username" className="input-field" />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
          />

          <button className="auth-button login-button">Log In</button>
          <button className="auth-button register-button">Register</button>
        </div>
      </div>
    </div>
  );
};

export default Unauthenticated;
