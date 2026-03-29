import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import type { ReactNode } from "react";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, adminReady } = useAdminAuth();
  const location = useLocation();

  if (!adminReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-lime-soft/90 to-white dark:from-slate-950 dark:to-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-400">…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Navigate to="/committee/login" replace state={{ from: location }} />
    );
  }

  return <>{children}</>;
}
