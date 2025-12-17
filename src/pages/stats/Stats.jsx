import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/api";
import "./Stats.css";

export default function Stats() {
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

  if (!stats) return <p>Yuklanmoqda...</p>;

  return (
    <div className="stats-container">
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
  <span className={r.passed ? "status-pass" : "status-fail"}>
    {r.passed ? "O‘tdi" : "Yiqildi"}
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
