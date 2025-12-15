import React, { useEffect, useState, useRef } from "react";
import { api } from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import "./TakeExam.css";

/* ===== SELECT STYLES ===== */
const customSelectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: 8,
    minHeight: 42,
  }),
};

/* ===== QUESTION TITLES ===== */
const getQuestionTitle = (type) => {
  switch (type) {
    case "mcq":
      return "Multiple Choice Question";
    case "truefalse":
      return "True / False Question";
    case "gapfill":
      return "Fill in the Blank";
    default:
      return "Question";
  }
};

export default function takeExam() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);

  const timerRef = useRef(null);

  /* ===== LOAD EXAM ===== */
  useEffect(() => {
    api.get(`/exams/${id}`).then((res) => {
      setExam(res.data);
      setTimeLeft(res.data.timeLimit * 60); // minutes → seconds
    });
  }, [id]);

  /* ===== TIMER ===== */
  useEffect(() => {
    if (!started) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [started]);

  /* ===== ANSWERS ===== */
  const setAns = (qid, value) => {
    setAnswers((prev) => {
      const copy = [...prev];
      const found = copy.find(a => a.questionId === qid);
  
      if (found) {
        found.answer = value;
      } else {
        copy.push({
          questionId: qid,
          answer: value
        });
      }
      return copy;
    });
  };
  
  /* ===== SUBMIT ===== */
  async function submit() {
    console.log("SUBMIT PAYLOAD:", {
      examId: id,
      answers
    });
  
    try {
      const res = await api.post("/results/submit", {
        examId: id,
        answers,
      });
  
      alert(
        `Natija: ${res.data.result.score} ball\n` +
        `Foiz: ${res.data.result.percentage}%\n` +
        (res.data.result.passed ? "✅ O‘tdingiz" : "❌ O‘tmadingiz")
      );
    } catch (e) {
      console.error("SUBMIT ERROR:", e.response?.data || e);
      alert("Xatolik yuz berdi");
    }
  }
  

  const autoSubmit = async () => {
    alert("⏰ Vaqtingiz tugadi! Imtihon avtomatik yuborildi.");
    await submit();
  };

  if (!exam) return <p>Yuklanmoqda...</p>;

  /* ===== RESULT VIEW ===== */
  if (result) {
    return (
      <div className="result-box">
        <h2>📊 Natija</h2>
        <p><b>Ball:</b> {result.score}</p>
        <p><b>Foiz:</b> {result.percentage}%</p>
        <h3 className={result.passed ? "pass" : "fail"}>
          {result.passed ? "✅ O‘tdingiz" : "❌ O‘ta olmadingiz"}
        </h3>

        <button onClick={() => navigate("/")}>Bosh sahifa</button>
      </div>
    );
  }

  return (
    <div className="take-container">

      {/* ===== MODAL ===== */}
      {!started && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Imtihonni boshlashga tayyormisiz?</h2>
            <p>⏱ Vaqt: {exam.timeLimit} daqiqa</p>

            <div className="modal-actions">
              <button className="btn-start" onClick={() => setStarted(true)}>
                Tayyorman
              </button>
              <button className="btn-cancel" onClick={() => navigate("/")}>
                Tayyor emasman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== HEADER ===== */}
      {started && (
        <>
          <div className="exam-header">
            <h2>{exam.title}</h2>
            <div className="timer">
              ⏰ {Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, "0")}
              :
              {(timeLeft % 60).toString().padStart(2, "0")}
            </div>
          </div>

          {/* ===== LISTENING TF ===== */}
          {exam.listeningTF?.length > 0 && (
            <section className="block">
              <h3>Listening – True / False</h3>
              {exam.listeningTF.map((q) => (
  <div key={q._id} className="question-box">
    <p>{q.statement}</p>

    <Select
      styles={customSelectStyles}
      options={[
        { value: "true", label: "True" },
        { value: "false", label: "False" },
      ]}
      onChange={(e) => setAns(q._id, e.value)}
    />
  </div>
))}

            </section>
          )}

          {/* ===== LISTENING GAP ===== */}
          {exam.listeningGaps?.length > 0 && (
            <section className="block">
              <h3>Listening – Gap Fill</h3>
              {exam.listeningGaps.map((q) => (
  <div key={q._id} className="question-box">
    <p>{q.sentence}</p>

    <input
      type="text"
      onChange={(e) => setAns(q._id, e.target.value)}
    />
  </div>
))}

            </section>
          )}

          {/* ===== GRAMMAR ===== */}
          {exam.grammarQuestions?.length > 0 && (
            <section className="block">
              <h3>Grammar – Word Ordering</h3>
              {exam.grammarQuestions.map((q, i) => (
  <div key={q._id} className="question-box">
    <b>{q.scrambledWords}</b>

    <input
      type="text"
      placeholder="To‘g‘ri gapni yozing"
      onChange={(e) => setAns(q._id, e.target.value)}
    />
  </div>
))}
            </section>
          )}

          {/* ===== TENSE ===== */}
          {exam.tenseTransforms?.length > 0 && (
            <section className="block">
              <h3>Tense Transformation</h3>
              {exam.tenseTransforms.map((t) => (
  <div key={t._id} className="question-box">
    <p><b>{t.baseSentence}</b></p>

    {t.transforms.map((tr) => (
      <div key={tr._id}>
        <p>{tr.tense}</p>
        <input
          type="text"
          placeholder="To‘g‘ri gapni yozing"
          onChange={(e) =>
            setAns(tr._id, e.target.value)
          }
        />
      </div>
    ))}
  </div>
))}

            </section>
          )}

          {/* ===== BASIC QUESTIONS ===== */}
          {exam.questions.map((q, i) => (
            <section key={q._id} className="block">
              <h3>{i + 1}. {getQuestionTitle(q.type)}</h3>
              <p>{q.questionText}</p>

              {q.type === "mcq" && (
                <Select
                  styles={customSelectStyles}
                  options={q.options.map((o) => ({
                    value: o,
                    label: o,
                  }))}
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
                <input
                  type="text"
                  onChange={(e) => setAns(q._id, e.target.value)}
                />
              )}
            </section>
          ))}

          <button className="submit-btn" onClick={submit}>
            Imtihonni yuborish
          </button>
        </>
      )}
    </div>
  );
}
