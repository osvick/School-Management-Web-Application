import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import DashboardLayout from "../components/DashboardLayout";
import { getAcademicContext } from "../utils/getAcademicContext";

const students = [
  { id: "student1", name: "Student One" },
  { id: "student2", name: "Student Two" },
];

export default function TeacherAttendance() {
  const [records, setRecords] = useState({});
  const today = new Date().toISOString().split("T")[0];

  const toggleAttendance = (id) => {
    setRecords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const saveAttendance = async (date, classLevel, records) => {
  try {
    const context = await getAcademicContext();

    const docId = `${context.sessionId}_${context.termId}_${date}_${classLevel}`;

    await setDoc(
      doc(db, "attendance", docId),
      {
        date,
        class: classLevel,
        records,
        ...context,
        createdAt: serverTimestamp(),
      }
    );

    alert("Attendance saved successfully");
  } catch (error) {
    alert(error.message);
  }
};

const fetchAttendance = async (classLevel) => {
  const context = await getAcademicContext();

  const q = query(
    collection(db, "attendance"),
    where("sessionId", "==", context.sessionId),
    where("termId", "==", context.termId),
    where("class", "==", classLevel)
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
};

  return (
    <DashboardLayout role="teacher">
      <h1 className="text-2xl font-bold mb-4">
        Attendance ({today})
      </h1>

      {students.map((s) => (
        <div
          key={s.id}
          className="flex items-center justify-between bg-white p-2 mb-2 rounded shadow"
        >
          <span>{s.name}</span>
          <button
            onClick={() => toggleAttendance(s.id)}
            className={`px-3 py-1 rounded ${
              records[s.id]
                ? "bg-green-600 text-white"
                : "bg-gray-300"
            }`}
          >
            {records[s.id] ? "Present" : "Absent"}
          </button>
        </div>
      ))}

      <button
        onClick={saveAttendance}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Save Attendance
      </button>
    </DashboardLayout>
  );
}
