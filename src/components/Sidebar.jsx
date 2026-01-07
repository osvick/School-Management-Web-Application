import { Link } from "react-router-dom";

export default function Sidebar({ role }) {
  return (
    <div className="w-64 min-h-screen bg-blue-700 text-white p-4">
      <h2 className="text-xl font-bold mb-6">SchoolHub</h2>

      <nav className="space-y-3">
        <Link to={`/${role}`} className="block hover:bg-blue-600 p-2 rounded">
          Dashboard
        </Link>

        {role === "admin" && (
          <Link to="/admin/users" className="block hover:bg-blue-600 p-2 rounded">
            Manage Users
          </Link>
        )}

        {role === "student" && (
          <Link to="/student/assignments" className="block hover:bg-blue-600 p-2 rounded">
            Assignments
          </Link>
        )}
      </nav>
    </div>
  );
}
