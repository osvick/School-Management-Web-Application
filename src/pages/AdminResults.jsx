import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import DashboardLayout from "../components/DashboardLayout";
import { getAcademicContext } from "../utils/getAcademicContext";

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const ctx = await getAcademicContext();
        setContext(ctx);

        const q = query(
          collection(db, "results"),
          where("sessionId", "==", ctx.sessionId),
          where("termId", "==", ctx.termId)
        );

        const snap = await getDocs(q);
        setResults(
          snap.docs.map(d => ({ id: d.id, ...d.data() }))
        );
      } catch (err) {
        console.error("Error loading results", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const togglePublish = async (id, current) => {
    await updateDoc(doc(db, "results", id), {
      published: !current,
    });

    setResults(prev =>
      prev.map(r =>
        r.id === id ? { ...r, published: !current } : r
      )
    );
  };

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold mb-4">
        Publish Results
      </h1>

      {context && (
        <p className="text-sm mb-4 text-gray-600">
          Session: <strong>{context.sessionName}</strong> | Term:{" "}
          <strong>{context.termName}</strong>
        </p>
      )}

      {loading && <p>Loading results...</p>}

      {!loading && results.length === 0 && (
        <p>No results available.</p>
      )}

      {!loading && results.length > 0 && (
        <table className="w-full bg-white rounded shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Student ID</th>
              <th className="p-2">Class</th>
              <th className="p-2">GPA</th>
              <th className="p-2">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2 text-xs">{r.studentId}</td>
                <td className="p-2 text-center">{r.class}</td>
                <td className="p-2 text-center">
                  {r.overallGPA?.toFixed(2)}
                </td>
                <td className="p-2 text-center">
                  {r.published ? (
                    <span className="text-green-600 font-medium">
                      Published
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      Locked
                    </span>
                  )}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() =>
                      togglePublish(r.id, r.published)
                    }
                    className={`px-3 py-1 rounded text-white ${
                      r.published
                        ? "bg-gray-600"
                        : "bg-green-600"
                    }`}
                  >
                    {r.published ? "Unpublish" : "Publish"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}
