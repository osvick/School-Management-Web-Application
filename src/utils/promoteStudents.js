import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const NEXT_CLASS = {
  JSS1: "JSS2",
  JSS2: "JSS3",
  JSS3: "SS1",
  SS1: "SS2",
  SS2: "SS3",
};

export async function promoteClass(classLevel) {
  const snap = await getDocs(collection(db, "users"));

  const students = snap.docs.filter(
    (d) => d.data().role === "student" && d.data().class === classLevel
  );

  for (const s of students) {
    await updateDoc(doc(db, "users", s.id), {
      class: NEXT_CLASS[classLevel] || classLevel,
    });
  }

  alert("Students promoted successfully");
}
