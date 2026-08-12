# Frontend

Frontend cua Parking Building Management System duoc xay dung bang React va Vite. Ung dung cung cap giao dien cho User, Staff, Manager va Admin.

## Cong nghe

- React
- Vite
- Axios
- React Router
- Chart.js
- STOMP/SockJS
- Google OAuth
- QR code
- XLSX export/import

## Cau truc chinh

```text
src
|-- assets/      # Anh va CSS
|-- components/  # Component dung chung
|-- config/      # Cau hinh API va permission
|-- context/     # Auth context
|-- pages/       # Man hinh theo role
`-- utils/       # Helper functions
```

## Cau hinh API

Mac dinh frontend goi API tai:

```text
http://localhost:8080/api
```

Co the thay doi bang bien moi truong:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

Trong moi truong dev, Vite cung cau hinh proxy `/api` sang backend `http://localhost:8080`.

## Cai dat

```powershell
npm install
```

## Chay local

```powershell
npm run dev
```

Ung dung mac dinh chay tai:

```text
http://localhost:5173
```

## Build production

```powershell
npm run build
```

Thu muc build:

```text
dist/
```

## Lint

```powershell
npm run lint
```
