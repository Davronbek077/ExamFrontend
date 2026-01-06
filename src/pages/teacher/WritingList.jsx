import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import "./TeacherPanel.css";

export default function WritingList() {
  const [writings, setWritings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/results/writings").then(res => {
      setWritings(res.data);
    });
  }, []);

  return (
    <div className="writing-list">
      <button className="back-btn" onClick={() => navigate(-1)}>
      <MdOutlineKeyboardBackspace className="back-icon" /> Back
      </button>
      <h2>Writinglar</h2>

      {writings.map(w => (
        <div
          key={w._id}
          className="writing-card"
          onClick={() => navigate(`/teacher/writings/${w._id}`)}
        >
          <h4>{w.studentName}</h4>
          <p>Imtihon: {w.examId.title}</p>

          {!w.writing.checked && (
            <span className="badge pending">Tekshirilmoqda ⏳</span>
          )}

          {w.writing.checked && (
            <span className="badge checked">Tekshirildi ✅</span>
          )}
        </div>
      ))}
    </div>
  );
}
