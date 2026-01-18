import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/api";
import { FaHeadphones } from "react-icons/fa6";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import "./ExamDetail.css";

export default function ExamDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [exam, setExam] = useState(null);

  useEffect(() => {
    api.get(`/exams/${id}`).then(res => {
      console.log("FULL EXAM:", res.data);
      console.log("READING RAW:", res.data.reading);
      setExam(res.data);
    });
  }, [id]);  

  useEffect(() => {
    api.get(`/exams/${id}`).then(res => setExam(res.data));
  }, [id]);

  if (!exam) {
    return (
      <div className="loader-wrapper">
        <ClipLoader color="#2d5bff" size={55}/>
        <p>Yuklanmoqda...</p>
      </div>
    )
  };

  const reading = Array.isArray(exam.reading)
  ? exam.reading[0]
  : exam.reading || null;


  return (
    <div className="exam-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>
      <MdOutlineKeyboardBackspace className="back-icon" /> Back
      </button>
      <h2>{exam.title}</h2>
      <p>Vaqt limiti: {exam.timeLimit} daqiqa</p>
      <p>O‘tish foizi: {exam.passPercentage}%</p>

      <hr />

      <h3><FaRegCircleQuestion /> Test Savollar</h3>

      {exam.questions.map((q, i) => (
        <div key={i} className="question-card">
          <p><b>{i + 1}) {q.questionText}</b></p>

          {q.type === "mcq" && (
            <ul>
              {q.options.map((opt, oi) => (
                <li key={oi}>{opt}</li>
              ))}
            </ul>
          )}

          {q.type === "truefalse" && <p>Answer: True / False</p>}
          {q.type === "gapfill" && <p>Bo‘sh joyni to‘ldiring</p>}

          <p className="correct">✔ To‘g‘ri javob: {q.correctAnswer}</p>
        </div>
      ))}

      <hr />

      {exam.listeningTF?.length > 0 && (
        <>
          <h3><FaHeadphones /> Listening — True / False</h3>
          {exam.listeningTF.map((q, i) => (
            <div key={i} className="question-card">
              <p><b>{q.statement}</b></p>
              <p className="correct">✔ {q.correct ? "True" : "False"}</p>
            </div>
          ))}
        </>
      )}

      {exam.listeningGaps?.length > 0 && (
        <>
          <h3><FaHeadphones /> Listening — Gap Filling</h3>
          {exam.listeningGaps.map((q, i) => (
            <div key={i} className="question-card">
              <p>{q.sentence}</p>
              <p className="correct">✔ {q.correctWord}</p>
            </div>
          ))}
        </>
      )}

      {exam.grammarQuestions?.length > 0 && (
        <>
          <h3>Grammar — Word Ordering</h3>
          {exam.grammarQuestions.map((q, i) => (
            <div key={i} className="question-card">
              <p>Aralash gap: <b>{q.scrambledWords}</b></p>
              <p className="correct">✔ {q.correctSentence}</p>
            </div>
          ))}
        </>
      )}

      {exam.tenseTransforms?.length > 0 && (
        <>
          <h3>⌛️ Tense Transformation</h3>
          {exam.tenseTransforms.map((t, i) => (
            <div key={i} className="question-card">
              <p><b>Asosiy gap:</b> {t.baseSentence}</p>

              {t.transforms.map((tr, j) => (
                <p key={j}>
                  <b>{tr.tense}:</b> {tr.correctSentence}
                </p>
              ))}
            </div>
          ))}
        </>
      )}

{exam.completeQuestions?.length > 0 && (
  <>
    <hr />
    <h3>🧩 Complete (Word Box)</h3>

    {exam.completeQuestions.map((block, i) => (
      <div key={i} className="question-card">
        <p><b>Word box:</b></p>
        <div className="word-box">
        <p><b>Keywords: </b>
        {Array.isArray(block.wordBank)
    ? block.wordBank.join(", ")
    : "—"}</p>
        </div>

        {block.sentences.map((s, j) => (
          <div key={j} className="sentence-block">
            <p>{j + 1}) {s.text}</p>
            <p className="correct">✔ To‘g‘ri javob: {s.correctWord}</p>
          </div>
        ))}
      </div>
    ))}
  </>
)}

