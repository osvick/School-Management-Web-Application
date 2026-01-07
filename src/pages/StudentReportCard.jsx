import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import DashboardLayout from "../components/DashboardLayout";
import { generateReportPDF } from "../utils/generateReportPDF";
import { getAcademicContext } from "../utils/getAcademicContext";

export default function StudentReportCard() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = auth.currentUser?.uid;

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const context = await getAcademicContext();

        // ✅ CONSISTENT RESULT ID FORMAT
        const resultId = `${context.sessionId}_${context.termId}_${studentId}`;

        const snap = await getDoc(doc(db, "results", resultId));

        // ✅ Only show if result exists AND is published
        if (snap.exists() && snap.data().published === true) {
          setResult(snap.data());
        } else {
          setResult(null);
        }
      } catch (err) {
        console.error("Error fetching result", err);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [studentId]);

  if (loading) {
    return (
      <DashboardLayout role="student">
        <p>Loading report card...</p>
      </DashboardLayout>
    );
  }

  if (!result) {
    return (
      <DashboardLayout role="student">
        <p>No published result available yet.</p>
      </DashboardLayout>
    );
  }

  const subjects = Object.entries(result.subjects || {});

  // ✅ GPA calculation (safe)
  const overallGPA =
    subjects.length > 0
      ? subjects.reduce((sum, [, s]) => sum + Number(s.gpa || 0), 0) /
        subjects.length
      : 0;

  return (
    <DashboardLayout role="student">
      <h1 className="text-2xl font-bold mb-4">
        My Report Card
      </h1>

      {/* 🔹 Academic Info */}
      <div className="mb-4 text-sm text-gray-700">
        <p>
          <strong>Session:</strong> {result.sessionName}
        </p>
        <p>
          <strong>Term:</strong> {result.termName}
        </p>
        <p>
          <strong>Class Position:</strong>{" "}
          {result.rank ? `${result.rank}${getOrdinal(result.rank)}` : "—"}
        </p>
      </div>

      {/* 🔹 Subject Scores */}
      <table className="w-full bg-white rounded shadow mb-4">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Subject</th>
            <th className="p-2">CA</th>
            <th className="p-2">Exam</th>
            <th className="p-2">Total</th>
            <th className="p-2">Grade</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map(([subject, s]) => (
            <tr key={subject} className="border-t">
              <td className="p-2">{subject}</td>
              <td className="p-2 text-center">{s.ca}</td>
              <td className="p-2 text-center">{s.exam}</td>
              <td className="p-2 text-center">{s.total}</td>
              <td className="p-2 text-center font-semibold">{s.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 GPA */}
      <p className="font-semibold mb-4">
        Overall GPA: {overallGPA.toFixed(2)}
      </p>

      {/* 🔹 PDF */}
      <button
        onClick={() =>
          generateReportPDF({
            studentId,
            result,
            overallGPA,
          })
        }
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Download PDF Report
      </button>
    </DashboardLayout>
  );
}

/* ===================== */
/* HELPERS */
/* ===================== */
function getOrdinal(n) {
  if (n % 10 === 1 && n !== 11) return "st";
  if (n % 10 === 2 && n !== 12) return "nd";
  if (n % 10 === 3 && n !== 13) return "rd";
  return "th";
}
