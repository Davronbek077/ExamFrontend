import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginForm from "./pages/loginForm/LoginForm";
import StudentPanel from "./pages/student/StudentPanel";
import ExamDetail from "./pages/examDetail/ExamDetail";
import Stats from "./pages/stats/Stats";
import TeacherDashboard from "./pages/teacher/TeacherPanel";
import CreateExam from "./pages/teacher/CreateExam";
import ExamsList from "./pages/teacher/ExamList";
import TakeExam from "./pages/TakeExam/TakeExam";
import EditExam from "./pages/editExam/EditExam";
import Navbar from "./components/navbar/Navbar";

function App() {
  const [role, setRole] = useState(null);
  const location = useLocation(); // ✅ endi to‘g‘ri

  return (
    <>
      <ToastContainer />

      {/* LOGINdan boshqa hamma sahifada Navbar chiqadi */}
      {location.pathname !== "/login" && (
        <Navbar role={role} setRole={setRole} />
      )}

      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={<LoginForm setRole={setRole} />}
        />

        {/* TEACHER */}
        {role === "teacher" && (
          <>
            <Route path="/" element={<TeacherDashboard />} />
            <Route path="/teacher/create" element={<CreateExam />} />
            <Route path="/teacher/exams" element={<ExamsList />} />
            <Route path="/stats/:id" element={<Stats />} />
            <Route path="/exam/:id" element={<ExamDetail />} />
            <Route path="/exams/edit/:id" element={<EditExam />} />
          </>
        )}

        {/* STUDENT */}
        {role === "student" && (
          <>
            <Route path="/" element={<StudentPanel />} />
            <Route path="/take/:id" element={<TakeExam />} />
          </>
        )}

        {/* DEFAULT */}
        <Route
          path="*"
          element={<Navigate to={role ? "/" : "/login"} />}
        />
      </Routes>
    </>
  );
}

export default App;
