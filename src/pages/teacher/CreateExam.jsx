
import React, { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import "./TeacherPanel.css";

export default function TeacherPanel() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [passPercentage, setPassPercentage] = useState("");
  const [questions, setQuestions] = useState([]);

  // LISTENING
  const [listeningTF, setListeningTF] = useState([]);
  const [listeningGaps, setListeningGaps] = useState([]);

  const [stats, setStats] = useState(null);
  const [reading, setReading] = useState({
    instruction: "",
    passage: "",
    tfQuestions: [],
    gapQuestions: [],
    pointsPerQuestion: 1
  });

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

  const addReadingTF = () => {
    setReading({
      ...reading,
      tfQuestions: [
        ...reading.tfQuestions,
        {statement: "", correct: "true"}
      ]
    });
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

  const addReadingGap = () => {
    setReading({
      ...reading,
      gapQuestions: [
        ...reading.gapQuestions,
        {sentence: "", correctWord: ""}
      ]
    });
  };

  const createExam = async () => {
    if (!title) return alert("Imtihon nomini kiriting");
  
    try {
      const questionsArr = questions
        .filter(q => ["mcq", "truefalse", "gapfill"].includes(q.type))
        .map(q => ({
          type: q.type,
          questionText: q.questionText,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          points: 1
        }));
  
      const grammarArr = questions
        .filter(q =>
          q.type === "grammar" &&
          q.scrambledWords.trim() &&
          q.correctSentence.trim()
        )
        .map(q => ({
          scrambledWords: q.scrambledWords,
          correctSentence: q.correctSentence,
          points: 1
        }));
  
      const tenseArr = questions
        .filter(q =>
          q.type === "tense" &&
          Object.keys(q.tenseAnswers || {}).length
        )
        .map(q => ({
          baseSentence: q.baseSentence,
          transforms: Object.entries(q.tenseAnswers).map(
            ([tense, correctSentence]) => ({
              tense,
              correctSentence,
              points: 1
            })
          ),
          points: 1
        }));
  
      await api.post("/exams/create", {
        title,
        timeLimit,
        passPercentage,
        questions: questionsArr,
        grammarQuestions: grammarArr,
        tenseTransforms: tenseArr,
        listeningTF,
        listeningGaps,
        reading
      });
  
      toast.success("Imtihon yaratildi!");
      fetchExams();
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi!");
    }
  };

  const fetchStats = async (examId) => {
    const res = await api.get(`/results/stats/${examId}`);
    setStats(res.data);
  };

  return (
    <div className="teacher-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
      <MdOutlineKeyboardBackspace className="back-icon" /> Back
      </button>
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
      </div>

      {/* LISTENING QUESTIONS */}
      <div className="listening-questions">
        <h3>Listening – True/False</h3>
        {listeningTF.map((item, i) => (
          <div key={i} className="list-item">
            <input
              type="text"
              placeholder="Savol matni"
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

        <h3 className="gapfill-text">Listening – Gapfill</h3>
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
      <h3 className="mainquestion-text">Asosiy savollar</h3>
      <div className="questions-container">
        {questions.map((q, i) => (
          <div key={i} className="question-block">
            <select
              value={q.type}
              onChange={(e) => updateQuestion(i, "type", e.target.value)}
            >
              <option value="mcq">Multiple Choice (Choose one)</option>
              <option value="truefalse">True / False</option>
              <option value="gapfill">Fill in the Blank</option>
              <option value="grammar">Grammar Correction</option>
              <option value="tense">Tense Transformation</option>
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

<button className="addQuestion-btn" onClick={addQuestion}>Savol qo‘shish</button>

                    {/* ================= READING SECTION ================= */}
<div className="reading-section">
  <h3>Reading</h3>

  {/* Instruction */}
  <input
    type="text"
    placeholder="Reading bo‘yicha topshiriq"
    value={reading.instruction}
    onChange={e =>
      setReading({ ...reading, instruction: e.target.value })
    }
  />

  {/* Passage */}
  <textarea
    rows={8}
    placeholder="Reading matni"
    value={reading.passage}
    onChange={e =>
      setReading({ ...reading, passage: e.target.value })
    }
  />

  {/* TF / NG */}
  <h4>True / False / Not Given</h4>

  {reading.tfQuestions.map((q, i) => (
    <div key={i} className="reading-item">
      <input
        placeholder="Savol matni"
        value={q.statement}
        onChange={e => {
          const arr = [...reading.tfQuestions];
          arr[i].statement = e.target.value;
          setReading({ ...reading, tfQuestions: arr });
        }}
      />

      <select
        value={q.correct}
        onChange={e => {
          const arr = [...reading.tfQuestions];
          arr[i].correct = e.target.value;
          setReading({ ...reading, tfQuestions: arr });
        }}
      >
        <option value="true">True</option>
        <option value="false">False</option>
        <option value="not_given">Not Given</option>
      </select>
    </div>
  ))}

  <button onClick={addReadingTF}>+ TF/NG qo‘shish</button>

  {/* GAP FILL */}
  <h4>Gap fill</h4>

  {reading.gapQuestions.map((q, i) => (
    <div key={i} className="reading-item">
      <input
        placeholder="Gap (______ bilan)"
        value={q.sentence}
        onChange={e => {
          const arr = [...reading.gapQuestions];
          arr[i].sentence = e.target.value;
          setReading({ ...reading, gapQuestions: arr });
        }}
      />

      <input
        placeholder="To‘g‘ri so‘z"
        value={q.correctWord}
        onChange={e => {
          const arr = [...reading.gapQuestions];
          arr[i].correctWord = e.target.value;
          setReading({ ...reading, gapQuestions: arr });
        }}
      />
    </div>
  ))}

  <button id="gap-add" onClick={addReadingGap}>+ Gap qo‘shish</button>
</div>

        <div className="createExam-btn">
        <button onClick={createExam}>Imtihon yaratish</button>
        </div>
      </div>
    </div>
  );
}