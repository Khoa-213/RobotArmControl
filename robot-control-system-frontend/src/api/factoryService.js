// Factory API service — TODO: connect to real backend
import axiosClient from "./axiosClient";


//get api factories 
export const getFactories = async () => {
  // TODO: GET /api/factories
   const res = await axiosClient .get("/api/factories");
   return res.data.data;
};

export const getFactoryById = async (id) => {
   const res = await axiosClient.get(`/api/factories/${id}`);
   return res.data.data;
};

//post api factories, create factory
export const createFactory = async (data) => {
  // TODO: POST /api/factories
   const res = await axiosClient.post("/api/factories", data);
   return res.data.data;
};

//put api factories, update factory
export const updateFactory = async (id, data) => {
   const res = await axiosClient.put(`/api/factories/${id}`, data);
   return res.data.data;
};

//delete api factories
export const deleteFactory = async (id) => {
  const res = await axiosClient.delete(`/api/factories/${id}`);
  return res.data.data;
};
