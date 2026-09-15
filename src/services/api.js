import axios from 'axios';

const CART_SESSION_KEY = 'abc_cart_session';
const USER_KEY = 'abc_user';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const getCartSessionId = () => {
  let sessionId = localStorage.getItem(CART_SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(CART_SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const clearCartSessionId = () => {
  localStorage.removeItem(CART_SESSION_KEY);
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

/** Unwrap ApiResponse envelopes and normalize paginated payloads. */
export const unwrap = (payload) => {
  if (payload == null) return payload;
  if (typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data;
  }
  return payload;
};

export const unwrapList = (payload) => {
  const data = unwrap(payload);
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  return [];
};

export const unwrapPage = (payload) => {
  const data = unwrap(payload);
  if (Array.isArray(data)) {
    return { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length };
  }
  return {
    content: data?.content || [],
    totalElements: data?.totalElements ?? data?.content?.length ?? 0,
    totalPages: data?.totalPages ?? 1,
    number: data?.number ?? 0,
    size: data?.size ?? data?.content?.length ?? 0,
  };
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

const refreshAccessToken = async () => {
  const user = getStoredUser();
  if (!user?.refreshToken) {
    throw new Error('No refresh token');
  }

  const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken: user.refreshToken,
  });
  const payload = unwrap(data);
  const nextUser = {
    ...user,
    token: payload.accessToken,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    userId: payload.userId || user.userId,
    email: payload.email || user.email,
    name: payload.firstName
      ? `${payload.firstName} ${payload.lastName || ''}`.trim()
      : user.name,
    role: payload.role || user.role,
    permissions: payload.permissions || user.permissions || [],
  };
  setStoredUser(nextUser);
  return nextUser;
};

api.interceptors.request.use(
  (config) => {
    const user = getStoredUser();
    const token = user?.token || user?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Cart-Session'] = getCartSessionId();
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const sessionHeader = response.headers?.['x-cart-session'];
    if (sessionHeader) {
      localStorage.setItem(CART_SESSION_KEY, sessionHeader);
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const nextUser = await refreshPromise;
        original.headers.Authorization = `Bearer ${nextUser.token}`;
        return api(original);
      } catch {
        setStoredUser(null);
        if (!window.location.pathname.startsWith('/account')) {
          window.location.href = '/account';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
