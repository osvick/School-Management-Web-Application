import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const getAcademicContext = async () => {
  // Get active session
  const sessionSnap = await getDocs(collection(db, "sessions"));
  const activeSession = sessionSnap.docs.find(
    d => d.data().active
  );

  if (!activeSession) {
    throw new Error("No active session");
  }

  // Get active term inside session
  const termSnap = await getDocs(
    collection(db, "sessions", activeSession.id, "terms")
  );

  const activeTerm = termSnap.docs.find(
    d => d.data().active
  );

  if (!activeTerm) {
    throw new Error("No active term");
  }

  return {
    sessionId: activeSession.id,
    sessionName: activeSession.data().name,
    termId: activeTerm.id,
    termName: activeTerm.data().name,
  };
};
