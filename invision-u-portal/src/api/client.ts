/** All API calls include cookies and skip HTTP cache (committee sees fresh data). */
export function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, {
    ...init,
    credentials: "include",
    cache: "no-store",
  });
}
