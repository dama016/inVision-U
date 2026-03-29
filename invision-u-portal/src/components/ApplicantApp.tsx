import { AuthScreen } from "@/components/AuthScreen";
import { Dashboard } from "@/components/Dashboard";
import { useAuth } from "@/contexts/AuthContext";

export function ApplicantApp() {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-lime-soft dark:bg-slate-950">
        <p className="text-sm text-slate-600 dark:text-slate-400">…</p>
      </div>
    );
  }

  if (user) return <Dashboard />;
  return <AuthScreen />;
}
