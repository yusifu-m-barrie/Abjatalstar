import AdminToolbar from "@/components/AdminToolbar";
import CmsAdminLoader from "@/components/CmsAdminLoader";

export default function AdminPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <AdminToolbar />
      <main className="flex-1">
        <CmsAdminLoader />
      </main>
    </div>
  );
}
