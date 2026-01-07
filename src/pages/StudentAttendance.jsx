import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import DashboardLayout from "../components/DashboardLayout";
import { getAcademicContext } from "../utils/getAcademicContext";

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = auth.currentUser.uid;

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // 🔹 Get active session & term
        const context = await getAcademicContext();

        // 🔹 Query attendance for current session & term
        const q = query(
          collection(db, "attendance"),
          where("sessionId", "==", context.sessionId),
          where("termId", "==", context.termId)
        );

        const snapshot = await getDocs(q);

        // 🔹 Filter records belonging to this student
        const data = snapshot.docs
          .map(doc => doc.data())
          .filter(
            d => d.records && d.records[studentId] !== undefined
          );

        setAttendance(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId]);

  const presentCount = attendance.filter(
    a => a.records[studentId]
  ).length;

  return (
    <DashboardLayout role="student">
      <h1 className="text-2xl font-bold mb-4">
        My Attendance
      </h1>

      {loading && <p>Loading attendance...</p>}

      {!loading && (
        <>
          <p className="mb-3">
            Present: {presentCount} / {attendance.length}
          </p>

          {attendance.map((a, index) => (
            <div
              key={`${a.date}_${index}`}
              className="bg-white p-2 rounded shadow mb-2"
            >
              <p className="font-medium">{a.date}</p>
              <p className="text-sm">
                Status:{" "}
                {a.records[studentId] ? "Present" : "Absent"}
              </p>
            </div>
          ))}

          {attendance.length === 0 && (
            <p className="text-gray-500">
              No attendance records for this term.
            </p>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
