import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { api } from "./api/api";

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
import WritingList from "./pages/teacher/WritingList";
import WritingCheck from "./pages/teacher/WritingCheck";
import SelectRole from "./pages/selectRole/SelectRole";

function App() {

  useEffect(() => {
    api.get("/ping").catch(() => {});
  }, []);

  const [role, setRole] = useState(null);
  const location = useLocation(); // ✅ endi to‘g‘ri

  const hideNavbar = 
  location.pathname.startsWith("/login") ||
  location.pathname === "/select-role";

  return (
    <>
      <ToastContainer />

      {!hideNavbar && <Navbar role={role} setRole={setRole} />}

      <Routes>
        {/* ROLE TANLASH */}
        <Route path="/select-role" element={<SelectRole/>} />

        <Route
          path="/login/:role"
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
            <Route path="/teacher/writings" element={<WritingList />} />
            <Route path="/teacher/writings/:id" element={<WritingCheck />} />

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
          element={<Navigate to={role ? "/" : "/select-role"} />}
        />
      </Routes>
    </>
  );
}

export default App;
