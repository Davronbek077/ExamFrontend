import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { ClipLoader } from "react-spinners";
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
      gapQuestions: []
    }
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
        listeningGaps: res.data.listeningGaps || [],
        reading: res.data.reading || {
          instruction: "",
          passage: "",
          tfQuestions: [],
          gapQuestions: []
        }
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
      const questionsArr = form.questions.filter(q =>
        ["mcq", "truefalse", "gapfill"].includes(q.type)
      );
  
      const grammarArr = form.questions.filter(q => q.type === "grammar");
  
      const tenseArr = form.questions
        .filter(q => q.type === "tense")
        .map(q => ({
          baseSentence: q.baseSentence,
          transforms: Object.entries(q.tenseAnswers || {}).map(
            ([tense, correctSentence]) => ({
              tense,
              correctSentence
            })
          )
        }));
  
      await api.put(`/exams/${id}`, {
        title: form.title,
        timeLimit: Number(form.timeLimit),
        passPercentage: Number(form.passPercentage),
        questions: questionsArr,
        grammarQuestions: grammarArr,
        tenseTransforms: tenseArr,
        listeningTF: form.listeningTF,
        listeningGaps: form.listeningGaps,
        reading: form.reading
      });
  
      alert("✅ Saqlandi");
      navigate("/exams");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("❌ Saqlashda xato");
      console.log(err.response?.data);
    }
  };

  if (loading) {
    return (
      <div className="loader-wrapper">
        <ClipLoader color="#2d5bff" size={55}/>
        <p>Yuklanmoqda...</p>
      </div>
    )
  };

  return (
    <div className="edit-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
      <MdOutlineKeyboardBackspace className="back-icon" /> Back
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
          setForm({ ...form, passPercentage: e.target.value.replace(/\D/g, "") })
        }
      />

      <h3>Savollar</h3>
      {form.questions.map((q, i) => (
  <div key={i} className="question-edit-card">

    <select
      value={q.type}
      onChange={e => updateQuestion(i, "type", e.target.value)}
    >
      <option value="mcq">Variantli savollar</option>
      <option value="truefalse">True yoki False</option>
      <option value="gapfill">Gapni to'ldirish</option>
      <option value="grammar">Grammar (Word Order)</option>
      <option value="tense">Tense Transformation</option>
    </select>

    {/* COMMON */}
    <input
      placeholder="Savol"
      value={q.questionText || ""}
      onChange={e => updateQuestion(i, "questionText", e.target.value)}
    />

    {/* MCQ */}
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

    {/* STANDARD ANSWER */}
    {["mcq", "truefalse", "gapfill"].includes(q.type) && (
      <input
        placeholder="To‘g‘ri javob"
        value={q.correctAnswer || ""}
        onChange={e =>
          updateQuestion(i, "correctAnswer", e.target.value)
        }
      />
    )}

    {/* GRAMMAR */}
    {q.type === "grammar" && (
      <>
        <input
          placeholder="Aralash so‘zlar"
          value={q.scrambledWords || ""}
          onChange={e =>
            updateQuestion(i, "scrambledWords", e.target.value)
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

    {/* TENSE */}
    {q.type === "tense" && (
      <>
        <input
          placeholder="Asosiy gap"
          value={q.baseSentence || ""}
          onChange={e =>
            updateQuestion(i, "baseSentence", e.target.value)
          }
        />

        {["Present", "Past", "Future"].map(t => (
          <input
            key={t}
            placeholder={`${t} tense`}
            value={q.tenseAnswers?.[t] || ""}
            onChange={e => {
              const qs = [...form.questions];
              qs[i].tenseAnswers = {
                ...(qs[i].tenseAnswers || {}),
                [t]: e.target.value
              };
              setForm({ ...form, questions: qs });
            }}
          />
        ))}
      </>
    )}

    <button onClick={() => removeQuestion(i)}>Delete</button>
  </div>
))}

      <button className="editAddQuedtion-btn" onClick={addQuestion}>Savol qo‘shish</button>

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
          <button className="listteningTF-delete" onClick={() => removeItem("listeningTF", i)}>Delete</button>
        </div>
      ))}

      <button
        onClick={() =>
          setForm({
            ...form,
            listeningTF: [...form.listeningTF, { statement: "", correct: true }]
          })
        }
        className="listeningTF-add-btn"
      >
        Listening TF qo‘shish
      </button>

      <h3>Listening — Gap Filling</h3>

