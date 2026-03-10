// Hub API service — TODO: connect to real backend

let _mockHubs = [];
let _nextId = 1;

export const getHubs = async () => {
  // TODO: GET /api/hubs
  return [..._mockHubs];
};

export const getHubById = async (id) => {
  // TODO: GET /api/hubs/:id
  return _mockHubs.find((h) => h.id === id) || null;
};

export const getHubsByArea = async (areaId) => {
  // TODO: GET /api/areas/:areaId/hubs
  return _mockHubs.filter((h) => h.areaId === areaId);
};

export const createHub = async (data) => {
  // TODO: POST /api/hubs
  const hub = {
    id: _nextId++,
    ...data,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  _mockHubs = [hub, ..._mockHubs];
  return hub;
};

export const updateHub = async (id, data) => {
  // TODO: PUT /api/hubs/:id
  _mockHubs = _mockHubs.map((h) =>
    h.id === id ? { ...h, ...data } : h
  );
  return _mockHubs.find((h) => h.id === id);
};

export const deleteHub = async (id) => {
  // TODO: DELETE /api/hubs/:id
  _mockHubs = _mockHubs.filter((h) => h.id !== id);
  return { success: true };
};
