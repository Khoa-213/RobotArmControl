# Robot Control System Frontend (Web)

Frontend web để quản trị hệ thống Robot Arm: đăng nhập, vào khu vực Admin và CRUD các thực thể (Factory/Area/Hub/Device).

Tài liệu này mô tả **những gì FE hiện tại đã làm được** (dựa trên code trong repo), và **những phần chưa được wiring/đang stub**.

---

## Tech stack

- React 19 + React Router DOM 7
- Vite 7
- TailwindCSS 3
- Axios (có interceptor tự gắn JWT)
- Ant Design (hiện chỉ thấy dùng ở trang Settings stub)

---

## Routes & màn hình hiện có

Routing nằm ở `src/App.jsx`.

### Public

- `/` — Home page
	- Header + nút Login.
	- Banner giới thiệu.
	- Mở `LoginModal` để đăng nhập.

### Admin (có bảo vệ)

- `/admin/*` — Khu vực Admin (điều kiện: có `token` trong `localStorage`).
- `/admin/dashboard` — Dashboard (dữ liệu mock/hardcode).
- `/admin/factories` — CRUD Factories.
- `/admin/areas` — CRUD Areas.
- `/admin/hubs` — CRUD Hubs.
- `/admin/devices` — CRUD Devices.

Sidebar điều hướng nằm ở `src/components/Layout/SidebarAdmin.jsx`.

---

## Luồng đăng nhập (Auth)

Code liên quan:

- UI: `src/components/login/LoginModal.jsx`
- API: `src/api/authApi.js`
- Axios client: `src/api/axiosClient.js`

Hiện tại FE làm các việc sau:

1. Gọi `POST /api/auth/login` với `{ username, password }`.
2. Lấy `response.data.data` và lưu vào `localStorage`:
	 - `token` = `accessToken`
	 - `role`
	 - `username`
3. Redirect bằng `window.location.href = "/admin/dashboard"`.
4. `ProtectedRoute` chỉ kiểm tra **có/không có** `token` để cho phép vào `/admin/*`.

Chưa có/đang stub:

- Chưa có phân quyền theo role ở FE (ADMIN/OPERATOR/VIEWER… chưa được check phía client).
- Có skeleton refresh-token trong `axiosClient` (queue + `_retry`) nhưng:
	- `authApi.login` **không lưu** `refreshToken`.
	- endpoint refresh đang gọi `POST /auth/refresh` (không có tiền tố `/api`) và kỳ vọng `res.data.token`.
	- Vì vậy tính năng refresh token **chưa được wiring hoàn chỉnh**.
- Chưa có flow logout trên UI (hàm `authApi.logout()` có tồn tại nhưng `onLogout` trong layout đang để trống).

---

## Tích hợp Backend API (CRUD)

Trong dev mode, FE gọi API bằng path tương đối (`/api/...`) và được Vite proxy sang backend:

- Proxy `/api` -> `https://robot-control-system-rmbw.onrender.com`
- Proxy WebSocket `/ws` -> `wss://robot-control-system-rmbw.onrender.com`

Thiết lập proxy: `vite.config.js`.

### 1) Factories

UI:

- Page: `src/pages/admin/factories/FactoriesPage.jsx`
- Table: `src/components/factories/FactoryTable.jsx`
- Modals: `CreateFactoryModal.jsx`, `EditFactoryModal.jsx`

Chức năng:

- Load danh sách factories.
- Tạo factory (modal).
- Sửa factory (modal).
- Xoá factory (confirm).

Fields chính trên UI/payload:

- `factoryName`, `location`, `factoryStatus` (status hiển thị Active/Inactive).

API được gọi (xem `src/api/factoryService.js`):

- `GET /api/factories`
- `GET /api/factories/{factoryId}`
- `POST /api/factories`
- `PUT /api/factories/{factoryId}`
- `DELETE /api/factories/{factoryId}`

### 2) Areas

UI:

- Page: `src/pages/admin/areas/AreasPage.jsx`
- Table: `src/components/areas/AreaTable.jsx`
- Modals: `CreateAreaModal.jsx`, `EditAreaModal.jsx`

Chức năng:

- Load factories, sau đó load areas theo từng factory.
- Tạo area (bắt buộc chọn factory).
- Sửa area.
- Xoá area.

Fields chính:

- `areaName`, `areaDescription`, `factoryId`.

