import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function StudentGrade({ assignmentId }) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = auth.currentUser.uid;

  useEffect(() => {
    const fetchGrade = async () => {
      try {
        const ref = doc(
          db,
          "submissions",
          assignmentId,
          "students",
          studentId
        );

        const snap = await getDoc(ref);

        if (snap.exists()) {
          setSubmission(snap.data());
        }
      } catch (error) {
        console.error("Error fetching grade", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrade();
  }, [assignmentId, studentId]);

  if (loading) return null;
  if (!submission) return null;

  // Not graded yet
  if (submission.score === undefined) {
    return (
      <p className="text-sm text-yellow-600 mt-2">
        ⏳ Submitted — awaiting grading
      </p>
    );
  }

  return (
    <div className="mt-2 bg-green-50 p-2 rounded border">
      <p className="text-sm font-semibold text-green-700">
        Score: {submission.score}
      </p>

      {submission.feedback && (
        <p className="text-sm text-gray-700 mt-1">
          Feedback: {submission.feedback}
        </p>
      )}
    </div>
  );
}
