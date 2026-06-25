import { Sidebar } from "@/components/admin/sidebar";

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark flex min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-neutral-950 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
