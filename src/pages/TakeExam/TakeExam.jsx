import React, { useEffect, useState, useRef } from "react";
import { api } from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
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
  const [writingText, setWritingText] = useState("");

  const timerRef = useRef(null);
  const answersRef = useRef({});
  const submittingRef = useRef(false);

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
          submit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [started, submitted]);

  /* ===== ANSWER HANDLER (ASOSIY NUQTA) ===== */
  const setAns = (questionId, value) => {
    answersRef.current[questionId] = value;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const QUESTION_TITLES = {
    listeningTF: "Listening — True / False",
    listeningGap: "Listening — Gap Fill",
    grammar: "Grammar",
    tense: "Tense Transformation",
    mcq: "Multiple Choice",
    truefalse: "True / False",
    gapfill: "Gap Fill",
  };  

  /* ===== SUBMIT (ENG TO‘G‘RI VARIANT) ===== */
  const submit = async (force = false) => {
    if (submitted || submittingRef.current) return;
  
    submittingRef.current = true;
  
    try {
      if (!studentName.trim()) {
        toast.error("Ismingizni kiriting");
        submittingRef.current = false;
        return;
      }
  
      const formattedAnswers = Object.entries(answersRef.current)
  .filter(([_, v]) => typeof v !== "object") // 🔴 MUHIM
  .map(([questionId, answer]) => ({
    questionId,
    answer: answer ?? "",
  }));

      const sentenceBuildAnswers = Object.entries(answersRef.current)
  .filter(([_, v]) => typeof v === "object")
  .map(([questionId, v]) => ({
    questionId,
    affirmative: v.affirmative || "",
    negative: v.negative || "",
    question: v.question || "",
  }));
  
      const res = await api.post("/results/submit", {
        examId: id,
        studentName,
        answers: formattedAnswers,
        sentenceBuildAnswers,
        writingText,
        autoSubmitted: force,
      });

      console.log("ANSWERS SENT:", formattedAnswers);
  
      setSubmitted(true);
      clearInterval(timerRef.current);
  
      setResult(res.data.result || res.data);
      setShowResultModal(true);
  
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Xatolik yuz berdi"
      );
    } finally {
      submittingRef.current = false;
    }
  };  

  if (!exam) {
    return (
      <div className="loader-wrapper">
        <ClipLoader color="#2d5bff" size={55}/>
        <p>Yuklanmoqda...</p>
      </div>
    )
  };

  return (
    <div className="take-container">
      {!started && (
        <div className="start-modal-overlay">
          <div className="start-modal">
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
            <h2 className="exam-title">{exam.title}</h2>
            <div className="timer">
              ⏰ {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
              {String(timeLeft % 60).padStart(2, "0")}
            </div>
          </div>

          {/* ===== LISTENING TF ===== */}
          {exam.listeningTF?.map((q, i) => (
  <section key={q._id} className="block">
    <span className="question-type">
      {QUESTION_TITLES.listeningTF}
    </span>

    <p className="question-text">
      {i + 1}. {q.statement || q.text}
    </p>

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
      <span className="question-type">{QUESTION_TITLES.listeningGap}</span>

    <p>{i + 1}. {q.sentence || q.text}</p>

    <input
      placeholder="Javobingiz"
      onChange={(e) => setAns(q._id, e.target.value)}
    />
  </section>
))}

          {/* ===== GRAMMAR ===== */}
          {exam.grammarQuestions?.map((q, i) => (
  <section key={q._id} className="block">
    <span className="question-type">
      {QUESTION_TITLES.grammar}
    </span>

    <p className="question-text">
      {i + 1}. {q.scrambledWords || q.question}
    </p>

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
    <span className="question-type">
      {QUESTION_TITLES[q.type]}
    </span>

    <p className="question-text">
      {i + 1}. {q.questionText || q.question || q.text}
    </p>

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
  <div className="question-block">
    <p className="question-text">{q.questionText}</p>

    <input
      type="text"
      className="answer-input"
      placeholder="Javobni yozing"
      onChange={(e) => setAns(q._id, e.target.value)}
    />
  </div>
)}

  </section>
))}

{exam.translateQuestions?.length > 0 && (
  <>
    <h3>Translate</h3>
    {exam.translateQuestions.map((q, i) => (
      <section key={q._id} className="block">
        <p>{i + 1}. {q.word}</p>
        <input
          onChange={(e) => setAns(q._id, e.target.value)}
        />
      </section>
    ))}
  </>
)}

{/* ===== SENTENCE BUILD ===== */}
{exam.sentenceBuildQuestions?.length > 0 && (
  <>
    <h3>Grammar — Sentence Build</h3>

    {exam.sentenceBuildQuestions.map((q, i) => (
      <section key={q._id} className="block sentence-build-student">

        <p className="question-text">
          {i + 1}. So‘zlardan gap tuzing:
        </p>

        <div className="word-box">
          {q.words.map((w, wi) => (
            <span key={wi} className="word-chip">{w} {wi !== q.words.length - 1 && " / "}</span>
          ))}
        </div>

        {/* AFFIRMATIVE */}
        <input
          placeholder="(+)"
          onChange={(e) =>
            setAns(q._id, {
              ...(answersRef.current[q._id] || {}),
              affirmative: e.target.value
            })
          }
        />

        {/* NEGATIVE */}
        <input
          placeholder="(-)"
          onChange={(e) =>
            setAns(q._id, {
              ...(answersRef.current[q._id] || {}),
              negative: e.target.value
            })
          }
        />

        {/* QUESTION */}
        <input
          placeholder="(?)"
          onChange={(e) =>
            setAns(q._id, {
              ...(answersRef.current[q._id] || {}),
              question: e.target.value
            })
          }
        />

      </section>
    ))}
  </>
)}

{exam.correctionQuestions?.length > 0 && (
  <>
    <h3>Correct the mistakes</h3>
    {exam.correctionQuestions.map((q, i) => (
      <section key={q._id} className="block">
        <p>{i + 1}. {q.wrongSentence}</p>
        <input
          onChange={(e) => setAns(q._id, e.target.value)}
        />
      </section>
    ))}
  </>
)}

{exam.completeQuestions?.length > 0 && (
  <>
    <h3>Complete</h3>
    {exam.completeQuestions.map((block) => (
      <section key={block._id} className="block">

        <div className="word-box complete-word-box">
        {Array.isArray(block.wordBank)
    ? block.wordBank.join(", ")
    : "—"}
        </div>

        {block.sentences.map((s) => (
          <div key={s._id}>
            <p>{s.text}</p>
            <input
              onChange={(e) => setAns(s._id, e.target.value)}
            />
          </div>
        ))}

      </section>
    ))}
  </>
)}
                    {/* ===== READING ===== */}
{exam.reading?.passage && (
  <section className="block">
    <h2>Reading</h2>

    <p><b>Topshiriq:</b> {exam.reading.instruction}</p>

    <div className="reading-passage">
      {exam.reading.passage}
    </div>

    {/* === TF / NOT GIVEN === */}
    {exam.reading.tfQuestions?.length > 0 && (
      <>
        <h3>True / False / Not Given</h3>

        {exam.reading.tfQuestions.map((q, i) => (
          <div key={i} className="reading-question">
            <p>{i + 1}. {q.statement}</p>

            <Select
              styles={customSelectStyles}
              options={[
                { value: "true", label: "True" },
                { value: "false", label: "False" },
                { value: "not_given", label: "Not Given" },
              ]}
              onChange={(e) =>
                setAns(q._id, e.value)
              }
            />
          </div>
        ))}
      </>
    )}

    {/* === GAP FILL === */}
    {exam.reading.gapQuestions?.length > 0 && (
      <>
        <h3>Gap Fill</h3>

        {exam.reading.gapQuestions.map((q, i) => (
          <div key={i} className="reading-question">
            <p>{i + 1}. {q.sentence}</p>

            <input
              placeholder="Javobingiz"
              onChange={(e) =>
                setAns(q._id, e.target.value)
              }
            />
          </div>
        ))}
      </>
    )}

    {/* ===== READING SHORT ANSWER (TO‘G‘RI) ===== */}
{exam.reading.shortAnswerQuestions?.length > 0 && (
  <>
    <h3>Short Answer</h3>

    {exam.reading.shortAnswerQuestions.map((q, i) => (
      <div key={q._id} className="short-answer-item">
        <p>{i + 1}. {q.question}</p>

        <textarea
          rows={3}
          placeholder="Javobingizni yozing..."
          onChange={(e) => setAns(q._id, e.target.value)}
        />
      </div>
    ))}
  </>
)}

{exam.reading?.translationQuestions?.length > 0 && (
  <>
    <h3>Translation</h3>

    {exam.reading.translationQuestions.map((q, i) => (
      <div key={q._id} className="reading-translate">
        <p><b>Translate:</b> {q.sentence}</p>

        <input
          placeholder="Tarjimani yozing"
          onChange={(e) => setAns(q._id, e.target.value)}
        />
      </div>
    ))}
  </>
)}

  </section>
)}

{/* ===== WRITING SECTION ===== */}
{exam?.writingTask?.title && (
  <div className="writing-section">
  <h3>Writing Task</h3>
  {exam.writingTask.title && <h4>{exam.writingTask.title}</h4> }

  {exam.writingTask.instruction && (
    <p>{exam.writingTask.instruction}</p>
  )}

  {exam.writingTask.maxWords && <p><b>Maximal words:</b> {exam.writingTask.maxWords}</p> }
  {exam.writingTask.minWords && <p><b>Minimal words:</b> {exam.writingTask.minWords}</p> }

  <textarea
    placeholder="Writing javobingizni shu yerga yozing..."
    value={writingText}
    onChange={(e) => setWritingText(e.target.value)}
    rows={8}
  />

  <p>
    So‘zlar soni: {writingText.trim().split(/\s+/).filter(Boolean).length}
  </p>
</div>
)}

          <button className="submit-btn" onClick={() => submit(false)}>
            Imtihonni yuborish
          </button>
        </>
      )}

      {showResultModal && result && (
        <div className="result-modal-overlay">
          <div className="result-modal">
            <h2>Natija</h2>

            <p>Ball: <b>{result.autoScore}</b></p>
            <p>Foiz: <b>{result.autoPercentage}%</b></p>

            {result.autoPercentage >= exam.passPercentage ? (
              <p style={{ color: "green", fontWeight: "bold", fontSize: 18 }}>
              O'tdingiz
              </p>
            ) : (
              <p style={{ color: "red", fontWeight: "bold", fontSize: 18 }}>
              Yiqildingiz
              </p>
            )}

            {exam?.writingTask && (
              <p style={{color: "orange"}}>
              Writing tekshirilmoqda. Natija keyin elon qilinadi.
            </p>
            )}

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
