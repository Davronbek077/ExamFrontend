import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./LoginForm.css";

export default function LoginForm({ setRole }) {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === "2315") {
      setRole("teacher");
      navigate("/");
    }
    else if (password === "1412") {
      setRole("student");
      navigate("/");
    }
    else {
      toast.error("Parol noto'g'ri!");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <input
        type="password"
        placeholder="Parolni kiriting"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Kirish</button>
    </div>
  );
}
