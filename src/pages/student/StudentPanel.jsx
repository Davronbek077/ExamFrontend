import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import "./StudentPanel.css"

export default function StudentPanel() {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      const res = await api.get("/exams/all");
      setExams(res.data);
    };
    fetchExams();
  }, []);

  return (
    <div className="student-container">
      <h2>Student Panel</h2>
      <h3>Imtihonlar ro‘yxati</h3>
      <ul>
        {exams.map((e) => (
          <li key={e._id}>
            {e.title} - <button onClick={() => navigate(`/take/${e._id}`)}>Boshlash</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
