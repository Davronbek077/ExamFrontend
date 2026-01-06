import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import "./EditExam.css";

export default function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    timeLimit: "",
    passPercentage: "",
    questions: [],
    listeningTF: [],
    listeningGaps: [],
    reading: {
      instruction: "",
      passage: "",
      tfQuestions: [],
      gapQuestions: [],
      shortAnswerQuestions: []
    },
    writingTask: {
      title: "",
      instruction: "",
      minWords: "",
      maxWords: "",
      points: ""
    }
  });

  const normalizeQuestion = q => {
    const map = {
      translation: "translate",
      completion: "complete",
      correct: "correction"
    };
  
    const fixedType = map[q.type] || q.type || "mcq";
  
    return {
      type: fixedType,
      questionText: q.questionText || "",
      options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
      correctAnswer: q.correctAnswer || "",
      word: q.word || "",
      wrongSentence: q.wrongSentence || "",
      correctSentence: q.correctSentence || "",
      wordBank: Array.isArray(q.wordBank) ? q.wordBank : [],
      sentences: Array.isArray(q.sentences) ? q.sentences : []
    };
  };
    

  /* ===== LOAD ===== */
  useEffect(() => {
    api.get(`/exams/${id}`).then(res => {
  
      const rawQuestions = Array.isArray(res.data.questions)
        ? res.data.questions
        : [];
  
      setForm({
        title: res.data.title || "",
        timeLimit: String(res.data.timeLimit || ""),
        passPercentage: String(res.data.passPercentage || ""),
        questions: rawQuestions.map(normalizeQuestion),
        listeningTF: res.data.listeningTF || [],
        listeningGaps: res.data.listeningGaps || [],
        reading: res.data.reading || {
          instruction: "",
          passage: "",
          tfQuestions: [],
          gapQuestions: [],
          shortAnswerQuestions: []
        },
        writingTask: res.data.writingTask || {
          title: "",
          instruction: "",
          minWords: "",
          maxWords: "",
          points: ""
        }
      });
  
      setLoading(false);
    }).catch(err => {
      console.error("LOAD ERROR:", err);
      setLoading(false);
    });
  }, [id]);  

  /* ===== QUESTIONS ===== */
  const addQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          type: "mcq",
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          wordBank: [],
          sentences: [],
          word: "",
          wrongSentence: "",
          correctSentence: "",
          scrambledWords: "",
          baseSentence: "",
          tenseAnswers: {}
        }
      ]
    }));
  };

  const updateQuestion = (i, field, value, oi = null) => {
    const qs = [...form.questions];
    if (field === "option") qs[i].options[oi] = value;
    else qs[i][field] = value;
    setForm({ ...form, questions: qs });
  };

  const removeQuestion = i => {
    const qs = [...form.questions];
    qs.splice(i, 1);
    setForm({ ...form, questions: qs });
  };

  /* ===== SAVE ===== */
  const save = async () => {
    try {
      await api.put(`/exams/${id}`, {
        title: form.title,
        timeLimit: Number(form.timeLimit),
        passPercentage: Number(form.passPercentage),
        questions: form.questions,
        listeningTF: form.listeningTF,
        listeningGaps: form.listeningGaps,
        reading: form.reading,
        writingTask: {
          title: form.writingTask.title,
          instruction: form.writingTask.instruction,
          minWords: Number(form.writingTask.minWords) || 0,
          maxWords: Number(form.writingTask.maxWords) || 0,
          points: Number(form.writingTask.points) || 0
        }
      });

      toast.success("Ma'lumotlar saqlandi");
      navigate("/exams");
    } catch (err) {
      toast.error("Saqlashda xato!");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="loader-wrapper">
        <ClipLoader size={55} />
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="edit-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <MdOutlineKeyboardBackspace /> Back
      </button>

      <h2>Imtihonni tahrirlash</h2>

      <input
        placeholder="Imtihon nomi"
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
      />

      <input
        placeholder="Imtihon vaqti"
        value={form.timeLimit}
        onChange={e =>
          setForm({ ...form, timeLimit: e.target.value.replace(/\D/g, "") })
        }
      />

      <input
        placeholder="O‘tish foizi %"
        value={form.passPercentage}
        onChange={e =>
          setForm({
            ...form,
            passPercentage: e.target.value.replace(/\D/g, "")
          })
        }
      />

      <h3>Savollar</h3>

      {form.questions.map((q, i) => (
        <div key={i} className="question-edit-card">

          <select
            value={q.type}
            onChange={e => updateQuestion(i, "type", e.target.value)}
          >
            <option value="mcq">Multiple Choice</option>
            <option value="truefalse">True / False</option>
            <option value="gapfill">Gap Fill</option>
            <option value="translate">Translate</option>
            <option value="complete">Complete</option>
            <option value="correction">Correction</option>
            <option value="grammar">Grammar</option>
            <option value="tense">Tense</option>
          </select>

          {/* ✅ SAVOL HAR DOIM CHIQADI */}
          <input
            placeholder="Savol"
            value={q.questionText || ""}
            onChange={e => updateQuestion(i, "questionText", e.target.value)}
          />

          {q.type === "mcq" &&
            q.options.map((o, oi) => (
              <input
                key={oi}
                placeholder={`Variant ${oi + 1}`}
                value={o}
                onChange={e => updateQuestion(i, "option", e.target.value, oi)}
              />
            ))}

          {["mcq", "truefalse", "gapfill"].includes(q.type) && (
            <input
              placeholder="To‘g‘ri javob"
              value={q.correctAnswer || ""}
              onChange={e =>
                updateQuestion(i, "correctAnswer", e.target.value)
              }
            />
          )}

          {q.type === "translate" && (
            <>
              <input
                placeholder="Tarjima qilinadigan so‘z / gap"
                value={q.word || ""}
                onChange={e => updateQuestion(i, "word", e.target.value)}
              />
              <input
                placeholder="To‘g‘ri tarjima"
                value={q.correctAnswer || ""}
                onChange={e =>
                  updateQuestion(i, "correctAnswer", e.target.value)
                }
              />
            </>
          )}

          {q.type === "correction" && (
            <>
              <input
                placeholder="Xato gap"
                value={q.wrongSentence || ""}
                onChange={e =>
                  updateQuestion(i, "wrongSentence", e.target.value)
                }
              />
              <input
                placeholder="To‘g‘ri gap"
                value={q.correctSentence || ""}
                onChange={e =>
                  updateQuestion(i, "correctSentence", e.target.value)
                }
              />
            </>
          )}

          {q.type === "complete" && (
            <>
              <textarea
                placeholder="Word box (vergul bilan)"
                value={(q.wordBank || []).join(", ")}
                onChange={e =>
                  updateQuestion(
                    i,
                    "wordBank",
                    e.target.value.split(",").map(w => w.trim())
                  )
                }
              />

              {(q.sentences || []).map((s, si) => (
                <div key={si}>
                  <input
                    placeholder="Gap (____ bilan)"
                    value={s.text}
                    onChange={e => {
                      const qs = [...form.questions];
                      qs[i].sentences[si].text = e.target.value;
                      setForm({ ...form, questions: qs });
                    }}
                  />
                  <input
                    placeholder="To‘g‘ri so‘z"
                    value={s.correctWord}
                    onChange={e => {
                      const qs = [...form.questions];
                      qs[i].sentences[si].correctWord = e.target.value;
                      setForm({ ...form, questions: qs });
                    }}
                  />
                </div>
              ))}

              <button onClick={() => {
                const qs = [...form.questions];
                qs[i].sentences.push({ text: "", correctWord: "" });
                setForm({ ...form, questions: qs });
              }}>
                + Gap qo‘shish
              </button>
            </>
          )}

          <button className="removeQuestion-btn" onClick={() => removeQuestion(i)}>
            Delete
          </button>

        </div>
      ))}

      <button className="addQuestion-btn" onClick={addQuestion}>
        + Savol qo‘shish
      </button>

      <button className="save-btn" onClick={save}>
        Saqlash
      </button>
    </div>
  );
}