{form.listeningGaps.map((q, i) => (
  <div key={i} className="listening-gap-card">
    <input
      placeholder="Gap (bo‘sh joy bilan)"
      value={q.sentence || ""}
      onChange={e => {
        const arr = [...form.listeningGaps];
        arr[i].sentence = e.target.value;
        setForm({ ...form, listeningGaps: arr });
      }}
    />

    <input
      placeholder="To‘g‘ri so‘z"
      value={q.correctWord || ""}
      onChange={e => {
        const arr = [...form.listeningGaps];
        arr[i].correctWord = e.target.value;
        setForm({ ...form, listeningGaps: arr });
      }}
    />

    <button onClick={() => removeItem("listeningGaps", i)}>
      Delete
    </button>
  </div>
))}

<button
  onClick={() =>
    setForm({
      ...form,
      listeningGaps: [
        ...form.listeningGaps,
        { sentence: "", correctWord: "" }
      ]
    })
  }
  className="listeningGap-add-btn"
>
  Listening Gap qo‘shish
</button>

<h3>Reading</h3>

<input placeholder="Topshiriq (Instruction)" 
value={form.reading.instruction}
onChange={e => 
  setForm({
    ...form,
    reading: {...form.reading, instruction: e.target.value}
  })
}
/>

<textarea
  placeholder="Reading matni"
  value={form.reading.passage}
  rows={8}
  onChange={e =>
    setForm({
      ...form,
      reading: { ...form.reading, passage: e.target.value }
    })
  }
/>

<h4>Reading — True / False / Not Given</h4>

{form.reading.tfQuestions.map((q, i) => (
  <div key={i} className="question-edit-card">
    <input
      placeholder="Statement"
      value={q.statement}
      onChange={e => {
        const arr = [...form.reading.tfQuestions];
        arr[i].statement = e.target.value;
        setForm({
          ...form,
          reading: { ...form.reading, tfQuestions: arr }
        });
      }}
    />

    <select
      value={q.correct}
      onChange={e => {
        const arr = [...form.reading.tfQuestions];
        arr[i].correct = e.target.value;
        setForm({
          ...form,
          reading: { ...form.reading, tfQuestions: arr }
        });
      }}
    >
      <option value="true">True</option>
      <option value="false">False</option>
      <option value="not_given">Not Given</option>
    </select>

    <button
      onClick={() => {
        const arr = [...form.reading.tfQuestions];
        arr.splice(i, 1);
        setForm({
          ...form,
          reading: { ...form.reading, tfQuestions: arr }
        });
      }}
    >
      Delete
    </button>
  </div>
))}

<button
  onClick={() =>
    setForm({
      ...form,
      reading: {
        ...form.reading,
        tfQuestions: [
          ...form.reading.tfQuestions,
          { statement: "", correct: "true" }
        ]
      }
    })
  }
  className="readingTF-add-btn"
>
  Reading TF qo‘shish
</button>

<h4>Reading — Gap Fill</h4>

{form.reading.gapQuestions.map((q, i) => (
  <div key={i} className="question-edit-card">
    <input
      placeholder="Gap (___ bilan)"
      value={q.sentence}
      onChange={e => {
        const arr = [...form.reading.gapQuestions];
        arr[i].sentence = e.target.value;
        setForm({
          ...form,
          reading: { ...form.reading, gapQuestions: arr }
        });
      }}
    />

    <input
      placeholder="To‘g‘ri so‘z"
      value={q.correctWord}
      onChange={e => {
        const arr = [...form.reading.gapQuestions];
        arr[i].correctWord = e.target.value;
        setForm({
          ...form,
          reading: { ...form.reading, gapQuestions: arr }
        });
      }}
    />

    <button
      onClick={() => {
        const arr = [...form.reading.gapQuestions];
        arr.splice(i, 1);
        setForm({
          ...form,
          reading: { ...form.reading, gapQuestions: arr }
        });
      }}
    >
      Delete
    </button>
  </div>
))}

<button
  onClick={() =>
    setForm({
      ...form,
      reading: {
        ...form.reading,
        gapQuestions: [
          ...form.reading.gapQuestions,
          { sentence: "", correctWord: "" }
        ]
      }
    })
  }
  className="readingGap-add-btn"
>
  Reading Gap qo‘shish
</button>

      <button className="save-btn" onClick={save}>
        Ma'lumotlarni Saqlash
      </button>
    </div>
  );
}
