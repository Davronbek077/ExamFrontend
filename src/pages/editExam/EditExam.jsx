import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/api";
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
    listeningGaps: []
  });

  /* ===== LOAD ===== */
  useEffect(() => {
    api.get(`/exams/${id}`).then(res => {
      setForm({
        title: res.data.title || "",
        timeLimit: String(res.data.timeLimit || ""),
        passPercentage: String(res.data.passPercentage || ""),
        questions: res.data.questions || [],
        listeningTF: res.data.listeningTF || [],
        listeningGaps: res.data.listeningGaps || []
      });
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
          correctAnswer: ""
        }
      ]
    }));
  };

  const updateQuestion = (i, field, value, oi = null) => {
    const q = [...form.questions];
    if (field === "option") q[i].options[oi] = value;
    else q[i][field] = value;
    setForm({ ...form, questions: q });
  };

  const removeQuestion = i => {
    const q = [...form.questions];
    q.splice(i, 1);
    setForm({ ...form, questions: q });
  };

  /* ===== LISTENING ===== */
  const removeItem = (key, i) => {
    const arr = [...form[key]];
    arr.splice(i, 1);
    setForm({ ...form, [key]: arr });
  };

  /* ===== SAVE ===== */
  const save = async () => {
    try {
      await api.put(`/exams/${id}`, {
        title: form.title,
        timeLimit: Number(form.timeLimit),
        passPercentage: Number(form.passPercentage),
        questions: form.questions,
        listeningTF: form.listeningTF.map(q => ({
          statement: q.statement,
          correct: Boolean(q.correct)
        })),
        listeningGaps: form.listeningGaps
      });

      alert("✅ Saqlandi");
      navigate("/exams");
    } catch (err) {
      console.error(err);
      alert("❌ Saqlashda xato");
    }
  };

  if (loading) return <p>Yuklanmoqda...</p>;

  return (
    <div className="edit-container">
      <h2>Imtihonni tahrirlash</h2>

      <input
        placeholder="Nomi"
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
      />

      <input
        placeholder="Vaqt"
        value={form.timeLimit}
        onChange={e =>
          setForm({ ...form, timeLimit: e.target.value.replace(/\D/g, "") })
        }
      />

      <input
        placeholder="O‘tish %"
        value={form.passPercentage}
        onChange={e =>
          setForm({ ...form, passPercentage: e.target.value.replace(/\D/g, "") })
        }
      />

      <h3>Savollar</h3>
      {form.questions.map((q, i) => (
        <div key={i}>
          <select
            value={q.type}
            onChange={e => updateQuestion(i, "type", e.target.value)}
          >
            <option value="mcq">MCQ</option>
            <option value="truefalse">True / False</option>
            <option value="gapfill">Gap Fill</option>
          </select>

          <input
            placeholder="Savol"
            value={q.questionText}
            onChange={e =>
              updateQuestion(i, "questionText", e.target.value)
            }
          />

          {q.type === "mcq" &&
            q.options.map((o, oi) => (
              <input
                key={oi}
                placeholder={`Variant ${oi + 1}`}
                value={o}
                onChange={e =>
                  updateQuestion(i, "option", e.target.value, oi)
                }
              />
            ))}

          <input
            placeholder="To‘g‘ri javob"
            value={q.correctAnswer}
            onChange={e =>
              updateQuestion(i, "correctAnswer", e.target.value)
            }
          />

          <button onClick={() => removeQuestion(i)}>Delete</button>
        </div>
      ))}

      <button onClick={addQuestion}>Savol qo‘shish</button>

      <h3>Listening TF</h3>
      {form.listeningTF.map((q, i) => (
        <div key={i}>
          <input
            value={q.statement || ""}
            onChange={e => {
              const arr = [...form.listeningTF];
              arr[i].statement = e.target.value;
              setForm({ ...form, listeningTF: arr });
            }}
          />
          <select
            value={q.correct ? "true" : "false"}
            onChange={e => {
              const arr = [...form.listeningTF];
              arr[i].correct = e.target.value === "true";
              setForm({ ...form, listeningTF: arr });
            }}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
          <button onClick={() => removeItem("listeningTF", i)}>Delete</button>
        </div>
      ))}

      <button
        onClick={() =>
          setForm({
            ...form,
            listeningTF: [...form.listeningTF, { statement: "", correct: true }]
          })
        }
      >
        Listening TF qo‘shish
      </button>

      <button className="save-btn" onClick={save}>
        Saqlash
      </button>
    </div>
  );
}
