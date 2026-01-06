
import React, { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import "./TeacherPanel.css";

export default function TeacherPanel() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchExams();
    fetchStats();
  }, []);

  const fetchExams = async () => {
    const res = await api.get("/exams/all");
    setExams(res.data);
  };

  const fetchStats = async (examId) => {
    const res = await api.get(`/results/stats`);
    setStats(res.data);
  };

  return (
    <div className="admin-dashboard">
      <h2 className="adminDashboard-title">Admin Dashboard</h2>
  
  {/* STATISTICS */}
  <div className="stats-grid">
    <div className="stat-card info">
      <h4>Jami topshirganlar</h4>
      <p>{stats?.total || 0}</p>
    </div>

    <div className="stat-card success">
      <h4>O‘tganlar</h4>
      <p>{stats?.passed || 0}</p>
    </div>

    <div className="stat-card danger">
      <h4>Yiqilganlar</h4>
      <p>{stats?.failed || 0}</p>
    </div>

    <div className="stat-card info">
      <h4>Bugun topshirganlar</h4>
      <p>{stats?.today || 0}</p>
    </div>
  </div>

  {/* QUICK MENU */}
  <div className="quick-menu">
    <h3>Tezkor menyu</h3>

    <div className="menu-buttons">
      <button onClick={() => navigate("/teacher/create")}>
        Imtihon qo‘shish
      </button>

      <button onClick={() => navigate("/teacher/exams")}>
        Imtihonlar ro‘yxati
      </button>

      <button onClick={() => navigate("/teacher/writings")}>
        Writing tekshirish
      </button>
    </div>
  </div>
    </div>
  );
  
}
