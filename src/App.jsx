import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./pages/loginForm/LoginForm";
import StudentPanel from "./pages/student/StudentPanel";
import TeacherPanel from "./pages/teacher/TeacherPanel";
import TakeExam from "./pages/takeExam/TakeExam";
import ExamDetail from "./pages/examDetail/ExamDetail";
import Stats from "./pages/stats/Stats";
import "./App.css";

function App() {
  const [role, setRole] = useState(null);

  if (!role) {
    return <LoginForm setRole={setRole} />;
  }

  return (
    <BrowserRouter>
      <Routes>

        {role === "teacher" && (
          <>
            <Route path="/" element={<TeacherPanel />} />
            <Route path="/stats/:id" element={<Stats />} />
            <Route path="/exam/:id" element={<ExamDetail />} />
          </>
        )}

        {role === "student" && (
          <>
            <Route path="/" element={<StudentPanel />} />
          </>
        )}

        {/* UNIVERSAL ROUTE — IKKALA ROL HAM FOYDALANADI */}
        <Route path="/take/:id" element={<TakeExam />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
