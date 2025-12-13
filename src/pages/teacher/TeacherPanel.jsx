
import React, { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import "./TeacherPanel.css";

export default function TeacherPanel() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [passPercentage, setPassPercentage] = useState("");
  const [questions, setQuestions] = useState([]);

  // LISTENING
  const [listeningAudio, setListeningAudio] = useState(null);
  const [listeningTF, setListeningTF] = useState([]);
  const [listeningGaps, setListeningGaps] = useState([]);

  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const res = await api.get("/exams/all");
    setExams(res.data);
  };

  // --- ADD QUESTION ---
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "mcq",
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 1,
        scrambledWords: "",
        correctSentence: "",
        baseSentence: "",
        tenses: [],
        tenseAnswers: {}
      }
    ]);
  };

  const updateQuestion = (index, field, value, optionIndex = null) => {
    const qCopy = [...questions];

    if (field === "option") {
      qCopy[index].options[optionIndex] = value;
    } else {
      qCopy[index][field] = value;
    }

    setQuestions(qCopy);
  };

  const toggleTense = (qIndex, tenseName) => {
    const copy = [...questions];
    const arr = copy[qIndex].tenses || [];

    if (arr.includes(tenseName)) {
      copy[qIndex].tenses = arr.filter((t) => t !== tenseName);
    } else {
      copy[qIndex].tenses = [...arr, tenseName];
    }

    setQuestions(copy);
  };

  const updateTenseAnswer = (qIndex, tenseName, value) => {
    const copy = [...questions];
    if (!copy[qIndex].tenseAnswers) copy[qIndex].tenseAnswers = {};
    copy[qIndex].tenseAnswers[tenseName] = value;
    setQuestions(copy);
  };

  // --- LISTENING TRUE/FALSE ---
  const addListeningTF = () => {
    setListeningTF([...listeningTF, { statement: "", correct: true }]);
  };

  const updateListeningTF = (i, field, value) => {
    const c = [...listeningTF];
    c[i][field] = value;
    setListeningTF(c);
  };

  // --- LISTENING GAPFILL (TO‘G‘RILANGAN) ---
  const addListeningGap = () => {
    setListeningGaps([
      ...listeningGaps,
      { sentence: "", correctWord: "" }   // ✅ answer emas endi correctWord
    ]);
  };

  const updateListeningGap = (i, field, value) => {
    const c = [...listeningGaps];
    c[i][field] = value;
    setListeningGaps(c);
  };

  // --- CREATE EXAM ---
  const createExam = async () => {
    if (!title) return alert("Iltimos, imtihon nomini kiriting");
  
    try {
      // 1) Basic questions (mcq, truefalse, gapfill)
      const questionsArr = questions
        .filter(q => ["mcq", "truefalse", "gapfill"].includes(q.type))
        .map(q => ({
          type: q.type,
          questionText: q.questionText,
          options: q.options || [],
          correctAnswer: q.correctAnswer || "",
          points: 1
        }));
  
      // 2) Grammar questions
      const grammarArr = questions
        .filter(q => q.type === "grammar")
        .map(q => ({
          scrambledWords: q.scrambledWords,
          correctSentence: q.correctSentence,
          points: 1
        }));
  
      // 3) Tense transforms
      const tenseArr = questions
        .filter(q => q.type === "tense")
        .map(q => ({
          baseSentence: q.baseSentence,
          transforms: Object.entries(q.tenseAnswers || {})
            .map(([tense, correctSentence]) => ({
              tense,
              correctSentence,
              points: 1
            })),
          points: 1
        }));
  
      // 4) Listening TF
      const listeningTFFormatted = listeningTF.map(i => ({
        statement: i.statement,
        correct: i.correct
      }));
  
      // 5) Listening Gapfills
      const listeningGapsFormatted = listeningGaps.map(i => ({
        sentence: i.sentence,
        correctWord: i.correctWord
      }));
  
      // SEND DATA
      const fd = new FormData();
      fd.append("title", title);
      fd.append("timeLimit", timeLimit);
      fd.append("passPercentage", passPercentage);
      fd.append("questions", JSON.stringify(questionsArr));
      fd.append("grammarQuestions", JSON.stringify(grammarArr));
      fd.append("tenseTransforms", JSON.stringify(tenseArr));
      fd.append("listeningTF", JSON.stringify(listeningTFFormatted));
      fd.append("listeningGaps", JSON.stringify(listeningGapsFormatted));
  
      if (listeningAudio) fd.append("audio", listeningAudio);
  
      await api.post("/exams/create", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
  
      alert("Imtihon yaratildi!");
      fetchExams();
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi!");
    }
  };
  
  

  const fetchStats = async (examId) => {
    const res = await api.get(`/results/stats/${examId}`);
    setStats(res.data);
  };

  return (
    <div className="teacher-container">
      <h2>Teacher Panel</h2>

      {/* CREATE EXAM */}
      <div className="create-exam">
        <input
          type="text"
          placeholder="Imtihon nomi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Vaqt limiti"
          value={timeLimit}
          onChange={(e) => setTimeLimit(e.target.value)}
        />

        <input
          type="number"
          placeholder="O‘tish foizi"
          value={passPercentage}
          onChange={(e) => setPassPercentage(e.target.value)}
        />

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setListeningAudio(e.target.files[0])}
        />
      </div>

      {/* LISTENING QUESTIONS */}
      <div className="listening-questions">
        <h3>Listening – True/False</h3>
        {listeningTF.map((item, i) => (
          <div key={i} className="list-item">
            <input
              type="text"
              placeholder="Statement"
              value={item.statement}
              onChange={(e) => updateListeningTF(i, "statement", e.target.value)}
            />

            <select
              value={item.correct}
              onChange={(e) =>
                updateListeningTF(i, "correct", e.target.value === "true")
              }
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        ))}
        <button onClick={addListeningTF}>+ True/False qo‘shish</button>

        <h3>Listening – Gapfill</h3>
        {listeningGaps.map((item, i) => (
          <div key={i} className="list-item">
            <input
              type="text"
              placeholder="Sentence with gap"
              value={item.sentence}
              onChange={(e) => updateListeningGap(i, "sentence", e.target.value)}
            />

            <input
              type="text"
              placeholder="Correct answer"
              value={item.correctWord}   // ✅ answer emas
              onChange={(e) =>
                updateListeningGap(i, "correctWord", e.target.value)
              }
            />
          </div>
        ))}
        <button onClick={addListeningGap}>+ Gapfill qo‘shish</button>
      </div>

      {/* QUESTIONS */}
      <h3>Asosiy savollar</h3>
      <div className="questions-container">
        {questions.map((q, i) => (
          <div key={i} className="question-block">
            <select
              value={q.type}
              onChange={(e) => updateQuestion(i, "type", e.target.value)}
            >
              <option value="mcq">MCQ</option>
              <option value="truefalse">True/False</option>
              <option value="gapfill">Gapfill</option>
              <option value="grammar">Grammar</option>
              <option value="tense">Tense</option>
            </select>

            <input
              type="text"
              placeholder="Savol matni"
              value={q.questionText}
              onChange={(e) => updateQuestion(i, "questionText", e.target.value)}
            />

            {/* MCQ */}
            {q.type === "mcq" &&
              q.options.map((opt, oi) => (
                <input
                  key={oi}
                  type="text"
                  placeholder={`Variant ${oi + 1}`}
                  value={opt}
                  onChange={(e) =>
                    updateQuestion(i, "option", e.target.value, oi)
                  }
                />
              ))}

            {(q.type === "mcq" ||
              q.type === "truefalse" ||
              q.type === "gapfill") && (
              <input
                type="text"
                placeholder="To‘g‘ri javob"
                value={q.correctAnswer}
                onChange={(e) =>
                  updateQuestion(i, "correctAnswer", e.target.value)
                }
              />
            )}

            {/* GRAMMAR */}
            {q.type === "grammar" && (
              <>
                <input
                  type="text"
                  placeholder="Scrambled words"
                  value={q.scrambledWords}
                  onChange={(e) =>
                    updateQuestion(i, "scrambledWords", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Correct sentence"
                  value={q.correctSentence}
                  onChange={(e) =>
                    updateQuestion(i, "correctSentence", e.target.value)
                  }
                />
              </>
            )}

            {/* TENSE */}
            {q.type === "tense" && (
              <>
                <input
                  type="text"
                  placeholder="Base sentence"
                  value={q.baseSentence}
                  onChange={(e) =>
                    updateQuestion(i, "baseSentence", e.target.value)
                  }
                />

                <p>Zamonlar:</p>
                {[
                  "presentSimple",
                  "pastSimple",
                  "futureSimple",
                  "presentContinuous"
                ].map((t) => (
                  <label key={t}>
                    <input
                      type="checkbox"
                      checked={q.tenses.includes(t)}
                      onChange={() => toggleTense(i, t)}
                    />
                    {t}
                  </label>
                ))}

                {q.tenses.map((t) => (
                  <input
                    key={t}
                    type="text"
                    placeholder={`${t} — to‘g‘ri javob`}
                    value={q.tenseAnswers?.[t] || ""}
                    onChange={(e) =>
                      updateTenseAnswer(i, t, e.target.value)
                    }
                  />
                ))}
              </>
            )}
          </div>
        ))}

        <button onClick={addQuestion}>Savol qo‘shish</button>

        <button onClick={createExam}>Imtihon yaratish</button>
      </div>

      {/* EXAMS LIST */}
      <h3>Imtihonlar</h3>
      <ul>
        {exams.map((e) => (
          <li key={e._id}>
          <span 
            className="exam-link"
            onClick={() => navigate(`/exam/${e._id}`)}
          >
            {e.title}
          </span>
        
          <button onClick={() => fetchStats(e._id)}>Statistika</button>
        </li>
        
        ))}
      </ul>

      {/* STATS */}
      {stats && (
        <div>
          <h3>Statistika: {stats.total} ta</h3>
          <p>Passed: {stats.passed}</p>
          <p>Failed: {stats.failed}</p>

          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {stats.results.map((r) => (
                <tr key={r._id}>
                  <td>{r.studentId.name}</td>
                  <td>{r.score}</td>
                  <td>{r.percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
