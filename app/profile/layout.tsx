"use client";

import { AuthProvider } from "@/lib/hooks";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ProfileGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
}
