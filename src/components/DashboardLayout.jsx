import Sidebar from "./Sidebar";

export default function DashboardLayout({ role, children }) {
  return (
    <div className="flex">
      <Sidebar role={role} />
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  );
}