{exam.translateQuestions?.length > 0 && (
  <>
  <hr />
  <h3>Translate</h3>

  {exam.translateQuestions.map((q, i) => (
    <div key={i} className="question-card">
      <p><b>{i + 1}) Tarjima qiling:</b> {q.word}</p>
      <p className="correct">✔ To'g'ri javob: {q.correctAnswer}</p>
    </div>
  ))}
  </>
)}

{exam.correctionQuestions?.length > 0 && (
  <>
  <hr />
  <h3>Correct the mistakes</h3>

  {exam.correctionQuestions.map((q, i) => (
    <div key={i} className="question-card">
      <p><b>{i + 1}) Xato gap:</b> {q.wrongSentence}</p>
      <p className="correct">✔ To'g'ri variant: {q.correctSentence}</p>
    </div>
  ))}
  </>
)}

{exam.sentenceBuildQuestions?.length > 0 && (
  <>
    <hr />
    <h3>Grammar — Sentence Build</h3>

    {exam.sentenceBuildQuestions.map((q, i) => (
      <div key={q._id} className="question-card">

        <p><b>{i + 1}) So‘zlardan gap tuzing:</b></p>

        <div className="word-box">
          {q.words.map((w, wi) => (
            <span key={wi} className="word-chip">{w} {wi !== q.words.length - 1 && " / "}</span>
          ))}
        </div>

        <div className="sentence-build-answers">
          <p className="correct">
            ✔ Affirmative: {q.affirmative || "—"}
          </p>

          <p className="correct">
            ✔ Negative: {q.negative || "—"}
          </p>

          <p className="correct">
            ✔ Question: {q.question || "—"}
          </p>
        </div>

        {q.points && (
          <p><b>Ball:</b> {q.points}</p>
        )}

      </div>
    ))}
  </>
)}

{reading?.passage && (
  <>
    <hr />
    <h3>Reading</h3>

    <p><b>Topshiriq:</b> {reading.instruction}</p>
    <p className="reading-passage">{reading.passage}</p>
  </>
)}

{reading?.tfQuestions?.length > 0 && (
  <>
    <h4>True / False / Not Given</h4>

    {reading.tfQuestions.map((q, i) => (
      <div key={i} className="question-card">
        <p><b>{i + 1}) {q.statement}</b></p>
        <p className="correct">✔ {q.correct}</p>
      </div>
    ))}
  </>
)}

{reading?.gapQuestions?.length > 0 && (
  <>
    <h4>Gap Fill</h4>

    {reading.gapQuestions.map((q, i) => (
      <div key={i} className="question-card">
        <p><b>{i + 1})</b> {q.sentence}</p>
        <p className="correct">✔ {q.correctWord}</p>
      </div>
    ))}
  </>
)}

{reading?.translationQuestions?.length > 0 && (
  <>
    <h4>Reading — Translate</h4>

    {reading.translationQuestions.map((q, i) => (
      <div key={i} className="question-card">
        <p>
          <b>{i + 1}) Tarjima qiling:</b> {q.sentence}
        </p>
        <p className="correct">
          ✔ To‘g‘ri javob: {q.correctAnswer}
        </p>
      </div>
    ))}
  </>
)}


{Array.isArray(reading?.shortAnswerQuestions) &&
  reading.shortAnswerQuestions.length > 0 && (
    <>
      <h4>Short Answer Questions</h4>

      {reading.shortAnswerQuestions.map((q, i) => (
        <div key={q._id || i} className="question-card">

          <p>
            <b>Question {i + 1})</b> {q.question}
          </p>

          <p>
            <b>Keywords:</b>{" "}
            {Array.isArray(q.keywords)
              ? q.keywords.join(", ")
              : "—"}
          </p>

          <p>
            <b>Max ball:</b> {q.maxPoints ?? 2}
          </p>

        </div>
      ))}
    </>
)}

{exam.writingTask && (
  <>
    <hr />
    <h3>Writing</h3>

    <p>
      <b>Sarlavha:</b>{" "}
      {exam.writingTask.title || "—"}
    </p>

    <p>
      <b>Topshiriq:</b>{" "}
      {exam.writingTask.instruction || "Topshiriq berilmagan"}
    </p>

    <p>
      <b>So‘zlar:</b>{" "}
      {exam.writingTask.minWords || 0} – {exam.writingTask.maxWords || 0}
    </p>

    <p>
      <b>Maksimal ball:</b>{" "}
      {exam.writingTask.points || 0}
    </p>
  </>
)}

    </div>
  );
}
