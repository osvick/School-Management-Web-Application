import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Computes and STORES class ranking for a given
 * class + session + term
 *
 * Ranking is based on overallGPA (descending)
 */
export async function calculateClassRanking({
  classLevel,
  sessionId,
  termId,
}) {
  // 🔹 Fetch all results for the class & term
  const q = query(
    collection(db, "results"),
    where("classLevel", "==", classLevel),
    where("sessionId", "==", sessionId),
    where("termId", "==", termId)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error("No results found for ranking");
  }

  // 🔹 Prepare data
  const results = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  // 🔹 Sort by GPA (DESC)
  results.sort((a, b) => b.overallGPA - a.overallGPA);

  // 🔹 Assign positions (handle ties)
  let currentRank = 1;
  let lastGPA = null;

  const rankedResults = results.map((r, index) => {
    if (lastGPA !== null && r.overallGPA < lastGPA) {
      currentRank = index + 1;
    }

    lastGPA = r.overallGPA;

    return {
      ...r,
      rank: currentRank,
    };
  });

  // 🔹 Save ranking back to Firestore
  const batch = writeBatch(db);

  rankedResults.forEach((r) => {
    batch.update(doc(db, "results", r.id), {
      rank: r.rank,
    });
  });

  await batch.commit();

  return rankedResults;
}
