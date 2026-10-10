# WebSmith Frontend

The frontend client for **WebSmith**, built with React 18, Vite (Rolldown), and Tailwind CSS v4. It provides a responsive UI with rich-text editing, drag-and-drop file uploads, validated forms, and data-visualization charts, and talks to a backend REST API through Axios.

> **Backend:** This repository contains only the frontend. Run the WebSmith backend separately and point this app at it (see [Environment Variables](#environment-variables)).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Guide](#setup-guide)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Build & Deployment](#build--deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Tech Stack

| Category         | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Framework        | React 18                                            |
| Build Tool       | Vite (`rolldown-vite`)                              |
| Styling          | Tailwind CSS v4 (`@tailwindcss/vite`)               |
| Routing          | React Router DOM v7                                 |
| HTTP Client      | Axios                                               |
| Forms            | React Hook Form + Yup (`@hookform/resolvers`)       |
| Rich Text Editor | React Quill                                         |
| File Uploads     | React Dropzone                                      |
| Charts           | Recharts                                            |
| Icons            | Lucide React                                        |
| Linting          | ESLint 9 (react-hooks, react-refresh plugins)       |

---

## Features

- Client-side routing with React Router
- Validated forms using React Hook Form and Yup schemas
- Rich-text content editing with React Quill
- Drag-and-drop file uploads with React Dropzone
- Charts and analytics dashboards with Recharts
- Utility-first, responsive styling with Tailwind CSS v4
- API communication via Axios
- Fast dev server with HMR and optimized production builds

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher (v20+ recommended) — [Download](https://nodejs.org/)
- **npm** v9 or higher (bundled with Node.js)
- **Git** — [Download](https://git-scm.com/)
- A running instance of the **WebSmith backend API**

Verify your versions:

```bash
node -v
npm -v
git --version
```

---

## Setup Guide

### 1. Clone the repository

```bash
git clone https://github.com/sohamkoli29/websmith-frontend.git
cd websmith-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
# macOS / Linux
touch .env

# Windows (PowerShell)
New-Item .env -ItemType File
```

Add the following (adjust to match your backend):

```env
VITE_API_URL=http://localhost:5000/api
```

See [Environment Variables](#environment-variables) for details.

### 4. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173** by default.

### 5. Make sure the backend is running

Start the WebSmith backend on the URL you configured in `VITE_API_URL`. If the backend uses CORS restrictions, allow `http://localhost:5173` as an origin.

### 6. Build for production (optional)

```bash
npm run build
npm run preview
```

The production build is generated in the `dist/` folder.

---

## Environment Variables

Vite only exposes variables prefixed with `VITE_` to client code.

| Variable        | Description                      | Example                      |
| --------------- | -------------------------------- | ---------------------------- |
| `VITE_API_URL`  | Base URL of the backend REST API | `http://localhost:5000/api`  |

Access them in code via:

```js
const baseURL = import.meta.env.VITE_API_URL;
```

> Never commit your `.env` file. It is already covered by `.gitignore`. Restart the dev server after changing any env value.

---

## Available Scripts

| Command           | Description                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR            |
| `npm run build`   | Create an optimized production build in `dist/` |
| `npm run preview` | Serve the production build locally            |
| `npm run lint`    | Run ESLint across the project                 |

---

## Project Structure

```
websmith-frontend/
├── public/              # Static assets served as-is
├── src/                 # Application source code
├── .gitignore
├── eslint.config.js     # ESLint flat config
├── index.html           # App entry HTML
├── package.json
├── package-lock.json
├── vite.config.js       # Vite configuration
└── README.md
```

---

## Build & Deployment

Generate the production bundle:

```bash
npm run build
```

Deploy the contents of `dist/` to any static host.

### Vercel / Netlify

1. Import the repository.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add the `VITE_API_URL` environment variable in the project settings.

### SPA routing fallback

Because the app uses client-side routing, configure your host to serve `index.html` for all routes.

- **Netlify:** add `public/_redirects` with:
  ```
  /*  /index.html  200
  ```
- **Vercel:** add `vercel.json`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

## Troubleshooting

**Port 5173 already in use**
```bash
npm run dev -- --port 3000
```

**Dependency install errors**
Delete `node_modules` and `package-lock.json`, then reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

**CORS errors in the browser console**
Allow your frontend origin (`http://localhost:5173`) in the backend's CORS configuration.

**API calls failing / `undefined` base URL**
Confirm `.env` exists in the project root, the variable starts with `VITE_`, and the dev server was restarted.

**React Quill warnings with React 18**
`react-quill@2` works with React 18 as installed here. Avoid upgrading React to 19 without checking Quill compatibility.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

No license has been specified yet. Add a `LICENSE` file (e.g., MIT) to define usage terms.

---

**Author:** [Soham Koli](https://github.com/sohamkoli29)
