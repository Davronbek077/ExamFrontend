import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import "./StudentPanel.css";

export default function StudentPanel() {
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  // LEVEL LARNI OLISH
  useEffect(() => {
    api.get("/exams/levels").then(res => {
      setLevels(res.data);
    });
  }, []);

  // LEVEL BO‘YICHA EXAM
  const fetchExamsByLevel = async (level) => {
    setSelectedLevel(level);
    const res = await api.get(`/exams/by-level/${level}`);
    setExams(res.data);
  };

  const goBackToLevels = () => {
    setSelectedLevel(null);
    setExams([]);
  };

  return (
    <div className="student-container">
      <h2>Student Panel</h2>

      {/* LEVELS */}
      {!selectedLevel && (
        <>
        <h3 className="select-level-title">
          Select exam level
        </h3>
        <div className="levels">
          {levels.map((level) => (
            <button key={level} onClick={() => fetchExamsByLevel(level)}>
              {level}
            </button>
          ))}
        </div>
        </>
      )}
      
      {/* EXAMS */}
      {selectedLevel && (
        <div className="exam-section">
          <button className="back-btn" onClick={goBackToLevels}>
            Back
          </button>
          <h3 className="student-exam-title">
            {selectedLevel} imtihonlari
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
      )}
    </div>
  );
}
