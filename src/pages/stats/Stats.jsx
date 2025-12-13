import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useParams } from "react-router-dom";

export default function Stats() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get(`/results/stats/${id}`);
      setStats(res.data);
    };
    fetchStats();
  }, [id]);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="stats-container">
      <h2>Statistika</h2>
      <p>Total: {stats.total}</p>
      <p>Passed: {stats.passed}</p>
      <p>Failed: {stats.failed}</p>

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Score</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {stats.results.map((r) => (
            <tr key={r._id}>
              <td>{r.studentId.name}</td>
              <td>{r.score}</td>
              <td>{r.percentage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
