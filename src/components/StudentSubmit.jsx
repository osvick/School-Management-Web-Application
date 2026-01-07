import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "../firebase";
import { getAcademicContext } from "../utils/getAcademicContext";


export default function StudentSubmit({
  assignmentId,
  dueDate,
  subject,
}) {
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLate, setIsLate] = useState(false);

  const studentId = auth.currentUser.uid;

  // 🔹 Normalize due date
  let due = null;
  if (dueDate?.seconds) {
    due = new Date(dueDate.seconds * 1000);
  } else if (dueDate) {
    due = new Date(dueDate);
  }

  const deadlinePassed = due ? new Date() > due : false;

  // 🔍 Check submission
  useEffect(() => {
    const checkSubmission = async () => {
      const refDoc = doc(
        db,
        "submissions",
        assignmentId,
        "students",
        studentId
      );
      const snap = await getDoc(refDoc);
      if (snap.exists()) {
        setHasSubmitted(true);
        setIsLate(snap.data().isLate || false);
      }
      setLoading(false);
    };
    checkSubmission();
  }, [assignmentId, studentId]);

  // 📤 Submit assignment
  const handleSubmit = async () => {
    if (!answer && !file) {
      return alert("Provide an answer or upload a file");
    }

    if (deadlinePassed) {
      return alert("Deadline passed");
    }

    setSubmitting(true);

    try {
      let fileURL = null;
      let fileName = null;

      if (file) {
        const fileRef = ref(
          storage,
          `assignmentUploads/${assignmentId}/${studentId}/${file.name}`
        );
        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
        fileName = file.name;
      }
      const context = await getAcademicContext();

      await setDoc(
        doc(db, "submissions", assignmentId, "students", studentId),
        {
          answer,
          subject,
          studentId,
          assignmentId,
          fileURL,
          fileName,
          submittedAt: serverTimestamp(),
          isLate: deadlinePassed,
        }
      );

      setHasSubmitted(true);
      setIsLate(deadlinePassed);
      setAnswer("");
      setFile(null);
      alert("Assignment submitted successfully");
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Checking submission...</p>;

  if (hasSubmitted) {
    return (
      <div className="mt-2">
        <p className="text-green-600 text-sm">
          ✔ Assignment submitted
        </p>
        {isLate && (
          <p className="text-red-600 text-sm">
            ⚠ Submitted late
          </p>
        )}
      </div>
    );
  }

  if (deadlinePassed) {
    return (
      <p className="text-red-600 text-sm mt-2">
        ❌ Deadline passed
      </p>
    );
  }

  return (
    <div className="mt-3">
      <textarea
        className="w-full p-2 border rounded"
        rows="3"
        placeholder="Optional text answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <input
        type="file"
        accept=".pdf,image/*"
        className="mt-2"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-green-600 text-white px-4 py-1 mt-2 rounded"
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
  
}
