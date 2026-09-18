import axios from "axios";

export interface URLCreatePayload {
  origin_url: string;
  custom_alias?: string | null;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface URLResponse {
  id: number;
  short_code: string;
  origin_url: string;
  short_url: string;
  created_at: string;
  clicks: number;
  is_active: boolean;
}

const api = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle unauthorized requests
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// REGISTER
export async function registerUser(payload: UserCreate) {
  const response = await api.post(
    "/api/users/register",
    payload
  );

  return response.data;
}

// LOGIN
export async function loginUser(payload: UserLogin) {
  const formData = new URLSearchParams();

  formData.append("username", payload.username);
  formData.append("password", payload.password);

  const response = await api.post(
    "/api/users/token",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (response.data.access_token) {
    localStorage.setItem(
      "access_token",
      response.data.access_token
    );
  }

  return response.data;
}

// LOGOUT
export async function logoutUser() {
  const response = await api.post(
    "/api/users/logout"
  );

  localStorage.removeItem("access_token");

  return response.data;
}

export const getCurrentUser = async () => {
  const response = await api.get(
    '/api/users/me'
  )
  return response.data
}

// CREATE SHORT URL
export const createShortUrl = async (
  payload: URLCreatePayload
) => {
  const response = await api.post(
    "/api/urls/",
    payload
  );

  return response.data;
};

// GET MY URLS
export const getMyUrls = async () => {
  const response = await api.get(
    "/api/urls/"
  );

  return response.data;
};

// GET ONE URL
export const getMyUrl = async (
  shortCode: string
) => {
  const response = await api.get(
    `/api/urls/${shortCode}`
  );

  return response.data;
};

// DELETE URL
export const deleteShortUrl = async (
  shortCode: string
) => {
  const response = await api.delete(
    `/api/urls/${shortCode}`
  );

  return response.data;
};

export default api;