
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
        listeningGaps
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
    <div className="admin-dashboard">
      <h2 className="adminDashboard-title">Admin Dashboard</h2>
  
  {/* STATISTICS */}
  <div className="stats-grid">
    <div className="stat-card info">
      <h4>Jami topshirganlar</h4>
      <p>{stats?.total || 0}</p>
    </div>

    <div className="stat-card success">
      <h4>O‘tganlar</h4>
      <p>{stats?.passed || 0}</p>
    </div>

    <div className="stat-card danger">
      <h4>Yiqilganlar</h4>
      <p>{stats?.failed || 0}</p>
    </div>

    <div className="stat-card info">
      <h4>Bugun topshirganlar</h4>
      <p>{stats?.today || 0}</p>
    </div>
  </div>

  {/* QUICK MENU */}
  <div className="quick-menu">
    <h3>Tezkor menyu</h3>

    <div className="menu-buttons">
      <button onClick={() => navigate("/teacher/create")}>
        Imtihon qo‘shish
      </button>

      <button onClick={() => navigate("/teacher/exams")}>
        Imtihonlar ro‘yxati
      </button>
    </div>
  </div>
    </div>
  );
  
}
