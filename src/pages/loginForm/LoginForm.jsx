import React, { useState } from "react";
import "./LoginForm.css"

export default function LoginForm({ setRole }) {
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "2315") setRole("teacher");
    else if (password === "1412") setRole("student");
    else alert("Noto‘g‘ri parol!");
  };

  return (
    <div className="login-container"
    style={{
      display: "grid",
      placeItems:"center",
      marginTop: 150,
    }}>
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
