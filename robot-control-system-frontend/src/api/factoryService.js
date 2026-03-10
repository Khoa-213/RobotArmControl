// Factory API service — TODO: connect to real backend

let _mockFactories = [
  { id: 1, name: "Nhà máy Bảo Ân", location: "Huế", status: "Active", createdAt: "2026-01-15" },
  { id: 2, name: "Nhà máy Anh Khoa", location: "Hồ Chí Minh", status: "Active", createdAt: "2026-01-20" },
  { id: 3, name: "Nhà máy Đình Duy", location: "Gia Lai", status: "Inactive", createdAt: "2026-02-01" },
  { id: 4, name: "Nhà máy Trọng Nhã", location: "Hà Nội", status: "Inactive", createdAt: "2026-02-05" },
  { id: 5, name: "Nhà máy Trần Quang", location: "Đà Nẵng", status: "Active", createdAt: "2026-02-10" },
];
let _nextId = 6;

export const getFactories = async () => {
  // TODO: GET /api/factories
  return [..._mockFactories];
};

export const getFactoryById = async (id) => {
  // TODO: GET /api/factories/:id
  return _mockFactories.find((f) => f.id === id) || null;
};

export const createFactory = async (data) => {
  // TODO: POST /api/factories
  const factory = {
    id: _nextId++,
    ...data,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  _mockFactories = [factory, ..._mockFactories];
  return factory;
};

export const updateFactory = async (id, data) => {
  // TODO: PUT /api/factories/:id
  _mockFactories = _mockFactories.map((f) =>
    f.id === id ? { ...f, ...data } : f
  );
  return _mockFactories.find((f) => f.id === id);
};

export const deleteFactory = async (id) => {
  // TODO: DELETE /api/factories/:id
  _mockFactories = _mockFactories.filter((f) => f.id !== id);
  return { success: true };
};
