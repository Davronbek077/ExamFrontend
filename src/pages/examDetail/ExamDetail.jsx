import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/api";
import "./ExamDetail.css";
import { FaHeadphones } from "react-icons/fa6";
import { FaRegCircleQuestion } from "react-icons/fa6";

export default function ExamDetail() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);

  useEffect(() => {
    api.get(`/exams/${id}`).then(res => setExam(res.data));
  }, [id]);

  if (!exam) return <p>Yuklanmoqda...</p>;

  return (
    <div className="exam-detail">
      <h2>{exam.title}</h2>
      <p>Vaqt limiti: {exam.timeLimit} daqiqa</p>
      <p>O‘tish foizi: {exam.passPercentage}%</p>

      <hr />

      <h3><FaRegCircleQuestion /> Umumiy Savollar</h3>
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

      {exam.listeningTF.length > 0 && (
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

      {exam.listeningGaps.length > 0 && (
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

      {exam.grammarQuestions.length > 0 && (
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

      {exam.tenseTransforms.length > 0 && (
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

    </div>
  );
}
