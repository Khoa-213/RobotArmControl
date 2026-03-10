// Device API service — TODO: connect to real backend

let _mockDevices = [];
let _nextId = 1;

export const getDevices = async () => {
  // TODO: GET /api/devices
  return [..._mockDevices];
};

export const getDeviceById = async (id) => {
  // TODO: GET /api/devices/:id
  return _mockDevices.find((d) => d.id === id) || null;
};

export const getDevicesByHub = async (hubId) => {
  // TODO: GET /api/hubs/:hubId/devices
  return _mockDevices.filter((d) => d.hubId === hubId);
};

export const createDevice = async (data) => {
  // TODO: POST /api/devices
  const device = {
    id: _nextId++,
    ...data,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  _mockDevices = [device, ..._mockDevices];
  return device;
};

export const updateDevice = async (id, data) => {
  // TODO: PUT /api/devices/:id
  _mockDevices = _mockDevices.map((d) =>
    d.id === id ? { ...d, ...data } : d
  );
  return _mockDevices.find((d) => d.id === id);
};

export const deleteDevice = async (id) => {
  // TODO: DELETE /api/devices/:id
  _mockDevices = _mockDevices.filter((d) => d.id !== id);
  return { success: true };
};
