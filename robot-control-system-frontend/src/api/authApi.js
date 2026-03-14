import axiosClient from "./axiosClient";

export const authApi = {
  login: async (credentials) => {
    const response = await axiosClient.post("/api/auth/login", credentials);

    const authData = response.data.data;

    // lưu token
    localStorage.setItem("token", authData.accessToken);
    localStorage.setItem("role", authData.role);
    localStorage.setItem("username", authData.username);

    return authData;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  },
};