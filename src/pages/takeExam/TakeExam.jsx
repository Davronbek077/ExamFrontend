import React, { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useParams } from "react-router-dom";
import Select from "react-select";

// ===== UNIVERSAL SELECT STYLES =====
const customSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#f1f1f1",
    borderRadius: "8px",
    padding: "4px",
    borderColor: "#ccc",
    minHeight: "45px",
    boxShadow: "none",
    ":hover": { borderColor: "#888" },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    backgroundColor: "#fff",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#e6e6e6" : "#fff",
    color: "#000",
    cursor: "pointer",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#000",
  }),
};

export default function TakeExam() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exams/${id}`);
        setExam(res.data);
      } catch (error) {
        console.log("Exam load error:", error);
      }
    };
    fetchExam();
  }, [id]);

  function setAns(qid, value) {
    const list = [...answers];
    const f = list.find((a) => a.qid === qid);

    if (f) f.answer = value;
    else list.push({ qid, answer: value });

    setAnswers(list);
  }

  async function submit() {
    try {
      const res = await api.post("/results/submit", {
        examId: id,
        answers,
      });

      alert("Natija: " + res.data.result.score + " ball");
    } catch (e) {
      alert("Xatolik: " + e.response?.data?.message);
    }
  }

  if (!exam) return <p>Yuklanmoqda...</p>;

  return (
    <div className="take-container">
      <h2>{exam.title}</h2>

      {/* === AUDIO === */}
      {exam.listeningAudio && (
        <audio
          controls
          style={{ marginTop: "20px" }}
          src={`https://studentbackend-snw0.onrender.com/${exam.listeningAudio}`}
        />
      )}

      {/* LISTENING TRUE/FALSE */}
      {exam.listeningTF?.length > 0 && (
        <div className="block">
          <h3>Listening – True/False</h3>

          {exam.listeningTF.map((item, i) => (
            <div key={i} className="question-box">
              <p>{item.statement}</p>

              <Select
                styles={customSelectStyles}
                placeholder="Tanlang"
                options={[
                  { value: "true", label: "True" },
                  { value: "false", label: "False" },
                ]}
                onChange={(e) => setAns("ltf" + i, e.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* LISTENING GAPFILL */}
      {exam.listeningGaps?.length > 0 && (
        <div className="block">
          <h3>Listening – Gapfill</h3>

          {exam.listeningGaps.map((item, i) => (
            <div key={i} className="question-box">
              <p>{item.sentence}</p>

              <input
                type="text"
                placeholder="Javobni kiriting"
                onChange={(e) => setAns("lgap" + i, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* BASIC QUESTIONS */}
      {exam.questions.map((q) => (
        <div key={q._id} className="question-box">
          <h4>{q.questionText}</h4>

          {/* MCQ */}
          {q.type === "mcq" && (
            <Select
              styles={customSelectStyles}
              placeholder="Variantni tanlang"
              options={q.options.map((op) => ({
                value: op,
                label: op,
              }))}
              onChange={(e) => setAns(q._id, e.value)}
            />
          )}

          {/* TRUE/FALSE */}
          {q.type === "truefalse" && (
            <Select
              styles={customSelectStyles}
              placeholder="Tanlang"
              options={[
                { value: "true", label: "True" },
                { value: "false", label: "False" },
              ]}
              onChange={(e) => setAns(q._id, e.value)}
            />
          )}

          {/* GAPFILL */}
          {q.type === "gapfill" && (
            <input
              type="text"
              placeholder="Javobni yozing"
              onChange={(e) => setAns(q._id, e.target.value)}
            />
          )}
        </div>
      ))}

      <button className="submit-btn" onClick={submit}>
        Imtihonni Yuborish
      </button>
    </div>
  );
}
