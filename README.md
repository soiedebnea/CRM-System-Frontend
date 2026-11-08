# CRM Frontend

Web interface for the CRM: search and filter contacts, manage tags, write notes and track follow-up reminders.
Built with React and Vite.

## Requirements
- Node.js 18 or newer
- The backend running (see `../backend/README.md`)

## Setup
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

> Don't open `index.html` by double-clicking it. The app must be served by Vite, otherwise the browser blocks the scripts.

## Environment variables (`.env`)
| Name | Description |
|------|-------------|
| `VITE_API_URL` | Base URL of the backend, with no trailing slash and no `/api` |

Local development:
```env
VITE_API_URL=http://localhost:5000
```
Production:
```env
VITE_API_URL=https://your-backend-domain.com
```
Restart `npm run dev` after changing `.env`. Variables must start with `VITE_`.
Also set `CLIENT_ORIGIN` in the backend `.env` to the URL where this frontend is hosted.

If `VITE_API_URL` is empty, the app calls `/api` on its own address and relies on the Vite proxy in `vite.config.js` (forwards to `http://localhost:5000`). Setting `VITE_API_URL` is the more reliable option.

## Production build
```bash
npm run build       # output in dist/
npm run preview     # test the build locally
```
Deploy the `dist/` folder to any static host (Netlify, Vercel, Nginx, etc.).

## Project structure
```
frontend/
├── src/
│   ├── main.jsx        Entry point
│   ├── App.jsx         Sidebar (search, tags, contact list) and follow-ups overview
│   ├── Detail.jsx      Contact form, reminders and notes
│   ├── api.js          All backend calls
│   ├── utils.js        Date helpers
│   └── styles.css
├── index.html
├── vite.config.js      Dev server and API proxy
├── package.json
└── .env.example
```

## Features
- Search by name, email, company or phone
- Filter by tag with live counts
- Create, edit and delete contacts
- Timestamped notes per contact
- Follow-up reminders with due dates and a done checkbox
- Home view listing all pending follow-ups, with overdue ones highlighted

## Troubleshooting
| Problem | Fix |
|---------|-----|
| Blocked by CORS on `file:///...` | You opened `index.html` directly. Use `npm run dev` and open `http://localhost:5173` |
| `React is not defined` | Make sure `vite.config.js` is in the `frontend` folder, next to `package.json` |
| `ERR_CONNECTION_REFUSED` on `localhost:5000` | The backend isn't running. Start it from the `backend` folder |
| "Unexpected response from the backend" | Set `VITE_API_URL` in `.env` and restart the dev server |
| Old behavior after editing files | Stop the dev server, run `npm run dev` again, and hard refresh with Ctrl+Shift+R |
