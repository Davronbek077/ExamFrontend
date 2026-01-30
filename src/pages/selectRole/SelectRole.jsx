import React from "react";
import { useNavigate } from "react-router-dom";
import "./SelectRole.css";

export default function SelectRole() {
  const navigate = useNavigate();

  return (
    <div className="role-container">
      <h2>Kim sifatida kirmoqchisiz?</h2>

      <div className="role-cards">
        <div
          className="role-card teacher"
          onClick={() => navigate("/login/teacher")}
        >
          <h3>Examer</h3>
          <p>Imtihon yaratish va tekshirish</p>
        </div>

        <div
          className="role-card student"
          onClick={() => navigate("/login/student")}
        >
          <h3>Student</h3>
          <p>Imtihon topshirish</p>
        </div>
      </div>
    </div>
  );
}
