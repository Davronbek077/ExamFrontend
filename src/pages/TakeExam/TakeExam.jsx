import React, { useEffect, useState, useRef } from "react";
import { api } from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import "./TakeExam.css";

/* ===== SELECT STYLE ===== */
const customSelectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: 8,
    minHeight: 42,
  }),
};

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [studentName, setStudentName] = useState("");

  const timerRef = useRef(null);

  /* ===== LOAD EXAM ===== */
  useEffect(() => {
    api.get(`/exams/${id}`).then((res) => {
      setExam(res.data);
      setTimeLeft(res.data.timeLimit * 60);
    });
  }, [id]);

  /* ===== TIMER ===== */
  useEffect(() => {
    if (!started || submitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [started, submitted]);

  /* ===== ANSWER HANDLER (ASOSIY NUQTA) ===== */
  const setAns = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  /* ===== SUBMIT (ENG TO‘G‘RI VARIANT) ===== */
  const submit = async () => {
    if (submitted) return;
    setSubmitted(true);

    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer: answer ?? "",
        })
      );

      const res = await api.post("/results/submit", {
        examId: id,
        studentName,
        answers: formattedAnswers,
      });

      clearInterval(timerRef.current);
      setResult(res.data.result || res.data);
      setShowResultModal(true);
      
    } catch (err) {
      console.error("SUBMIT ERROR FULL:", err);
      console.error("SERVER RESPONSE:", err.response?.data);
      alert(err.response?.data?.message || err.response?.data?.error || "Xatolik yuz berdi");
    }
  };

  if (!exam) return <p>Yuklanmoqda...</p>;

  return (
    <div className="take-container">
      {!started && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Imtihonni boshlaysizmi?</h2>
            <p>Vaqt: {exam.timeLimit} daqiqa</p>

            <input type="text" 
            placeholder="Ismingizni kiriting"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="name-input"/>

            <div className="modal-overlay-buttons">
              <button onClick={() => {
                if (!studentName.trim()) {
                  toast.error("Iltimos, Ismingizni kiriting");
                  return
                }
                setStarted(true);
              }}>Boshlash</button>
            <button onClick={() => navigate("/")}>Bekor qilish</button>
            </div>
          </div>
        </div>
      )}

      {started && (
        <>
          <div className="exam-header">
            <h2>{exam.title}</h2>
            <div className="timer">
              ⏰ {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
              {String(timeLeft % 60).padStart(2, "0")}
            </div>
          </div>

          {/* ===== LISTENING TF ===== */}
          {exam.listeningTF?.map((q, i) => (
            <section key={q._id} className="block">
              <h3>Listening TF {i + 1}</h3>
              <p>{q.statement || q.text}</p>
              <Select
                styles={customSelectStyles}
                options={[
                  { value: "true", label: "True" },
                  { value: "false", label: "False" },
                ]}
                onChange={(e) => setAns(q._id, e.value)}
              />
            </section>
          ))}

          {/* ===== LISTENING GAP ===== */}
          {exam.listeningGaps?.map((q, i) => (
            <section key={q._id} className="block">
              <h3>Listening Gap {i + 1}</h3>
              <p>{q.sentence || q.text}</p>
              <input onChange={(e) => setAns(q._id, e.target.value)} />
            </section>
          ))}

          {/* ===== GRAMMAR ===== */}
          {exam.grammarQuestions?.map((q, i) => (
            <section key={q._id} className="block">
              <h3>Grammar {i + 1}</h3>
              <p>{q.scrambledWords || q.question}</p>
              <input onChange={(e) => setAns(q._id, e.target.value)} />
            </section>
          ))}

          {/* ===== TENSE (ENG MUHIM JOY) ===== */}
          {exam.tenseTransforms?.map((t, i) => (
            <section key={t._id} className="block">
              <h3>Tense {i + 1}</h3>
              <p>{t.baseSentence}</p>

              {t.transforms.map((tr) => (
                <input
                  key={tr._id}
                  placeholder={tr.tense}
                  onChange={(e) => setAns(tr._id, e.target.value)}
                />
              ))}
            </section>
          ))}

          {/* ===== BASIC QUESTIONS ===== */}
          {exam.questions?.map((q, i) => (
            <section key={q._id} className="block">
              <h3>{i + 1}. {q.questionText || q.question || q.text}</h3>

              {q.type === "mcq" && (
                <Select
                  styles={customSelectStyles}
                  options={q.options.map((o) => ({ value: o, label: o }))}
                  onChange={(e) => setAns(q._id, e.value)}
                />
              )}

              {q.type === "truefalse" && (
                <Select
                  styles={customSelectStyles}
                  options={[
                    { value: "true", label: "True" },
                    { value: "false", label: "False" },
                  ]}
                  onChange={(e) => setAns(q._id, e.value)}
                />
              )}

              {q.type === "gapfill" && (
                <input onChange={(e) => setAns(q._id, e.target.value)} />
              )}
            </section>
          ))}

          <button className="submit-btn" onClick={submit}>
            Imtihonni yuborish
          </button>
        </>
      )}

      {showResultModal && result && (
        <div className="result-modal-overlay">
          <div className="result-modal">
            <h2>Natija</h2>

            <p><b>Ball:</b> {result.score}</p>
            <p><b>O'tish foizi</b> {result.percentage}%</p>

            <h3 className={result.passed ? "pass" : "fail"}>
              {result.passed ? "O'tdingiz!" : "O'tmadingiz!"}
            </h3>

            <div className="modal-actions">
              <button onClick={() => navigate("/")}>
                Bosh Sahifa
              </button>

              <button className="secondary" onClick={() => setShowResultModal(false)}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
