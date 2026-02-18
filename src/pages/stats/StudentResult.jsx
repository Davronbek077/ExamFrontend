import React, {useEffect, useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../api/api'
import { MdOutlineKeyboardBackspace } from "react-icons/md"
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import "./Stats.css"

const StudentResult = () => {
    const {resultId} = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);

    useEffect(() => {
        api.get(`/results/${resultId}`)
        .then(res => setResult(res.data))
        .catch(err => {
            console.error("RESULT ERROR:", err);
            toast.error("Natijalarni olishda hatolik");
        });
    }, [resultId]);

    if (!result) {
        return (
            <div className="loader-wrapper">
                <ClipLoader color="#2d5bff" size={55} />
                <p>Yuklanmoqda...</p>
            </div>
        );
    }

    const correctAnswers = result.answers.filter(a => a.isCorrect);
    const wrongAnswers = result.answers.filter(a => !a.isCorrect);

  return (
    <div className='student-result-container'>
        <button className="back-btn" onClick={() => navigate(-1)}>
        <MdOutlineKeyboardBackspace /> Back
      </button>

      <h2 className='student-result-title'>{result.studentName} — Test natijasi</h2>

      <div className="result-summary">
        <div className="summary-card correctt">
            To'g'ri javoblar: {correctAnswers.length}
        </div>
        
        <div className="summary-card wrong">
            Noto'g'ri javoblar: {wrongAnswers.length}
        </div>

        <div className="summary-card total">
            Jami savollar: {result.answers.length}
        </div>
      </div>

      <hr />

      <h3 className='studentResult-correct-answer'>To'g'ri javoblar</h3>
      {correctAnswers.map((ans, i) => (
        <div key={i} className="answer-card correct">
            <p><b>{i +1}) Savol:</b> {ans.questionText}</p>
            <p><b>O'quvchi javobi:</b> {ans.studentAnswer}</p>
        </div>
      ))}

       <h3 className='studentResult-wrong-answer'>Noto'g'ri javoblar</h3>
      {wrongAnswers.map((ans, i) => (
        <div key={i} className="answer-card wrong">
          <p><b>{i + 1}) Savol:</b> {ans.questionText}</p>
          <p><b>To'g'ri javob:</b> {ans.correctAnswer}</p>
          <p><b>O'quvchi javobi:</b> {ans.studentAnswer}</p>
        </div>
      ))}
    </div>
  )
}

export default StudentResult
