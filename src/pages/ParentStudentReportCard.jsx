import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { generateReportPDF } from "../utils/generateReportPDF";
import { getAcademicContext } from "../utils/getAcademicContext";

export default function ParentStudentReportCard() {
  const { studentId } = useParams();

  const [result, setResult] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const fetchReport = async () => {
      try {
        const context = await getAcademicContext();

        /* 🔹 Get student profile */
        const userSnap = await getDoc(doc(db, "users", studentId));
        if (userSnap.exists()) {
          setStudent({ id: studentId, ...userSnap.data() });
        }

        /* 🔹 CORRECT RESULT DOCUMENT */
        const resultId = `${context.sessionId}_${context.termId}_${studentId}`;
        const resultSnap = await getDoc(
          doc(db, "results", resultId)
        );

        if (
          resultSnap.exists() &&
          resultSnap.data().published === true
        ) {
          setResult(resultSnap.data());
        } else {
          setResult(null);
        }
      } catch (err) {
        console.error("Error loading parent report card", err);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [studentId]);

  if (loading) {
    return (
      <DashboardLayout role="parent">
        <p>Loading report card...</p>
      </DashboardLayout>
    );
  }

  if (!result) {
    return (
      <DashboardLayout role="parent">
        <p>No published result available for this term.</p>
      </DashboardLayout>
    );
  }

  const subjects = Object.entries(result.subjects || {});
  const overallGPA = result.overallGPA || 0;

  return (
    <DashboardLayout role="parent">
      <h2 className="text-xl font-bold mb-4">
        Student Report Card
      </h2>

      {/* 🔹 Student Info */}
      <div className="mb-4 text-sm">
        <p><strong>Name:</strong> {student?.name}</p>
        <p><strong>Class:</strong> {student?.class}</p>
        <p>
          <strong>Position:</strong>{" "}
          {result.rank
            ? `${result.rank}${getOrdinal(result.rank)}`
            : "—"}
        </p>
        <p>
          <strong>Session:</strong> {result.sessionName} |{" "}
          <strong>Term:</strong> {result.termName}
        </p>
      </div>

      {/* 🔹 Results Table */}
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
              <td className="p-2 text-center font-semibold">
                {s.grade}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 GPA */}
      <div className="bg-green-50 p-3 rounded border mb-4">
        <p className="font-semibold">
          Overall GPA: {overallGPA.toFixed(2)}
        </p>
      </div>

      {/* 🔹 PDF */}
      <button
        onClick={() =>
          generateReportPDF({
            student,
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
