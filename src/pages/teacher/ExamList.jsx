import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import "./TeacherPanel.css";

export default function ExamsList() {
  const [exams, setExams] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteExamId, setDeleteExamId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = () => {
    api.get("/exams/all").then(res => setExams(res.data));
  };

  const deleteExam = async (id) => {
    if (!window.confirm("Bu imtihonni o'chirmoqcbimisiz?")) return;

    await api.delete(`/exams/${id}`);
    setExams(prev => prev.filter(e => e._id !== id));
  }

  return (
    <div className="teacher-container">
      <h2>Imtihonlar ro‘yxati</h2>

      <ul className="exam-list">
        {exams.map(exam => (
          <li key={exam._id} className="exam-item">
            
            {/* IMTIHON NOMI */}
            <span
              className="exam-title"
              onClick={() => navigate(`/exam/${exam._id}`)}
            >
              {exam.title}
            </span>

            {/* ACTIONS */}
            <div className="exam-actions">
              <button
                className="statistic-btn"
                onClick={() => navigate(`/stats/${exam._id}`)}
              >
                Statistika
              </button>

              <button
                className="menu-btn"
                onClick={() =>
                  setOpenMenuId(openMenuId === exam._id ? null : exam._id)
                }
              >
                ⋮
              </button>

              {openMenuId === exam._id && (
                <div className="dropdown">
                  <button onClick={() => navigate(`/exams/edit/${exam._id}`)}>
                    Tahrirlash
                  </button>
                  <button
                    className="danger"
                    onClick={() => deleteExam(exam._id)}
                  >
                    O‘chirish
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
