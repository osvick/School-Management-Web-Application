import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";
import DashboardLayout from "../components/DashboardLayout";

const ROLES = ["student", "teacher", "parent", "admin"];
const CLASSES = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [parentId, setParentId] = useState("");
  const [studentId, setStudentId] = useState("");

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    fetchUsers();
  }, []);

  /* ================= UPDATE USER ================= */
  const saveUser = async (user, updates) => {
    await updateDoc(doc(db, "users", user.id), updates);

    setUsers(prev =>
      prev.map(u =>
        u.id === user.id ? { ...u, ...updates } : u
      )
    );
  };

  /* ================= LINK PARENT ================= */
  const linkParentToStudent = async () => {
    if (!parentId || !studentId) return alert("Select both");

    await updateDoc(doc(db, "users", parentId), {
      children: arrayUnion(studentId),
    });

    alert("Parent linked successfully");
    setParentId("");
    setStudentId("");
  };

  /* ================= SEARCH ================= */
  const filteredUsers = users.filter(u =>
    `${u.email} ${u.name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const parents = users.filter(u => u.role === "parent");
  const students = users.filter(u => u.role === "student");

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

      {/* 🔍 SEARCH */}
      <input
        className="border p-2 rounded w-full mb-4"
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* 🔗 LINK PARENT */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">Link Parent to Student</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <select
            className="border p-2 rounded"
            value={parentId}
            onChange={e => setParentId(e.target.value)}
          >
            <option value="">Select Parent</option>
            {parents.map(p => (
              <option key={p.id} value={p.id}>{p.email}</option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
          >
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.email}</option>
            ))}
          </select>

          <button
            onClick={linkParentToStudent}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Link
          </button>
        </div>
      </div>

      {/* 👥 USERS TABLE */}
      {loading && <p>Loading users...</p>}

      {!loading && (
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Email</th>
              <th className="p-2">Name</th>
              <th className="p-2">Class</th>
              <th className="p-2">Role</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map(user => (
              <UserRow
                key={user.id}
                user={user}
                onSave={saveUser}
              />
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}

/* ================= USER ROW ================= */
function UserRow({ user, onSave }) {
  const [name, setName] = useState(user.name || "");
  const [classLevel, setClassLevel] = useState(user.class || "");
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    const updates = {
      name,
      role,
      class: role === "student" ? classLevel : "",
    };

    await onSave(user, updates);
    setSaving(false);
  };

  return (
    <tr className="border-t">
      <td className="p-2">{user.email}</td>

      <td className="p-2">
        <input
          className="border p-1 rounded w-full"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </td>

      <td className="p-2">
        {role === "student" ? (
          <select
            className="border p-1 rounded"
            value={classLevel}
            onChange={e => setClassLevel(e.target.value)}
          >
            <option value="">Select</option>
            {CLASSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        ) : (
          "—"
        )}
      </td>

      <td className="p-2">
        <select
          className="border p-1 rounded"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          {ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </td>

      <td className="p-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </td>
    </tr>
  );
}
