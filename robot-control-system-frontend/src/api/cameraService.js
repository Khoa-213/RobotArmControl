import axiosClient from "./axiosClient";

export const cameraService = {
  start: async () => {
    const response = await axiosClient.post("/api/camera/start");
    return response.data?.data;
  },

  stop: async () => {
    const response = await axiosClient.post("/api/camera/stop");
    return response.data?.data;
  },

  status: async () => {
    const response = await axiosClient.get("/api/camera/status");
    return response.data?.data;
  },
};
