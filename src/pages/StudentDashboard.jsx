import DashboardLayout from "../components/DashboardLayout";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const uid = auth.currentUser.uid;

        // 1️⃣ Get student class
        const userDoc = await getDoc(doc(db, "users", uid));
        const studentClass = userDoc.data().class;

        // 2️⃣ Query assignments for that class
        const q = query(
          collection(db, "assignments"),
          where("class", "==", studentClass),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAssignments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  return (
    <DashboardLayout role="student">
      <h1 className="text-2xl font-bold mb-4">My Assignments</h1>

      {loading && <p>Loading assignments...</p>}

      {!loading && assignments.length === 0 && (
        <p>No assignments for your class</p>
      )}

      {assignments.map((a) => (
        <div key={a.id} className="bg-white p-3 rounded shadow mb-3">
          <h3 className="font-semibold">{a.subject}</h3>
          <p>{a.title}</p>
          <span className="text-sm text-gray-500">{a.class}</span>
        </div>
      ))}
      <Link
        to="/student/report-card"
        className="inline-block mb-4 bg-blue-400 text-white px-4 py-2 rounded"
      >
        View Report Card
      </Link>

      <Link
  to="/student/attendance"
  className="inline-block mb-4 bg-blue-600 text-white px-4 py-2 rounded"
>
  View Attendance
</Link>

    </DashboardLayout>
  );
}
