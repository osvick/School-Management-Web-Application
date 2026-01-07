import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import TeacherGradeStudent from "./TeacherGradeStudent";

/**
 * Props:
 * - assignmentId
 * - subject
 * - classLevel
 * - sessionId
 * - termId
 */
export default function TeacherSubmissions({
  assignmentId,
  subject,
  classLevel,
  sessionId,
  termId,
}) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, "submissions", assignmentId, "students")
        );

        const data = snapshot.docs.map((doc) => ({
          studentId: doc.id,
          ...doc.data(),
        }));

        setSubmissions(data);
      } catch (error) {
        console.error("Error fetching submissions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading submissions...</p>;
  }

  if (submissions.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No submissions yet
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {submissions.map((s) => (
        <div
          key={s.studentId}
          className="border rounded p-3 bg-gray-50"
        >
          <p className="text-sm font-semibold mb-1">
            Student ID: {s.studentId}
          </p>

          {/* 📝 Answer */}
          <p className="text-sm whitespace-pre-wrap mb-2">
            {s.answer}
          </p>

          {/* 📎 File upload (if any) */}
          {s.fileURL && (
            <a
              href={s.fileURL}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline text-sm block mb-2"
            >
              Download File ({s.fileName})
            </a>
          )}

          {/* 🎓 GRADING COMPONENT */}
          <TeacherGradeStudent
            assignmentId={assignmentId}
            studentId={s.studentId}
            subject={subject}
            classLevel={classLevel}
            sessionId={sessionId}
            termId={termId}
          />
        </div>
      ))}
    </div>
  );
}
