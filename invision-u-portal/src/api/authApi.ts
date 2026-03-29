import { apiFetch } from "@/api/client";

export type MeResponse = {
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    iin: string;
    role: string;
  } | null;
  hasApplication: boolean;
};

export async function fetchMe(): Promise<MeResponse> {
  const res = await apiFetch("/api/auth/me");
  if (!res.ok) throw new Error("me failed");
  return res.json() as Promise<MeResponse>;
}

export async function loginApplicant(
  email: string,
  password: string
): Promise<MeResponse> {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as MeResponse & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Login failed");
  return data as MeResponse;
}

export async function registerApplicant(data: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  iin: string;
}): Promise<MeResponse> {
  const res = await apiFetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const j = (await res.json()) as MeResponse & { error?: string };
  if (!res.ok) throw new Error(j.error ?? "Registration failed");
  return j as MeResponse;
}

export async function logoutApplicant(): Promise<void> {
  await apiFetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope: "applicant" }),
  });
}

export type AdminMeResponse = {
  admin: { id: string; email: string; role: string } | null;
};

export async function fetchAdminMe(): Promise<AdminMeResponse> {
  const res = await apiFetch("/api/auth/admin/me");
  if (!res.ok) throw new Error("admin me failed");
  return res.json() as Promise<AdminMeResponse>;
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<AdminMeResponse> {
  const res = await apiFetch("/api/auth/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const j = (await res.json()) as AdminMeResponse & { error?: string };
  if (!res.ok) throw new Error(j.error ?? "Login failed");
  return j as AdminMeResponse;
}

export async function logoutAdmin(): Promise<void> {
  await apiFetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope: "committee" }),
  });
}
