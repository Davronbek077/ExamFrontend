
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
  const [showWriting, setShowWriting] = useState(false);
  const [showReading, setShowReading] = useState(false);
  const [level, setLevel] = useState("");

  const [writingTask, setWritingTask] = useState({
    title: "",
    instruction: "",
    minWords: "",
    maxWords: "",
    points: ""
  });

  // LISTENING
  const [listeningTF, setListeningTF] = useState([]);
  const [listeningGaps, setListeningGaps] = useState([]);

  const [stats, setStats] = useState(null);
  const [reading, setReading] = useState({
    instruction: "",
    passage: "",
    tfQuestions: [],
    gapQuestions: [],
    shortAnswerQuestions: [],
    translationQuestions: [],
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
        word: "",
        correctAnswer: "",
  
        wordBank: "",
        sentences: [
          {text: "", correctWord: ""}
        ],
        pointsPerSentence: 1,
  
        scrambledWords: "",    // grammar
        wrongSentence: "",
        correctSentence: "",   // grammar & correction

        sentenceWords: "",
        affirmative: "",
        negative: "",
        questionForm: "",
        
        baseSentence: "",      // tense
        tenses: [],
        tenseAnswers: {},
  
        points: 1
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

  const addReadingShortAnswer = () => {
    setReading({
      ...reading,
      shortAnswerQuestions: [
        ...reading.shortAnswerQuestions,
        {
          question: "",
          keywords: [],
          maxPoints: 2
        }
      ]
    });
  };   
  
  const addReadingTranslation = () => {
    setReading({
      ...reading,
      translationQuestions: [
        ...reading.translationQuestions,
        {
          sentence: "",        // passage’dan olingan gap
          correctAnswer: "",   // to‘g‘ri tarjima
          points: 2
        }
      ]
    });
  };  

  const createExam = async () => {
    if (!title) {
      toast.error("Imtihon nomini kiriting")
      return;
    };
    if (!level) {
      toast.error("Imtihon darajasini tanlang")
      return;
    }
  
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

        const completeArr = questions
        .filter(q => q.type === "complete")
        .map(q => ({
          wordBank: q.wordBank.split(",").map(w => w.trim()),
          sentences: q.sentences,
          pointsPerSentence: q.pointsPerSentence || 1
        }));

        const translateQuestions = questions
        .filter(q => q.type === "translate")
        .map(q => ({
          word: q.word,
          correctAnswer: q.correctAnswer,
          points: q.points || 1
        }));

        const correctionQuestions = questions
        .filter(q => q.type === "correction")
        .map(q => ({
          wrongSentence: q.wrongSentence,
          correctSentence: q.correctSentence,
          points: q.points || 1
        }));

        const preparedWritingTask = {
      ...writingTask,
      minWords: Number(writingTask.minWords),
      maxWords: Number(writingTask.maxWords),
      points: Number(writingTask.points)
    };

    const sentenceBuildQuestions = questions
  .filter(q =>
    q.type === "sentenceBuild" &&
    q.sentenceWords.trim()
  )
  .map(q => ({
    words: q.sentenceWords.split("/").map(w => w.trim()),
    affirmative: q.affirmative,
    negative: q.negative,
    question: q.questionForm,
    points: q.points || 3
  }));


      await api.post("/exams/create", {
        title,
        level,
        timeLimit,
        passPercentage,
        questions: questionsArr,
        grammarQuestions: grammarArr,
        tenseTransforms: tenseArr,
        sentenceBuildQuestions,
        listeningTF,
        listeningGaps,
        ...(showReading && {reading}),
        completeQuestions: completeArr,
        ...(showWriting && {writingTask: preparedWritingTask}),
        translateQuestions,
        correctionQuestions
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

<select
  className="level-select"
  value={level}
  onChange={(e) => setLevel(e.target.value)}
>
  <option value="">Imtihon darajasini tanlang</option>
  <option value="Beginner">Beginner</option>
  <option value="Elementary">Elementary</option>
  <option value="Pre-intermediate">Pre-intermediate</option>
  <option value="Pre-IELTS">Pre-IELTS</option>
  <option value="IELTS-Foundation">IELTS-Foundation</option>
  <option value="IELTS-Max">IELTS-Max</option>
</select>
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
              <option value="translate">Translate</option>
              <option value="complete">Complete the sentence (Word box)</option>
              <option value="correction">Correct the mistakes</option>
              <option value="grammar">Grammar Correction</option>
              <option value="sentenceBuild">Grammar Sentence Build</option>
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

            {/* TRANSLATE */}
            {q.type === "translate" && (
              <>
              <input placeholder="Tarjima qilinadigan gap" 
              value={q.word}
              onChange={e => updateQuestion(i, "word", e.target.value)}
              />

              <input placeholder="To'g'ri tarjima" 
              value={q.correctAnswer}
              onChange={e => updateQuestion(i, "correctAnswer", e.target.value)}
              />
              </>
            )}

            {/* SENTENCE BUILD */}
{/* SENTENCE BUILD (TEACHER) */}
{q.type === "sentenceBuild" && (
  <div className="sentence-build">

    <input
      placeholder="Write a sentence"
      value={q.sentenceWords}
      onChange={e =>
        updateQuestion(i, "sentenceWords", e.target.value)
      }
    />
 
    <input
      placeholder="(+)"
      value={q.affirmative}
      onChange={e =>
        updateQuestion(i, "affirmative", e.target.value)
      }
    />

    <input
      placeholder="(-)"
      value={q.negative}
      onChange={e =>
        updateQuestion(i, "negative", e.target.value)
      }
    />

    <input
      placeholder="(?)"
      value={q.questionForm}
      onChange={e =>
        updateQuestion(i, "questionForm", e.target.value)
      }
    />

  </div>
)}

            {/* COMPLETE */}
            {q.type === "complete" && (
  <div className="complete-builder">

    <label className="complete-label">Word Box</label>
    <textarea
      className="complete-wordbox"
      placeholder="Word box (vergul bilan yozing)"
      value={q.wordBank}
      onChange={e => updateQuestion(i, "wordBank", e.target.value)}
    />

    <div className="complete-sentences">
      {q.sentences.map((s, si) => (
        <div key={si} className="complete-sentence">

          <input
            className="complete-text"
            placeholder="Gap (____ bilan)"
            value={s.text}
            onChange={e => {
              const copy = [...questions];
              copy[i].sentences[si].text = e.target.value;
              setQuestions(copy);
            }}
          />

          <input
            className="complete-answer"
            placeholder="To‘g‘ri so‘z"
            value={s.correctWord}
            onChange={e => {
              const copy = [...questions];
              copy[i].sentences[si].correctWord = e.target.value;
              setQuestions(copy);
            }}
          />
        </div>
      ))}
    </div>

    <button
      className="complete-add-btn"
      onClick={() => {
        const copy = [...questions];
        copy[i].sentences.push({ text: "", correctWord: "" });
        setQuestions(copy);
      }}
    >
      + Gap qo‘shish
    </button>

  </div>
)}


            {/* CORRECTION */}
            {q.type === "correction" && (
              <>
              <input placeholder="Xato gap" 
              value={q.wrongSentence}
              onChange={e => updateQuestion(i, "wrongSentence", e.target.value)}
              />

              <input placeholder="To'gri variant" 
              value={q.correctSentence}
              onChange={e => updateQuestion(i, "correctSentence", e.target.value)}
              />
              </>
            )}
            
          </div>
        ))}

<button className="addQuestion-btn" onClick={addQuestion}>Savol qo‘shish</button>

{!showReading && (
  <button
    className="add-reading-btn"
    onClick={() => setShowReading(true)}
  >
    + Reading qo‘shish
  </button>
)}

                    {/* ================= READING SECTION ================= */}

{showReading && (
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

  {/* SHORT ANSWER */}
  <h4>Short Answer</h4>

  {reading.shortAnswerQuestions.map((q, i) => (
  <div key={i} className="question-edit-card">

    <input
      placeholder="Savolni yozing"
      value={q.question}
      onChange={e => {
        const r = { ...reading };
        r.shortAnswerQuestions[i].question = e.target.value;
        setReading(r);
      }}
    />

    <textarea
      placeholder="Keywords (vergul bilan)"
      value={q.keywords.join(", ")}
      onChange={e => {
        const r = { ...reading };
        r.shortAnswerQuestions[i].keywords =
          e.target.value
            .split(",")
            .map(k => k.trim().toLowerCase());
        setReading(r);
      }}
    />

    <small>50% = 1 ball | 100% = 2 ball</small>

    <button
      className="shortAnswer-delete-btn"
      onClick={() => {
        const r = { ...reading };
        r.shortAnswerQuestions.splice(i, 1);
        setReading(r);
      }}
    >
      Delete
    </button>

  </div>
))}

<button onClick={addReadingShortAnswer}>
  + Short Answer Block qo‘shish
</button>

{/* TRANSLATION */}
<h4>Translation (Reading)</h4>

{reading.translationQuestions.map((q, i) => (
  <div key={i} className="reading-item">

    <input
      placeholder="Tarjima qilinadigan gap"
      value={q.sentence}
      onChange={e => {
        const arr = [...reading.translationQuestions];
        arr[i].sentence = e.target.value;
        setReading({ ...reading, translationQuestions: arr });
      }}
    />

    <input
      placeholder="To‘g‘ri tarjima"
      value={q.correctAnswer}
      onChange={e => {
        const arr = [...reading.translationQuestions];
        arr[i].correctAnswer = e.target.value;
        setReading({ ...reading, translationQuestions: arr });
      }}
    />

  </div>
))}
<button onClick={addReadingTranslation}>
  + Translation savol qo‘shish
</button>

</div>
)}

{!showWriting && (
  <button className="add-writing-btn"
  onClick={() => setShowWriting(true)}
  >
    + Writing qo'shish
  </button>
)}

{/* ================= WRITING SECTION ================= */}
{showWriting && (
  <div className="writing-section">
  <h3>Writing</h3>

  <input
    type="text"
    placeholder="Writing sarlavhasi"
    value={writingTask.title}
    onChange={e =>
      setWritingTask({ ...writingTask, title: e.target.value })
    }
  />

  <textarea
    rows={5}
    placeholder="Writing topshirig‘i (instruction)"
    value={writingTask.instruction}
    onChange={e =>
      setWritingTask({ ...writingTask, instruction: e.target.value })
    }
  />

  <div className="number-grid">
    <input
      type="number"
      placeholder="Minimal so‘zlar soni"
      value={writingTask.minWords}
      onChange={e =>
        setWritingTask({ ...writingTask, minWords: e.target.value })
      }
    />

    <input
      type="number"
      placeholder="Maksimal so‘zlar soni"
      value={writingTask.maxWords}
      onChange={e =>
        setWritingTask({ ...writingTask, maxWords: e.target.value })
      }
    />
  </div>

  <input
    type="number"
    placeholder="Writing bali"
    value={writingTask.points}
    onChange={e =>
      setWritingTask({ ...writingTask, points: e.target.value })
    }
  />
</div>
)}


        <div className="createExam-btn">
        <button onClick={createExam}>Imtihon yaratish</button>
        </div>
      </div>
    </div>
  );
}
