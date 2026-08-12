# Frontend

This is the frontend application for the Parking Building Management System. It provides role-based user interfaces for users, staff, managers, and administrators.

## Tech Stack

- React
- Vite
- Axios
- React Router
- Chart.js
- STOMP/SockJS
- Google OAuth
- QR code
- XLSX export/import

## Main Structure

```text
src
|-- assets/      # Images and CSS files
|-- components/  # Shared UI components
|-- config/      # API and permission configuration
|-- context/     # Authentication context
|-- pages/       # Role-based pages
`-- utils/       # Helper functions
```

## API Configuration

By default, the frontend calls the backend API at:

```text
http://localhost:8080/api
```

You can override it with this environment variable:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

In development, Vite also proxies `/api` requests to:

```text
http://localhost:8080
```

## Install Dependencies

```powershell
npm install
```

## Run Locally

```powershell
npm run dev
```

The frontend runs by default at:

```text
http://localhost:5173
```

## Build For Production

```powershell
npm run build
```

Build output:

```text
dist/
```

## Lint

```powershell
npm run lint
```
