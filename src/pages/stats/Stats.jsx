import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/api";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import "./Stats.css";

export default function Stats() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get(`/results/stats/${id}`)
      .then(res => setStats(res.data))
      .catch(err => {
        console.error("STATS ERROR:", err);
        alert("Statistikani olishda xatolik");
      });
  }, [id]);

  if (!stats) {
    return (
      <div className="loader-wrapper">
        <ClipLoader color="#2d5bff" size={55}/>
        <p>Yuklanmoqda...</p>
      </div>
    )
  };

  return (
    <div className="stats-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
      <MdOutlineKeyboardBackspace className="back-icon" /> Back
      </button>
      <h2>Imtihon statistikasi</h2>

      <div className="stats-cards">
        <p>Topshirganlar: {stats.total}</p>
        <p>O‘tganlar: {stats.passed}</p>
        <p>Yiqilganlar: {stats.failed}</p>
      </div>

      <div className="stats-table-wrapper">
      <table>
        <thead>
          <tr className="table-title">
            <th><span className="th-text1">Ism</span></th>
            <th><span className="th-text">Foiz</span></th>
            <th><span className="th-text3">Holat</span></th>
            <th><span className="th-text4">Sana</span></th>
          </tr>
        </thead>
        <tbody>
  {stats.results.map(r => (
    <tr key={r._id}>
      <td className="col-name" data-label="Ism">{r.studentName}</td>
      <td data-label="Foiz">{r.percentage}%</td>
      <td data-label="Holat">
        <span
        className={
          r.status === "passed"
          ? "status-pass"
          : r.status === "failed"
          ? "status-fail"
          : "status-pending"
        }
        >
          {r.status ==="passed"
          ? "O'tdi"
          : r.status === "failed"
          ? "Yiqildi"
          : "Tekshirilmoqda"
          }

          {r.writingChecked && (
            <span className="writing-inline">
              {" "} (Writing {r.writingScore} / {r.writingMax})
            </span>
          )}
          </span>
</td>
      <td data-label="Sana">
        {new Date(r.createdAt).toLocaleString()}
      </td>
    </tr>
  ))}
</tbody>

      </table>
      </div>
    </div>
  );
}
