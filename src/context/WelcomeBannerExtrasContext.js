import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

/** Stored in sessionStorage while the banner is hidden for this browser tab. */
export const WELCOME_BANNER_DISMISSED_KEY = "onix-welcome-banner-dismissed";

const WelcomeBannerExtrasContext = createContext(null);

function readSessionDismissed() {
  try {
    return typeof sessionStorage !== "undefined" && sessionStorage.getItem(WELCOME_BANNER_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function WelcomeBannerExtrasProvider({ children }) {
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [welcomeBannerDismissed, setWelcomeBannerDismissed] = useState(readSessionDismissed);
  const refreshFnRef = useRef(null);

  const registerDashboardRefresh = useCallback((fn) => {
    refreshFnRef.current = fn;
  }, []);

  const triggerDashboardRefresh = useCallback(() => {
    if (typeof refreshFnRef.current === "function") {
      refreshFnRef.current();
    } else {
      window.location.reload();
    }
  }, []);

  const dismissWelcomeBanner = useCallback(() => {
    try {
      sessionStorage.setItem(WELCOME_BANNER_DISMISSED_KEY, "1");
    } catch {
      /* ignore */
    }
    setWelcomeBannerDismissed(true);
  }, []);

  const restoreWelcomeBanner = useCallback(() => {
    try {
      sessionStorage.removeItem(WELCOME_BANNER_DISMISSED_KEY);
    } catch {
      /* ignore */
    }
    setWelcomeBannerDismissed(false);
  }, []);

  const value = useMemo(
    () => ({
      lastUpdated,
      setLastUpdated,
      dashboardLoading,
      setDashboardLoading,
      registerDashboardRefresh,
      triggerDashboardRefresh,
      welcomeBannerDismissed,
      dismissWelcomeBanner,
      restoreWelcomeBanner,
    }),
    [
      lastUpdated,
      dashboardLoading,
      registerDashboardRefresh,
      triggerDashboardRefresh,
      welcomeBannerDismissed,
      dismissWelcomeBanner,
      restoreWelcomeBanner,
    ]
  );

  return (
    <WelcomeBannerExtrasContext.Provider value={value}>
      {children}
    </WelcomeBannerExtrasContext.Provider>
  );
}

export function useWelcomeBannerExtras() {
  const ctx = useContext(WelcomeBannerExtrasContext);
  if (!ctx) {
    return {
      lastUpdated: null,
      setLastUpdated: () => {},
      dashboardLoading: false,
      setDashboardLoading: () => {},
      registerDashboardRefresh: () => {},
      triggerDashboardRefresh: () => window.location.reload(),
      welcomeBannerDismissed: false,
      dismissWelcomeBanner: () => {},
      restoreWelcomeBanner: () => {},
    };
  }
  return ctx;
}
