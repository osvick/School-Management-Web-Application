import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { getAcademicContext } from "../utils/getAcademicContext";

export default function ParentStudentAttendance() {
  const { studentId } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // 🔹 Get active session & term
        const context = await getAcademicContext();

        // 🔹 Query only current session & term
        const q = query(
          collection(db, "attendance"),
          where("sessionId", "==", context.sessionId),
          where("termId", "==", context.termId)
        );

        const snap = await getDocs(q);

        // 🔹 Filter records for this child
        const data = snap.docs
          .map(doc => doc.data())
          .filter(
            d => d.records && d.records[studentId] !== undefined
          );

        setRecords(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId]);

  return (
    <DashboardLayout role="parent">
      <h2 className="text-xl font-bold mb-3">
        Attendance Record
      </h2>

      {loading && <p>Loading attendance...</p>}

      {!loading && records.length === 0 && (
        <p className="text-gray-500">
          No attendance records for this term.
        </p>
      )}

      {records.map((r, index) => (
        <div
          key={`${r.date}_${index}`}
          className="bg-white p-2 mb-2 rounded shadow"
        >
          <p className="font-medium">{r.date}</p>
          <p className="text-sm">
            Status:{" "}
            {r.records[studentId] ? "Present" : "Absent"}
          </p>
        </div>
      ))}
    </DashboardLayout>
  );
}
