import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuthRedirect?: boolean;
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const PUBLIC_AUTH_PAGES = [
  "/login",
  "/signup",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
];

const handleLogout = () => {
  const currentPath = window.location.pathname;

  if (!PUBLIC_AUTH_PAGES.includes(currentPath)) {
    window.location.href = "/login";
  }
};

const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as CustomAxiosRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;

    const shouldSkipRedirect =
      originalRequest.skipAuthRedirect === true;

    const isRefreshRequest =
      originalRequest.url?.includes("/refresh-token");

    if (
      !isUnauthorized ||
      originalRequest._retry ||
      shouldSkipRedirect ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh(() =>
          resolve(axiosInstance(originalRequest))
        );
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/refresh-token`,
        {},
        {
          withCredentials: true,
        }
      );

      isRefreshing = false;
      onRefreshSuccess();

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      refreshSubscribers = [];

      handleLogout();

      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;