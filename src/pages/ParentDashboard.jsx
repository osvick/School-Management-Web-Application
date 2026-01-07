import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import DashboardLayout from "../components/DashboardLayout";
import { Link } from "react-router-dom";

export default function ParentDashboard() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const parentRef = doc(db, "users", auth.currentUser.uid);
        const parentSnap = await getDoc(parentRef);

        if (!parentSnap.exists()) {
          setLoading(false);
          return;
        }

        const childIds = parentSnap.data().children || [];

        const childProfiles = await Promise.all(
          childIds.map(async (childId) => {
            const studentRef = doc(db, "users", childId);
            const studentSnap = await getDoc(studentRef);

            if (!studentSnap.exists()) return null;

            return {
              id: childId,
              ...studentSnap.data(),
            };
          })
        );

        setChildren(childProfiles.filter(Boolean));
      } catch (err) {
        console.error("Error loading children", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  return (
    <DashboardLayout role="parent">
      <h1 className="text-2xl font-bold mb-4">Parent Dashboard</h1>

      {loading && <p>Loading children...</p>}

      {!loading && children.length === 0 && (
        <p>No linked students found</p>
      )}

      {!loading &&
        children.map((child) => (
          <div
            key={child.id}
            className="bg-white p-4 rounded shadow mb-4"
          >
            <h2 className="font-semibold text-lg">
              {child.name || "Unnamed Student"}
            </h2>

            <p className="text-sm text-gray-600">
              Class: {child.class || "N/A"}
            </p>

            <div className="flex gap-4 mt-3">
              <Link
                to={`/parent/student/${child.id}/attendance`}
                className="text-blue-600 underline"
              >
                Attendance
              </Link>

              <Link
                to={`/parent/student/${child.id}/report-card`}
                className="text-blue-600 underline"
              >
                Report Card
              </Link>
            </div>
          </div>
        ))}
    </DashboardLayout>
  );
}
