import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AUTH_SESSION_STORAGE_KEY, getCurrentUser, loginUser, logoutUser, signupUser } from "../services/api.js";

const AuthContext = createContext(null);

const readStoredSession = () => {
  try {
    const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [loading, setLoading] = useState(Boolean(session?.accessToken));

  const persistSession = useCallback((nextSession) => {
    setSession(nextSession);
    window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(nextSession));
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await getCurrentUser();

        if (!cancelled) {
          setSession((currentSession) =>
            currentSession
              ? {
                  ...currentSession,
                  user: response.data.user,
                }
              : null,
          );
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clearSession, session?.accessToken]);

  const signIn = useCallback(
    async ({ email, password }) => {
      const response = await loginUser({ email, password });
      persistSession(response.data);
      return response.data;
    },
    [persistSession],
  );

  const signUp = useCallback(
    async ({ name, email, password }) => {
      const response = await signupUser({ name, email, password });
      persistSession(response.data);
      return response.data;
    },
    [persistSession],
  );

  const signOut = useCallback(async () => {
    try {
      if (session?.accessToken) {
        await logoutUser();
      }
    } finally {
      clearSession();
    }
  }, [clearSession, session?.accessToken]);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      isAuthenticated: Boolean(session?.accessToken),
      signIn,
      signUp,
      signOut,
    }),
    [loading, session, signIn, signOut, signUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
