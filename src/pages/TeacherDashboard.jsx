import DashboardLayout from "../components/DashboardLayout";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import TeacherSubmissions from "../components/TeacherSubmissions";
import { getAcademicContext } from "../utils/getAcademicContext";

const classes = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
const subjects = ["Math", "English", "Biology", "Physics", "Chemistry"];

export default function TeacherDashboard() {
  const [title, setTitle] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dueDate, setDueDate] = useState("");

  /* ===================== FETCH ASSIGNMENTS ===================== */
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const context = await getAcademicContext();

        const q = query(
          collection(db, "assignments"),
          where("sessionId", "==", context.sessionId),
          where("termId", "==", context.termId),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        setAssignments(
          snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (error) {
        console.error("Error fetching assignments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  /* ===================== ADD ASSIGNMENT ===================== */
  const addAssignment = async () => {
    if (!title || !classLevel || !subject || !dueDate) {
      return alert("Fill all fields");
    }

    try {
      const context = await getAcademicContext();

      const docRef = await addDoc(collection(db, "assignments"), {
        title,
        subject,
        class: classLevel,
        dueDate: new Date(dueDate),
        ...context,
        createdAt: serverTimestamp(),
      });

      // 🔹 Update UI immediately
      setAssignments(prev => [
        {
          id: docRef.id,
          title,
          subject,
          class: classLevel,
          dueDate: new Date(dueDate),
          ...context,
          createdAt: new Date(),
        },
        ...prev,
      ]);

      setTitle("");
      setClassLevel("");
      setSubject("");
      setDueDate("");
    } catch (err) {
      alert(err.message);
    }
  };

  /* ===================== DELETE ASSIGNMENT ===================== */
  const deleteAssignment = async (id) => {
    if (!window.confirm("Delete assignment?")) return;

    try {
      await deleteDoc(doc(db, "assignments", id));
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert("Error deleting assignment");
    }
  };

  return (
    <DashboardLayout role="teacher">
      <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>

      {/* 🔹 Attendance */}
      <Link
        to="/teacher/attendance"
        className="inline-block mb-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        Take Attendance
      </Link>

      {/* 🔹 Create Assignment */}
      <input
        className="w-full p-2 mb-2 border rounded"
        placeholder="Assignment title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="datetime-local"
        className="w-full p-2 mb-3 border rounded"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <select
        className="w-full p-2 mb-2 border rounded"
        value={classLevel}
        onChange={(e) => setClassLevel(e.target.value)}
      >
        <option value="">Select Class</option>
        {classes.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className="w-full p-2 mb-3 border rounded"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      >
        <option value="">Select Subject</option>
        {subjects.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <button
        onClick={addAssignment}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        Upload Assignment
      </button>

      {/* 🔹 Assignment List */}
      {loading && <p>Loading assignments...</p>}

      {!loading && assignments.map(a => (
        <div key={a.id} className="bg-white p-3 rounded shadow mb-4">
          <h3 className="font-semibold">{a.subject}</h3>
          <p>{a.title}</p>
          <p className="text-sm text-gray-500">{a.class}</p>

          {a.dueDate && (
            <p className="text-xs text-gray-500">
              Due:{" "}
              {a.dueDate.seconds
                ? new Date(a.dueDate.seconds * 1000).toLocaleString()
                : new Date(a.dueDate).toLocaleString()}
            </p>
          )}

          {/* ✅ PASS REQUIRED PROPS */}
          <TeacherSubmissions
            assignmentId={a.id}
            subject={a.subject}
            classLevel={a.class}
          />

          <button
            onClick={() => deleteAssignment(a.id)}
            className="bg-red-500 text-white px-3 py-1 mt-2 rounded"
          >
            Delete
          </button>
        </div>
      ))}
    </DashboardLayout>
  );
}
