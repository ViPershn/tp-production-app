import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { KeycloakTokenParsed } from "keycloak-js";
import keycloak from "./keycloak";
import { setAuthTokenProvider } from "../api/client";

type TokenWithRoles = KeycloakTokenParsed & {
  preferred_username?: string;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
};

type AuthContextValue = {
  initialized: boolean;
  authenticated: boolean;
  username: string;
  roles: string[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (...roles: string[]) => boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

let keycloakInitPromise: Promise<boolean> | null = null;

function extractRoles(tokenParsed?: TokenWithRoles): string[] {
  const roles = new Set<string>();

  tokenParsed?.realm_access?.roles?.forEach((role) => roles.add(role));

  Object.values(tokenParsed?.resource_access ?? {}).forEach((client) => {
    client.roles?.forEach((role) => roles.add(role));
  });

  return Array.from(roles);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [roles, setRoles] = useState<string[]>([]);

  const syncState = () => {
    const token = keycloak.tokenParsed as TokenWithRoles | undefined;

    console.log("Keycloak state:", {
      authenticated: keycloak.authenticated,
      username: token?.preferred_username,
      roles: extractRoles(token),
      hasToken: Boolean(keycloak.token),
    });

    setAuthenticated(Boolean(keycloak.authenticated));
    setUsername(token?.preferred_username ?? "");
    setRoles(extractRoles(token));
  };

  useEffect(() => {
    setAuthTokenProvider(async () => {
      if (!keycloak.authenticated) return undefined;

      try {
        await keycloak.updateToken(30);
      } catch {
        await keycloak.login();
        return undefined;
      }

      return keycloak.token;
    });

    keycloak.onAuthSuccess = syncState;
    keycloak.onAuthRefreshSuccess = syncState;
    keycloak.onAuthLogout = () => {
      setAuthenticated(false);
      setUsername("");
      setRoles([]);
    };
    keycloak.onTokenExpired = async () => {
      try {
        await keycloak.updateToken(30);
        syncState();
      } catch {
        await keycloak.login();
      }
    };

    if (!keycloakInitPromise) {
      keycloakInitPromise = keycloak.init({
        onLoad: "login-required",
        pkceMethod: "S256",
        checkLoginIframe: false,
      });
    }

    keycloakInitPromise
      .then(() => {
        syncState();
        setInitialized(true);
      })
      .catch((error) => {
        console.error("Keycloak init failed", error);
        setInitialized(true);
      });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      authenticated,
      username,
      roles,
      hasRole: (role: string) => roles.includes(role),
      hasAnyRole: (...requiredRoles: string[]) =>
        requiredRoles.some((role) => roles.includes(role)),
      login: async () => {
        await keycloak.login();
      },
      logout: async () => {
        await keycloak.logout({
          redirectUri: window.location.origin,
        });
      },
    }),
    [initialized, authenticated, username, roles]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}