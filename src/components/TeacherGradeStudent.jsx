import { useState } from "react";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAcademicContext } from "../utils/getAcademicContext";
import { calculateGrade, calculateGPA } from "../utils/gradeUtils";

export default function TeacherGradeStudent({
  studentId,
  subject,
  classLevel,
}) {
  const [ca, setCa] = useState("");
  const [exam, setExam] = useState("");
  const [saving, setSaving] = useState(false);

  const saveResult = async () => {
    if (ca === "" || exam === "") {
      return alert("Enter CA and Exam scores");
    }

    const caScore = Number(ca);
    const examScore = Number(exam);

    if (caScore > 40 || examScore > 60) {
      return alert("CA max = 40, Exam max = 60");
    }

    setSaving(true);

    try {
      const context = await getAcademicContext();

      const total = caScore + examScore;
      const grade = calculateGrade(total);
      const gpa = calculateGPA(total);

      const resultId = `${context.sessionId}_${context.termId}_${studentId}`;

      await setDoc(
        doc(db, "results", resultId),
        {
          studentId,
          classLevel,
          sessionId: context.sessionId,
          sessionName: context.sessionName,
          termId: context.termId,
          termName: context.termName,
          updatedAt: serverTimestamp(),
          subjects: {
            [subject]: {
              ca: caScore,
              exam: examScore,
              total,
              grade,
              gpa,
            },
          },
        },
        { merge: true }
      );

      alert("Result saved successfully");
      setCa("");
      setExam("");
    } catch (err) {
      alert("Error saving result");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      <p className="text-sm font-medium mb-2">
        Enter Result (CA + Exam)
      </p>

      <div className="flex gap-2 mb-2">
        <input
          type="number"
          placeholder="CA (40)"
          className="border p-1 w-20"
          value={ca}
          onChange={(e) => setCa(e.target.value)}
        />
        <input
          type="number"
          placeholder="Exam (60)"
          className="border p-1 w-20"
          value={exam}
          onChange={(e) => setExam(e.target.value)}
        />
      </div>

      <button
        onClick={saveResult}
        disabled={saving}
        className="bg-purple-600 text-white px-3 py-1 rounded"
      >
        {saving ? "Saving..." : "Save Result"}
      </button>
    </div>
  );
}
