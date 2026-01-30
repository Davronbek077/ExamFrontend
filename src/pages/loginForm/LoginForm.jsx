import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./LoginForm.css";

export default function LoginForm({ setRole }) {
  const { role } = useParams(); // 👈 teacher yoki student
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (role === "teacher" && password === "2315") {
      setRole("teacher");
      navigate("/");
    } 
    else if (role === "student" && password === "1412") {
      setRole("student");
      navigate("/");
    } 
    else {
      toast.error("Parol noto‘g‘ri!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
      <h2>
        {role === "teacher" ? "Examer Login" : "Student Login"}
      </h2>

      <input
        type="password"
        placeholder="Parolni kiriting"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Kirish</button>
      </div>
    </div>
  );
}
