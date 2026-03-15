import axiosClient from "./axiosClient";

// Get all users
export const getUsers = async () => {
  const res = await axiosClient.get("/api/users");
  return res.data.data;
};

// Get user by ID
export const getUserById = async (userId) => {
  const res = await axiosClient.get(`/api/users/${userId}`);
  return res.data.data;
};

// Create new user (register)
export const createUser = async (data) => {
  const res = await axiosClient.post("/api/auth/register", data);
  return res.data.data;
};

// Update user
export const updateUser = async (userId, data) => {
  const res = await axiosClient.put(`/api/users/${userId}`, data);
  return res.data.data;
};

// Delete user
export const deleteUser = async (userId) => {
  const res = await axiosClient.delete(`/api/users/${userId}`);
  return res.data.data;
};

// Update user status
export const updateUserStatus = async (userId, status) => {
  const res = await axiosClient.patch(`/api/users/${userId}/status`, { status });
  return res.data.data;
};

// Update user role
export const updateUserRole = async (userId, role) => {
  const res = await axiosClient.patch(`/api/users/${userId}/role`, { role });
  return res.data.data;
};
