import axios, { type InternalAxiosRequestConfig } from "axios";

type TokenProvider = (() => Promise<string | undefined>) | null;

let authTokenProvider: TokenProvider = null;

export const setAuthTokenProvider = (provider: TokenProvider) => {
  authTokenProvider = provider;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (!authTokenProvider) {
    console.warn("API request without token provider:", config.url);
    return config;
  }

  const token = await authTokenProvider();

  console.log("API request:", config.url, "token exists:", Boolean(token));

  if (!token) {
    return config;
  }

  if (config.headers && typeof (config.headers as any).set === "function") {
    (config.headers as any).set("Authorization", `Bearer ${token}`);
  } else {
    config.headers = {
      ...(config.headers ?? {}),
      Authorization: `Bearer ${token}`,
    } as any;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      headers: error.config?.headers,
    });
    return Promise.reject(error);
  }
);