import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import DashboardLayout from "../components/DashboardLayout";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [newSession, setNewSession] = useState("");
  const [newTerm, setNewTerm] = useState("");
  const [loading, setLoading] = useState(true);

  /* ===================== FETCH SESSIONS ===================== */
  useEffect(() => {
    const fetchSessions = async () => {
      const snap = await getDocs(collection(db, "sessions"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSessions(data);

      const active = data.find(s => s.active);
      setActiveSessionId(active?.id || null);
      setLoading(false);
    };

    fetchSessions();
  }, []);

  /* ===================== FETCH TERMS ===================== */
  useEffect(() => {
    if (!activeSessionId) return;

    const fetchTerms = async () => {
      const snap = await getDocs(
        collection(db, "sessions", activeSessionId, "terms")
      );
      setTerms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    fetchTerms();
  }, [activeSessionId]);

  /* ===================== SESSION ACTIONS ===================== */
  const createSession = async () => {
    if (!newSession) return alert("Enter session name");

    await addDoc(collection(db, "sessions"), {
      name: newSession,
      active: false,
      createdAt: serverTimestamp(),
    });

    setNewSession("");
    const snap = await getDocs(collection(db, "sessions"));
    setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const setActiveSession = async (id) => {
    const snap = await getDocs(collection(db, "sessions"));
    const batch = writeBatch(db);

    snap.docs.forEach(d => {
      batch.update(doc(db, "sessions", d.id), {
        active: d.id === id,
      });
    });

    await batch.commit();

    setSessions(prev =>
      prev.map(s => ({ ...s, active: s.id === id }))
    );
    setActiveSessionId(id);
  };

  /* ===================== TERM ACTIONS ===================== */
  const createTerm = async () => {
    if (!newTerm || !activeSessionId)
      return alert("Select active session");

    await addDoc(
      collection(db, "sessions", activeSessionId, "terms"),
      {
        name: newTerm,
        active: false,
        createdAt: serverTimestamp(),
      }
    );

    setNewTerm("");
    const snap = await getDocs(
      collection(db, "sessions", activeSessionId, "terms")
    );
    setTerms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const setActiveTerm = async (termId) => {
    const snap = await getDocs(
      collection(db, "sessions", activeSessionId, "terms")
    );
    const batch = writeBatch(db);

    snap.docs.forEach(d => {
      batch.update(
        doc(db, "sessions", activeSessionId, "terms", d.id),
        { active: d.id === termId }
      );
    });

    await batch.commit();

    setTerms(prev =>
      prev.map(t => ({ ...t, active: t.id === termId }))
    );
  };

  /* ===================== RENDER ===================== */
  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* 🔹 Top Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link
          to="/admin/users"
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded shadow"
        >
          👥 Manage Users
        </Link>

        <Link
          to="/admin/results"
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded shadow"
        >
          📊 Manage / Publish Results
        </Link>

         <Link
        to="/register"
        className="inline-block mb-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        + Create New User
      </Link>
      </div>

      {/* 🔹 Academic Sessions */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">Academic Sessions</h2>

        <div className="flex gap-2 mb-3">
          <input
            className="border p-2 rounded w-full"
            placeholder="e.g. 2024/2025"
            value={newSession}
            onChange={(e) => setNewSession(e.target.value)}
          />
          <button
            onClick={createSession}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>

        {loading && <p>Loading sessions...</p>}

        {sessions.map(s => (
          <div
            key={s.id}
            className="flex justify-between items-center border-b py-2"
          >
            <span>
              {s.name}{" "}
              {s.active && (
                <span className="text-green-600 font-medium">
                  (Active)
                </span>
              )}
            </span>

            {!s.active && (
              <button
                onClick={() => setActiveSession(s.id)}
                className="text-blue-600 text-sm"
              >
                Set Active
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 🔹 Terms */}
      {activeSessionId && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Terms</h2>

          <div className="flex gap-2 mb-3">
            <input
              className="border p-2 rounded w-full"
              placeholder="e.g. 1st Term"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
            />
            <button
              onClick={createTerm}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>

          {terms.map(t => (
            <div
              key={t.id}
              className="flex justify-between items-center border-b py-2"
            >
              <span>
                {t.name}{" "}
                {t.active && (
                  <span className="text-green-600 font-medium">
                    (Active)
                  </span>
                )}
              </span>

              {!t.active && (
                <button
                  onClick={() => setActiveTerm(t.id)}
                  className="text-blue-600 text-sm"
                >
                  Set Active
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
