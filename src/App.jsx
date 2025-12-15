import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginForm from "./pages/loginForm/LoginForm";
import StudentPanel from "./pages/student/StudentPanel";
import TakeExam from "./pages/takeExam/takeExam";
import ExamDetail from "./pages/examDetail/ExamDetail";
import Stats from "./pages/stats/Stats";

import TeacherDashboard from "./pages/teacher/TeacherPanel";
import CreateExam from "./pages/teacher/CreateExam";
import ExamsList from "./pages/teacher/ExamList";

function App() {
  const [role, setRole] = useState(null);

  return (
    <BrowserRouter>
      <Routes>

        {/* ===== LOGIN ===== */}
        <Route
          path="/login"
          element={<LoginForm setRole={setRole} />}
        />

        {/* ===== TEACHER ROUTES ===== */}
        {role === "teacher" && (
          <>
            <Route path="/" element={<TeacherDashboard />} />
            <Route path="/teacher/create" element={<CreateExam />} />
            <Route path="/teacher/exams" element={<ExamsList />} />
            <Route path="/stats/:id" element={<Stats />} />
            <Route path="/exam/:id" element={<ExamDetail />} />
          </>
        )}

        {/* ===== STUDENT ROUTES ===== */}
        {role === "student" && (
          <>
            <Route path="/" element={<StudentPanel />} />
            <Route path="/take/:id" element={<TakeExam />} />
            <Route path="/exam/:id" element={<ExamDetail />} />
          </>
        )}

        {/* ===== DEFAULT ===== */}
        <Route
          path="*"
          element={<Navigate to={role ? "/" : "/login"} />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
