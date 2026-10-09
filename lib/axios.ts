import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
});

// Session-expiry guard.
//
// When a *protected* request comes back 401/403 the session is gone — e.g. you
// logged out and then landed back on an admin page, whose admin-only calls
// (restrictTo("ADMIN") returns 403 when there's no user) would otherwise just
// fail silently and leave the page broken with console errors. Bounce to /login.
//
// Exceptions (must NOT redirect):
//  - /auth/me is the "are we logged in?" probe. The chatbot is anonymous-first,
//    so a 401 there is expected and normal.
//  - /auth/login / /auth/logout handle their own outcome.
//  - Already on /login — nothing to redirect to.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    const isAuthEndpoint =
      url.includes("/auth/me") ||
      url.includes("/auth/login") ||
      url.includes("/auth/logout");

    // Only redirect to /login if the user is on an admin/protected page
    if (
      typeof window !== "undefined" &&
      (status === 401 || status === 403) &&
      !isAuthEndpoint &&
      window.location.pathname.startsWith("/admin") &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
