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

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestionType, setNewQuestionType] = useState("");
  const [shortAnswerKeywordInputs, setShortAnswerKeywordInputs] = useState({});

  /* ================= LOAD EXAM ================= */
  useEffect(() => {
    api.get(`/exams/${id}`)
      .then(res => {
        setExam(res.data);
        setLoading(false);
      })
      .catch(() => {
        alert("Exam yuklanmadi");
        setLoading(false);
      });
  }, [id]);

  /* ================= HELPERS ================= */
  const updateArray = (field, index, key, value) => {
    const copy = [...(exam[field] || [])];
    copy[index] = { ...copy[index], [key]: value };
    setExam({ ...exam, [field]: copy });
  };

  const updateNestedArray = (field, index, nested, nestedIndex, value) => {
    const copy = exam[field].map((item, i) => {
      if (i !== index) return item;
  
      return {
        ...item,
        [nested]: item[nested].map((n, ni) =>
          ni === nestedIndex ? value : n
        )
      };
    });
  
    setExam({ ...exam, [field]: copy });
  };  

  const deleteFromArray = (field, index) => {
    const copy = [...(exam[field] || [])];
    copy.splice(index, 1);
    setExam({ ...exam, [field]: copy });
  };

  const addToArray = (field, emptyItem) => {
    const copy = [...(exam[field] || [])];
    copy.push(emptyItem);
    setExam({ ...exam, [field]: copy });
  };

  const addQuestionByType = (type) => {

    console.log("🟡 ADD QUESTION CLICKED");
    console.log("➡️ TYPE:", type);
    console.log("📦 BEFORE EXAM:", exam);
    const questionTemplates = {
      mcq: {
        field: "questions",
        data: {
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          points: 1
        }
      },
  
      truefalse: {
        field: "questions",
        data: {
          questionText: "",
          correctAnswer: "true",
          points: 1
        }
      },
  
      gapfill: {
        field: "questions",
        data: {
          questionText: "",
          correctAnswer: "",
          points: 1
        }
      },
  
      translate: {
        field: "translateQuestions",
        data: {
          word: "",
          correctAnswer: "",
          points: 1
        }
      },
  
      complete: {
        field: "completeQuestions",
        data: {
          wordBank: [],
          sentences: [{ text: "", correctWord: "" }],
          pointsPerSentence: 1
        }
      },
  
      correction: {
        field: "correctionQuestions",
        data: {
          wrongSentence: "",
          correctSentence: "",
          points: 1
        }
      },
  
      grammar: {
        field: "grammarQuestions",
        data: {
          scrambledWords: "",
          correctSentence: "",
          points: 1
        }
      },
  
      sentenceBuild: {
        field: "sentenceBuildQuestions",
        data: {
          words: [],
          affirmative: "",
          negative: "",
          question: "",
          points: 3
        }
      },
  
      tense: {
        field: "tenseTransforms",
        data: {
          baseSentence: "",
          transforms: []
        }
      }
    };
  
    const config = questionTemplates[type];
    if (!config) return;
  
    setExam(prev => ({
      ...prev,
      [config.field]: [...(prev[config.field] || []), config.data]
    }));
  
    setShowAddQuestion(false);
    setNewQuestionType("");
  };  


  const saveExam = async () => {
    try {
      if (!exam.level) {
        toast.error("Imtihon darajasini tanlang")
        return;
      }
      
      const payload = { ...exam };
  
      // ❌ agar passage yo‘q va savollar ham yo‘q bo‘lsa
      if (
        payload.reading &&
        !payload.reading.passage?.trim() &&
        !payload.reading.tfQuestions?.length &&
        !payload.reading.gapQuestions?.length &&
        !payload.reading.shortAnswerQuestions?.length &&
        !payload.reading.translationQuestions?.length
      ) {
        delete payload.reading;
      }
  
      await api.put(`/exams/${exam._id}`, payload);
      toast.success("Imtihon saqlandi");
      navigate(-1);
    } catch (err) {
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);
      console.log("FULL ERROR:", err);
      toast.error(err.response?.data?.message || "Saqlashda xatolik");
    }
    
  };    

  /* ================= LOADING ================= */
  if (loading || !exam) {
    return (
      <div className="loader-wrapper">
        <ClipLoader size={45} color="#2d5bff" />
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="edit-exam">

      <button className="back-btn" onClick={() => navigate(-1)}>
        <MdOutlineKeyboardBackspace /> Orqaga
      </button>

      <h2>Edit Exam</h2>

      {/* ================= BASIC INFO ================= */}
      <div className="basic-info">
        <input
          placeholder="Imtihon nomi"
          value={exam.title || ""}
          onChange={e => setExam({ ...exam, title: e.target.value })}
        />

        <input
          type="number"
          placeholder="Vaqt (daqiqa)"
          value={exam.timeLimit || ""}
          onChange={e => setExam({ ...exam, timeLimit: e.target.value })}
        />

        <input
          type="number"
          placeholder="O‘tish foizi"
          value={exam.passPercentage || ""}
          onChange={e =>
            setExam({ ...exam, passPercentage: e.target.value })
          }
        />

        <select value={exam.level || ""}
        onChange={e => setExam({...exam, level: e.target.value})}
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

      <>
  <h3>Listening True / False</h3>

  {exam.listeningTF?.map((q, i) => (
    <div key={i} className="question-card">
      <input
        placeholder="Gap"
        value={q.statement || ""}
        onChange={e =>
          updateArray("listeningTF", i, "statement", e.target.value)
        }
      />

      <select
        value={String(q.correct)}
        onChange={e =>
          updateArray(
            "listeningTF",
            i,
            "correct",
            e.target.value === "true"
          )
        }
      >
        <option value="true">True</option>
        <option value="false">False</option>
      </select>

      <button
        className="delete-btn"
        onClick={() => deleteFromArray("listeningTF", i)}
      >
        Delete
      </button>
    </div>
  ))}

  <button
    className="add-btn"
    onClick={() =>
      addToArray("listeningTF", {
        statement: "",
        correct: true
      })
    }
  >
    + Add Listening True / False
  </button>
</>

<>
  <h3>Listening Gap</h3>

  {exam.listeningGaps?.map((q, i) => (
    <div key={i} className="question-card">
      <input
        placeholder="Gapli gap"
        value={q.sentence || ""}
        onChange={e =>
          updateArray("listeningGaps", i, "sentence", e.target.value)
        }
      />

      <input
        placeholder="To‘g‘ri so‘z"
        value={q.correctWord || ""}
        onChange={e =>
          updateArray("listeningGaps", i, "correctWord", e.target.value)
        }
      />

      <button
        className="delete-btn"
        onClick={() => deleteFromArray("listeningGaps", i)}
      >
        Delete
      </button>
    </div>
  ))}

  <button
    className="add-btn"
    onClick={() =>
      addToArray("listeningGaps", {
        sentence: "",
        correctWord: ""
      })
    }
  >
    + Add Listening Gap
  </button>
</>

      <hr />

<button
  className="add-btn"
  onClick={() => setShowAddQuestion(prev => !prev)}
>
  + Savol qo‘shish
</button>

{showAddQuestion && (
  <div className="add-question-box">
    <h4>Savol turini tanlang</h4>

    <select
      defaultValue=""
      onChange={(e) => {
        const type = e.target.value;

        if (!type) return;

        console.log("✅ SELECTED:", type);
        addQuestionByType(type);

        e.target.value = ""; // reset
      }}
    >
      <option value="" disabled>
        Savol turini tanlang
      </option>

      <option value="mcq">Test (MCQ)</option>
      <option value="truefalse">True / False</option>
      <option value="gapfill">Gap Fill</option>
      <option value="translate">Translate</option>
      <option value="complete">Complete</option>
      <option value="correction">Correction</option>
      <option value="grammar">Grammar</option>
      <option value="sentenceBuild">Sentence Build</option>
      <option value="tense">Tense Transform</option>
    </select>
  </div>
)}

      {/* ================= TEST QUESTIONS ================= */}
      {exam.questions?.length > 0 && (
        <>
          <h3>Test savollar</h3>
          {exam.questions.map((q, i) => (
            <div key={i} className="question-card">
              <input
                placeholder="Savol"
                value={q.questionText}
                onChange={e =>
                  updateArray("questions", i, "questionText", e.target.value)
                }
              />

              {q.options?.map((opt, oi) => (
                <input
                  key={oi}
                  placeholder={`Variant ${oi + 1}`}
                  value={opt}
                  onChange={e =>
                    updateNestedArray("questions", i, "options", oi, e.target.value)
                  }
                />
              ))}

              <input
                placeholder="To‘g‘ri javob"
                value={q.correctAnswer}
                onChange={e =>
                  updateArray("questions", i, "correctAnswer", e.target.value)
                }
              />

              <button onClick={() => deleteFromArray("questions", i)}>Delete</button>
            </div>
          ))}

<button
  className="add-btn"
  onClick={() =>
    addToArray("questions", {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: ""
    })
  }
>
  + Add Test Question
</button>
        </>
      )}

      {/* ================= SENTENCE BUILD ================= */}
      {exam.sentenceBuildQuestions?.length > 0 && (
        <>
          <h3>Sentence Build</h3>
          {exam.sentenceBuildQuestions.map((q, i) => (
            <div key={i} className="question-card">
              <input
                placeholder="Affirmative"
                value={q.affirmative}
                onChange={e =>
                  updateArray("sentenceBuildQuestions", i, "affirmative", e.target.value)
                }
              />
              <input
                placeholder="Negative"
                value={q.negative}
                onChange={e =>
                  updateArray("sentenceBuildQuestions", i, "negative", e.target.value)
                }
              />
              <input
                placeholder="Question"
                value={q.question}
                onChange={e =>
                  updateArray("sentenceBuildQuestions", i, "question", e.target.value)
                }
              />
              <button onClick={() => deleteFromArray("sentenceBuildQuestions", i)}>Delete</button>
            </div>
          ))}

<button
  className="add-btn"
  onClick={() =>
    addToArray("sentenceBuildQuestions", {
      words: [],
      affirmative: "",
      negative: "",
      question: ""
    })
  }
>
  + Add Sentence Build
</button>
        </>
      )}

      {/* ================= TENSE TRANSFORM ================= */}
{exam.tenseTransforms?.length > 0 && (
  <>
    <h3>Tense Transform</h3>

    {exam.tenseTransforms.map((t, i) => (
      <div key={i} className="question-card">

        <input
          placeholder="Base sentence"
          value={t.baseSentence || ""}
          onChange={e =>
            updateArray("tenseTransforms", i, "baseSentence", e.target.value)
          }
        />

        {t.transforms?.map((tr, ti) => (
          <div key={ti} className="nested-card">
            <input
              placeholder="Tense"
              value={tr.tense || ""}
              onChange={e => {
                const copy = [...exam.tenseTransforms];
                copy[i].transforms[ti].tense = e.target.value;
                setExam({ ...exam, tenseTransforms: copy });
              }}
            />

            <input
              placeholder="Correct sentence"
              value={tr.correctSentence || ""}
              onChange={e => {
                const copy = [...exam.tenseTransforms];
                copy[i].transforms[ti].correctSentence = e.target.value;
                setExam({ ...exam, tenseTransforms: copy });
              }}
            />

            <button
              onClick={() => {
                const copy = [...exam.tenseTransforms];
                copy[i].transforms.splice(ti, 1);
                setExam({ ...exam, tenseTransforms: copy });
              }}
            >
              Delete
            </button>
          </div>
        ))}

        <button
          className="add-btn"
          onClick={() => {
            const copy = [...exam.tenseTransforms];
            copy[i].transforms.push({
              tense: "",
              correctSentence: "",
              points: 1
            });
            setExam({ ...exam, tenseTransforms: copy });
          }}
        >
          + Add Transform
        </button>

        <button onClick={() => deleteFromArray("tenseTransforms", i)}>
          Delete Block
        </button>
      </div>
    ))}

    <button
      className="add-btn"
      onClick={() =>
        addToArray("tenseTransforms", {
          baseSentence: "",
          transforms: []
        })
      }
    >
      + Add Tense Block
    </button>
  </>
)}

{exam.grammarQuestions?.length > 0 && (
  <>
    <h3>Grammar</h3>

    {exam.grammarQuestions.map((q, i) => (
      <div key={i} className="question-card">

        <input
          placeholder="Aralashtirilgan so‘zlar"
          value={q.scrambledWords}
          onChange={e =>
            updateArray("grammarQuestions", i, "scrambledWords", e.target.value)
          }
        />

        <input
          placeholder="To‘g‘ri gap"
          value={q.correctSentence}
          onChange={e =>
            updateArray("grammarQuestions", i, "correctSentence", e.target.value)
          }
        />

        <button
          className="delete-btn"
          onClick={() => deleteFromArray("grammarQuestions", i)}
        >
          Delete
        </button>

      </div>
    ))}
  </>
)}


      {/* ================= TRANSLATE ================= */}
      {exam.translateQuestions?.length > 0 && (
        <>
          <h3>Translate</h3>
          {exam.translateQuestions.map((q, i) => (
            <div key={i} className="question-card">
              <input
                placeholder="So‘z"
                value={q.word}
                onChange={e =>
                  updateArray("translateQuestions", i, "word", e.target.value)
                }
              />
              <input
                placeholder="Javob"
                value={q.correctAnswer}
                onChange={e =>
                  updateArray("translateQuestions", i, "correctAnswer", e.target.value)
                }
              />
              <button onClick={() => deleteFromArray("translateQuestions", i)}>Delete</button>
            </div>
          ))}

<button
  className="add-btn"
  onClick={() =>
    addToArray("translateQuestions", {
      word: "",
      correctAnswer: ""
    })
  }
>
  + Add Translate
</button>
        </>
      )}

{exam.completeQuestions?.length > 0 && (
  <>
    <h3>Complete</h3>

    {exam.completeQuestions.map((q, i) => (
      <div key={i} className="question-card">

        <input
          placeholder="Word bank (vergul bilan)"
          value={(q.wordBank || []).join(", ")}
          onChange={e =>
            updateArray(
              "completeQuestions",
              i,
              "wordBank",
              e.target.value.split(",").map(w => w.trim())
            )
          }
        />

        {q.sentences.map((s, si) => (
          <div key={si} className="nested-card">
            <input
              placeholder="Gap"
              value={s.text}
              onChange={e => {
                const copy = [...exam.completeQuestions];
                copy[i].sentences[si].text = e.target.value;
                setExam({ ...exam, completeQuestions: copy });
              }}
            />
          </div>
        ))}

        <button
          className="add-btn"
          onClick={() => {
            const copy = [...exam.completeQuestions];
            copy[i].sentences.push({ text: "", correctWord: "" });
            setExam({ ...exam, completeQuestions: copy });
          }}
        >
          + Add Sentence
        </button>

        <button
          className="delete-btn"
          onClick={() => deleteFromArray("completeQuestions", i)}
        >
          Delete
        </button>

      </div>
    ))}
  </>
)}

{exam.correctionQuestions?.length > 0 && (
  <>
    <h3>Correction</h3>

    {exam.correctionQuestions.map((q, i) => (
      <div key={i} className="question-card">

        <input
          placeholder="Xato gap"
          value={q.wrongSentence}
          onChange={e =>
            updateArray("correctionQuestions", i, "wrongSentence", e.target.value)
          }
        />

        <input
          placeholder="To‘g‘ri gap"
          value={q.correctSentence}
          onChange={e =>
            updateArray("correctionQuestions", i, "correctSentence", e.target.value)
          }
        />

        <button
          className="delete-btn"
          onClick={() => deleteFromArray("correctionQuestions", i)}
        >
          Delete
        </button>

      </div>
    ))}
  </>
)}


{exam.reading && (
  <>
    <h3>Reading</h3>

    {/* READING TEXT */}
    {exam.reading.passage && (
      <textarea
        value={exam.reading.passage}
        onChange={e =>
          setExam({
            ...exam,
            reading: { ...exam.reading, passage: e.target.value }
          })
        }
      />
    )}

    {/* TRUE / FALSE / NOT GIVEN */}
    {exam.reading.tfQuestions?.length > 0 && (
      <>
        <h4>True / False / Not Given</h4>
        {exam.reading.tfQuestions.map((q, i) => (
          <div key={i} className="question-card">
            <input
              value={q.statement}
              onChange={e => {
                setExam(prev => ({
                  ...prev,
                  reading: {
                    ...prev.reading,
                    tfQuestions: prev.reading.tfQuestions.map((item, idx) =>
                      idx === i ? { ...item, statement: e.target.value } : item
                    )
                  }
                }));
              }}                           
            />
            <select
  value={q.correct}
  onChange={e => {
    setExam(prev => ({
      ...prev,
      reading: {
        ...prev.reading,
        tfQuestions: prev.reading.tfQuestions.map((item, idx) =>
          idx === i
            ? { ...item, correct: e.target.value }
            : item
        )
      }
    }));
  }}
>
  <option value="true">True</option>
  <option value="false">False</option>
  <option value="not_given">Not Given</option>
</select>

<button
  className="delete-btn"
  onClick={() => {
    setExam(prev => ({
      ...prev,
      reading: {
        ...prev.reading,
        tfQuestions: prev.reading.tfQuestions.filter((_, idx) => idx !== i)
      }
    }));
  }}
>
  Delete
</button>

          </div>
        ))}
        <button
  className="add-btn"
  onClick={() => {
    const copy = { ...exam.reading };
    copy.tfQuestions.push({
      statement: "",
      correct: "true"
    });    
    setExam({ ...exam, reading: copy });
  }}
>
  + Add Reading TF
</button>
      </>
    )}

    {/* GAP */}
    {exam.reading.gapQuestions?.length > 0 && (
      <>
        <h4>Gap</h4>
        {exam.reading.gapQuestions.map((q, i) => (
          <div key={i} className="question-card">
            <input
              value={q.sentence}
              onChange={e => {
                setExam(prev => ({
                  ...prev,
                  reading: {
                    ...prev.reading,
                    gapQuestions: prev.reading.gapQuestions.map((q, idx) =>
                      idx === i ? { ...q, sentence: e.target.value } : q
                    )
                  }
                }));
              }}              
            />
            
            <input
              value={q.correctWord}
              onChange={e => {
                setExam(prev => ({
                  ...prev,
                  reading: {
                    ...prev.reading,
                    gapQuestions: prev.reading.gapQuestions.map((q, idx) =>
                      idx === i ? { ...q, correctWord: e.target.value } : q
                    )
                  }
                }));
              }}              
            />

<button
  className="delete-btn"
  onClick={() => {
    setExam(prev => ({
      ...prev,
      reading: {
        ...prev.reading,
        gapQuestions: prev.reading.gapQuestions.filter((_, idx) => idx !== i)
      }
    }));
  }}
>
  Delete
</button>
          </div>
        ))}
        <button
  className="add-btn"
  onClick={() => {
    const copy = { ...exam.reading };
    copy.gapQuestions.push({ sentence: "", correctWord: "" });
    setExam({ ...exam, reading: copy });
  }}
>
  + Add Reading Gap
</button>

      </>
    )}

    {/* SHORT ANSWER */}
{exam.reading.shortAnswerQuestions?.length > 0 && (
  <>
    <h4>Short Answer</h4>

    {exam.reading.shortAnswerQuestions.map((q, i) => (
      <div key={i} className="question-card">
        <input
          placeholder="Savol"
          value={q.question}
          onChange={e => {
            setExam(prev => ({
              ...prev,
              reading: {
                ...prev.reading,
                shortAnswerQuestions:
                  prev.reading.shortAnswerQuestions.map((item, idx) =>
                    idx === i ? { ...item, question: e.target.value } : item
                  )
              }
            }));
          }}
        />

<textarea
  className="edit-shortanswer-keywords"
  placeholder="Kalit so‘zlar (vergul bilan)"
  value={
    shortAnswerKeywordInputs[i] ??
    (q.keywords || []).join(", ")
  }
  onChange={e => {
    const value = e.target.value;

    setShortAnswerKeywordInputs(prev => ({
      ...prev,
      [i]: value
    }));

    const keywords = value
      .split(",")
      .map(k => k.trim().toLowerCase())
      .filter(Boolean);

    setExam(prev => ({
      ...prev,
      reading: {
        ...prev.reading,
        shortAnswerQuestions:
          prev.reading.shortAnswerQuestions.map((item, idx) =>
            idx === i ? { ...item, keywords } : item
          )
      }
    }));
  }}
/>

        <button
          className="delete-btn"
          onClick={() => {
            setExam(prev => ({
              ...prev,
              reading: {
                ...prev.reading,
                shortAnswerQuestions:
                  prev.reading.shortAnswerQuestions.filter(
                    (_, idx) => idx !== i
                  )
              }
            }));
          }}
        >
          Delete
        </button>
      </div>
    ))}
  </>
)}

<button
  className="add-btn"
  onClick={() => {
    setExam(prev => ({
      ...prev,
      reading: {
        ...(prev.reading || {}),
        shortAnswerQuestions: [
          ...(prev.reading?.shortAnswerQuestions || []),
          {
            question: "",
            keywords: [],
            maxPoints: 2
          }
        ]
      }
    }));
  }}
>
  + Add Reading Short Answer
</button>


{/* READING TRANSLATE */}
{exam.reading.translationQuestions?.length > 0 && (
  <>
    <h4>Reading Translate</h4>

    {exam.reading.translationQuestions.map((q, i) => (
      <div key={i} className="question-card">
        <input
          placeholder="So‘z / Gap"
          value={q.sentence || ""}
          onChange={e => {
            setExam(prev => ({
              ...prev,
              reading: {
                ...prev.reading,
                translationQuestions: prev.reading.translationQuestions.map((item, idx) =>
                  idx === i ? { ...item, sentence: e.target.value } : item
                )
              }
            }));
          }}
        />

        <input
          placeholder="To‘g‘ri tarjima"
          value={q.correctAnswer || ""}
          onChange={e => {
            setExam(prev => ({
              ...prev,
              reading: {
                ...prev.reading,
                translationQuestions: prev.reading.translationQuestions.map((item, idx) =>
                  idx === i
                    ? { ...item, correctAnswer: e.target.value }
                    : item
                )
              }
            }));
          }}
        />

        <button
          className="delete-btn"
          onClick={() => {
            setExam(prev => ({
              ...prev,
              reading: {
                ...prev.reading,
                translationQuestions:
                  prev.reading.translationQuestions.filter((_, idx) => idx !== i)
              }
            }));
          }}
        >
          Delete
        </button>
      </div>
    ))}
  </>
)}

{exam.reading.translationQuestions?.length === 0 && (
  <button
    className="add-btn"
    onClick={() => {
      setExam(prev => ({
        ...prev,
        reading: {
          ...prev.reading,
          translationQuestions: [
            {
              sentence: "",
              correctAnswer: "",
              points: 1
            }
          ]
        }
      }));
    }}
  >
    + Add Reading Translate
  </button>
)}


</>
)}

      {/* ================= WRITING ================= */}
{exam.writingTask && (
  <>
    <h3>Writing</h3>

    <input
      placeholder="Writing sarlavhasi"
      value={exam.writingTask.title || ""}
      onChange={e =>
        setExam({
          ...exam,
          writingTask: {
            ...exam.writingTask,
            title: e.target.value
          }
        })
      }
    />

    <textarea
      placeholder="Writing topshirig‘i"
      value={exam.writingTask.instruction || ""}
      onChange={e =>
        setExam({
          ...exam,
          writingTask: {
            ...exam.writingTask,
            instruction: e.target.value
          }
        })
      }
    />

    <div className="number-grid">
      <input
        type="number"
        placeholder="Minimal so‘zlar"
        value={exam.writingTask.minWords || ""}
        onChange={e =>
          setExam({
            ...exam,
            writingTask: {
              ...exam.writingTask,
              minWords: e.target.value
            }
          })
        }
      />

      <input
        type="number"
        placeholder="Maksimal so‘zlar"
        value={exam.writingTask.maxWords || ""}
        onChange={e =>
          setExam({
            ...exam,
            writingTask: {
              ...exam.writingTask,
              maxWords: e.target.value
            }
          })
        }
      />
    </div>

    <input
      type="number"
      placeholder="Writing bali"
      value={exam.writingTask.points || ""}
      onChange={e =>
        setExam({
          ...exam,
          writingTask: {
            ...exam.writingTask,
            points: e.target.value
          }
        })
      }
    />
  </>
)}
      {!exam.writingTask && (
  <button
    className="add-btn"
    onClick={() =>
      setExam({
        ...exam,
        writingTask: {
          title: "",
          instruction: "",
          minWords: "",
          maxWords: "",
          points: ""
        }
      })
    }
  >
    + Add Writing Task
  </button>
)}

      <button className="save-btn" onClick={saveExam}>
        Ma'lumotlarni Saqlash
      </button>
    </div>
  );
}
