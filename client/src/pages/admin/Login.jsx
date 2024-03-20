import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { notification } from "antd";
import "../../css/adminlogin.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/admins/login", {
        email: email,
        password: password,
      });

      const data = response.data;

      localStorage.setItem("currentUser", JSON.stringify(data));

      console.log(data);
      navigate("/admin-terminal");
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.response.data.message,
        placement: "topRight",
      });
    }
  };

  return (
    <div className="wrapper signIn">
      <div className="form">
        <div className="heading">LOGIN</div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
