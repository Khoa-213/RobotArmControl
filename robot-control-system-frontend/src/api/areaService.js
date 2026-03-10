// Area API service — TODO: connect to real backend

let _mockAreas = [];
let _nextId = 1;

export const getAreas = async () => {
  // TODO: GET /api/areas
  return [..._mockAreas];
};

export const getAreaById = async (id) => {
  // TODO: GET /api/areas/:id
  return _mockAreas.find((a) => a.id === id) || null;
};

export const getAreasByFactory = async (factoryId) => {
  // TODO: GET /api/factories/:factoryId/areas
  return _mockAreas.filter((a) => a.factoryId === factoryId);
};

export const createArea = async (data) => {
  // TODO: POST /api/areas
  const area = {
    id: _nextId++,
    ...data,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  _mockAreas = [area, ..._mockAreas];
  return area;
};

export const updateArea = async (id, data) => {
  // TODO: PUT /api/areas/:id
  _mockAreas = _mockAreas.map((a) =>
    a.id === id ? { ...a, ...data } : a
  );
  return _mockAreas.find((a) => a.id === id);
};

export const deleteArea = async (id) => {
  // TODO: DELETE /api/areas/:id
  _mockAreas = _mockAreas.filter((a) => a.id !== id);
  return { success: true };
};
