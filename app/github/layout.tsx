import DashboardLayout from "@/components/layout/DashboardLayout";
import { AuthProvider } from "@/lib/hooks";

export default function GitHubLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
}
