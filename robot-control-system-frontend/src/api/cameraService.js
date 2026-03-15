import axiosClient from "./axiosClient";

export const cameraService = {
  start: async (deviceId) => {
    const config = deviceId != null ? { params: { deviceId } } : undefined;
    const response = await axiosClient.post("/api/camera/start", null, config);
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

  sendAngles: async (angles, deviceId) => {
    const response = await axiosClient.post("/api/camera/angles", { angles, deviceId });
    return response.data?.data;
  },
};
