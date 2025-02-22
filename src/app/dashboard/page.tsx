import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {session.user.role === "ADMIN" ? "Admin Dashboard" : "Sales Dashboard"}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard content based on role */}
        {session.user.role === "ADMIN" ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Admin Stats</h2>
              <p>Welcome, {session.user.name || session.user.email}</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Sales Stats</h2>
              <p>Welcome, {session.user.name || session.user.email}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
