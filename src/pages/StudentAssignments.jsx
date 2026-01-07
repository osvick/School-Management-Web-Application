import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import DashboardLayout from "../components/DashboardLayout";
import StudentSubmit from "../components/StudentSubmit";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const q = query(
          collection(db, "assignments"),
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

  return (
    <DashboardLayout role="student">
      <h1 className="text-2xl font-bold mb-4">My Assignments</h1>

      {loading && <p>Loading assignments...</p>}

      {!loading && assignments.length === 0 && (
        <p>No assignments available</p>
      )}

      {assignments.map(a => (
        <div
          key={a.id}
          className="bg-white p-4 rounded shadow mb-4"
        >
          <h3 className="font-semibold">{a.subject}</h3>
          <p>{a.title}</p>

          {a.dueDate && (
            <p className="text-xs text-gray-500">
              Due:{" "}
              {a.dueDate.seconds
                ? new Date(a.dueDate.seconds * 1000).toLocaleString()
                : new Date(a.dueDate).toLocaleString()}
            </p>
          )}

          {/* ✅ Student submits here */}
          <StudentSubmit
            assignmentId={a.id}
            dueDate={a.dueDate}
            subject={a.subject}
          />
        </div>
      ))}
    </DashboardLayout>
  );
}
