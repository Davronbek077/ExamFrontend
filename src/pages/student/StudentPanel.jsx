import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import "./StudentPanel.css";

export default function StudentPanel() {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllExams = async () => {
      try {
        const res = await api.get("/exams/all");
        setExams(res.data);
      } catch (err) {
        console.error("Imtihonlarni olishda xatolik:", err);
      }
    };
    fetchAllExams()
  }, []);

  return (
    <div className="student-container">
      <h2>Student Panel</h2>
      
      <div className="exam-section">
          <button className="back-btn" onClick={() => navigate(-1)}>
      <MdOutlineKeyboardBackspace className="back-icon" /> Back
      </button>
          <h3 className="student-exam-title">
             Barcha imtihonlar
          </h3>

          <div className="exam-list student-exam-list">
            {exams.length === 0 && <p>Imtihon yo'q</p>}

            {exams.map((exam) => (
              <div className="exam-card" key={exam._id}>
                <h4>{exam.title}</h4>
                <button onClick={() => navigate(`/take/${exam._id}`)}>
                  Boshlash
                </button>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
