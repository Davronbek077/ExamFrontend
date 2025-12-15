import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function ExamsList() {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/exams/all").then(res => setExams(res.data));
  }, []);

  return (
    <div className="teacher-container">
      <h2>Imtihonlar ro‘yxati</h2>

      <ul>
        {exams.map(exam => (
          <li key={exam._id}>
            <span
              className="exam-link"
              onClick={() => navigate(`/exam/${exam._id}`)}
            >
              {exam.title}
            </span>

            <button onClick={() => navigate(`/stats/${exam._id}`)}>
              Statistika
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
