import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { ClipLoader } from "react-spinners";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { toast } from "react-toastify";
import "./TeacherPanel.css";

export default function WritingCheck() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [score, setScore] = useState("");

  useEffect(() => {
    api.get(`/results/writings/${id}`).then(res => {
      setResult(res.data);
    });
  }, [id]);

  if (!result) {
    return (
      <div className="loader-wrapper">
        <ClipLoader color="#2d5bff" size={55}/>
        <p>Yuklanmoqda...</p>
      </div>
    )
  };

  const writingTask = result.examId?.writingTask;

  const wordCount = result.writing.text.trim().split(/\s+/).filter(Boolean).length;

  const submitScore = async () => {
    await api.post(`/results/check-writing/${id}`, {
      writingScore: Number(score)
    });

    toast.success("Writing baholandi");
    navigate("/teacher/writings");
  };

  return (
    <div className="writing-check">
      <button className="back-btn" onClick={() => navigate(-1)}>
      <MdOutlineKeyboardBackspace className="back-icon" /> Back
      </button>
      <h2>Writing tekshirish</h2>

      <p><b>O‘quvchi:</b> {result.studentName}</p>
      <p><b>Imtihon:</b> {result.examId?.title}</p>

      <p>
        <b>Mavzu:</b> {writingTask?.title || "—"}
      </p>

      <p>
      <b>So‘zlar soni:</b> {wordCount}
     </p>

      <p>
        <b>Minimal so'zlar:</b> {writingTask?.minWords ?? "—"} <br />
      </p>

      <p>
        <b>Maksimal so'zlar:</b> {writingTask?.maxWords ?? "—"}
      </p>

      <textarea
        readOnly
        value={result.writing.text}
        rows={10}
      />

      <input
        type="number"
        placeholder={`0 - ${writingTask?.points ?? 0}`}
        value={score}
        onChange={e => setScore(e.target.value)}
      />

      <button className="writingCheck-btn" onClick={submitScore}>
        Tasdiqlash
      </button>
    </div>
  );
}
