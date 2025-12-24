// Client-side auth utilities
export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    // Store in localStorage for API calls
    localStorage.setItem("auth_token", token);

    // Also set cookie for middleware to access
    // Cookie expires in 7 days (matching JWT expiration)
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
    document.cookie = `auth_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure=${
      window.location.protocol === "https:"
    }`;
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    // Try localStorage first (for API calls)
    const localToken = localStorage.getItem("auth_token");
    if (localToken) {
      return localToken;
    }

    // Fallback to cookie
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((cookie) =>
      cookie.startsWith("auth_token=")
    );
    if (tokenCookie) {
      return tokenCookie.split("=")[1];
    }
  }
  return null;
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    // Remove from localStorage
    localStorage.removeItem("auth_token");

    // Remove cookie
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}