API được gọi (xem `src/api/areaService.js`):

- `GET /api/factories/{factoryId}/areas` (có hỗ trợ query `search`, `status` ở service, nhưng UI hiện chưa có filter/search)
- `POST /api/factories/{factoryId}/areas`
- `PUT /api/areas/{areaId}`
- `DELETE /api/areas/{areaId}`
- `PATCH /api/areas/{areaId}/status` (đã có trong service, UI chưa gọi)

### 3) Hubs

UI:

- Page: `src/pages/admin/hubs/HubsPage.jsx`
- Table: `src/components/hubs/HubTable.jsx`
- Modals: `CreateHubModal.jsx`, `EditHubModal.jsx`

Chức năng:

- Load factories -> areas -> hubs (theo từng area).
- Tạo hub (bắt buộc chọn area).
- Sửa hub.
- Xoá hub.

Fields chính (theo modal):

- `hubName`, `hubDescription`, `areaId`, `status`.

API được gọi (xem `src/api/hubService.js`):

- `GET /api/areas/{areaId}/hubs` (service có hỗ trợ query `search`, `status` nhưng UI chưa có)
- `POST /api/areas/{areaId}/hubs`
- `PUT /api/hubs/{hubId}`
- `DELETE /api/hubs/{hubId}`
- `PATCH /api/hubs/{hubId}/status` (đã có trong service, UI chưa gọi)

### 4) Devices

UI:

- Page: `src/pages/admin/devices/DevicesPage.jsx`
- Table: `src/components/devices/DeviceTable.jsx`
- Modals: `CreateDeviceModal.jsx`, `EditDeviceModal.jsx`

Chức năng:

- Load factories -> areas -> hubs -> devices (theo từng hub).
- Tạo device (bắt buộc chọn hub).
- Sửa device.
- Xoá device.

Fields chính (theo modal):

- `deviceName`, `hubId`, `deviceType` (mặc định RobotArm), `robotType` (Unity/Real), `model`, `serialNumber`, `connectionType` (USB/Serial/TCP).

API được gọi (xem `src/api/deviceService.js`):

- `GET /api/hubs/{hubId}/devices` (service có hỗ trợ query `search`, `status` nhưng UI chưa có)
- `POST /api/hubs/{hubId}/devices`
- `PUT /api/devices/{deviceId}`
- `DELETE /api/devices/{deviceId}`
- `PATCH /api/devices/{deviceId}/status` (đã có trong service, UI chưa gọi)

---

## Dashboard

`/admin/dashboard` hiện là UI overview với **số liệu & activity logs hardcode** trong `src/pages/admin/dashboard/DashboardPage.jsx`.

---

## WebSocket / AI Camera

- Vite đã cấu hình proxy cho `/ws` (WebSocket) nhưng FE **chưa có code kết nối WS** trong `src/`.
- Chưa có màn hình/section “AI Camera Control” và chưa implement `getUserMedia`/MediaPipe hay gửi message `ai_angles`.

---

## Các file/trang có tồn tại nhưng chưa được wiring vào router

- `src/pages/admin/control/ControlPage.jsx` — hiện là mock table factories, chưa được route trong `src/App.jsx`.
- `src/pages/admin/settings/SettingsPage.jsx` — trang stub “Chưa có chức năng”, chưa được route.

---

## Cấu trúc thư mục chính

- `src/api/` — axios client + các service gọi backend.
- `src/pages/` — các page theo route.
- `src/components/` — layout + tables + modals.
- `src/assets/` — ảnh banner (Home page đang dùng `robot-banner.jpg`).

---

## Cách chạy (dev)

Yêu cầu: Node.js + npm.

```bash
cd robot-control-system-frontend
npm install
npm run dev
```

Mặc định Vite chạy ở `http://localhost:5173`.

---

## Ghi chú kỹ thuật / hạn chế hiện tại

- `axiosClient` có `baseURL: ""` nên phụ thuộc proxy của Vite trong dev; khi deploy production cần cấu hình base URL/proxy phù hợp.
- Các trang Areas/Hubs/Devices đang load dữ liệu theo kiểu lặp qua parent list (Factories -> Areas -> Hubs -> Devices), có thể tạo nhiều request (N+1) nếu dữ liệu lớn.
- Có một vài chỗ UI/label chưa khớp 100% (ví dụ cột trong `HubTable`), nhưng logic CRUD vẫn theo service.
