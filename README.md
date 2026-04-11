# 🖊️ Inkwell — Notes App

A production-ready, full-stack notes application with a minimal, editorial UI.

**Stack:** React + Vite + Tailwind CSS + Framer Motion · Node.js + Express · MongoDB + Mongoose · JWT Auth

---

## 📂 Project Structure

```
notes-app/
├── backend/
│   ├── server.js                 # Express app entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema (bcrypt + JWT)
│   │   ├── Note.js               # Note schema (tags, color, wordCount)
│   │   └── Folder.js             # Folder schema
│   ├── controllers/
│   │   ├── authController.js     # signup, login, getMe
│   │   ├── noteController.js     # CRUD + search + bulk delete
│   │   ├── folderController.js   # Folder CRUD + note counts
│   │   └── userController.js     # Profile, password, account
│   ├── routes/
│   │   ├── auth.js
│   │   ├── notes.js
│   │   ├── folders.js
│   │   └── users.js
│   └── middleware/
│       ├── auth.js               # JWT protect middleware
│       └── errorHandler.js       # Global error handler
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx               # Routes + Providers
        ├── index.css             # Tailwind + dark mode + MD editor styles
        ├── context/
        │   ├── AuthContext.jsx   # Auth state + login/logout
        │   └── ThemeContext.jsx  # Dark/light mode
        ├── hooks/
        │   ├── useNotes.js       # Notes CRUD state
        │   ├── useFolders.js     # Folder state
        │   └── useAutoSave.js    # Debounced auto-save
        ├── utils/
        │   └── api.js            # Axios instance + all API calls
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   └── DashboardPage.jsx # Main 3-panel layout
        └── components/
            ├── Sidebar.jsx       # Nav + folders + user info
            ├── NoteCard.jsx      # Note preview card
            ├── NoteEditor.jsx    # Markdown editor + meta panel
            └── LoadingScreen.jsx
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18+ 
- **MongoDB** running locally (or a MongoDB Atlas connection string)

---

### 1. Clone & set up the backend

```bash
cd notes-app/backend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/notesapp
JWT_SECRET=replace_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev        # Development (nodemon, auto-restart)
# or
npm start          # Production
```

✅ Backend runs on **http://localhost:5000**

---

### 2. Set up the frontend

```bash
cd notes-app/frontend

# Install dependencies
npm install

# (Optional) Copy env file — Vite proxy handles /api by default
cp .env.example .env
```

Start the frontend:
```bash
npm run dev
```

✅ Frontend runs on **http://localhost:5173**

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/notesapp` |
| `JWT_SECRET` | Secret for signing JWTs | ⚠️ **Change this!** |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | API base URL | Auto-proxied via Vite |

> The Vite dev server proxies `/api/*` → `http://localhost:5000/api/*` automatically.
> You only need `VITE_API_URL` when deploying to production without a proxy.

---

## 🌐 API Reference

### Auth — `/api/auth`
| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/signup` | ❌ | `{name, email, password}` | Create account |
| POST | `/login` | ❌ | `{email, password}` | Login, get JWT |
| GET | `/me` | ✅ | — | Get current user |

### Notes — `/api/notes`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | ✅ | Get notes (query: `folder`, `tag`, `pinned`, `archived`) |
| GET | `/search?q=` | ✅ | Full-text search |
| GET | `/:id` | ✅ | Get single note |
| POST | `/` | ✅ | Create note |
| PUT | `/:id` | ✅ | Update note |
| DELETE | `/:id` | ✅ | Delete note |
| DELETE | `/` | ✅ | Bulk delete `{ids: [...]}` |

### Folders — `/api/folders`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | ✅ | Get all folders with note counts |
| POST | `/` | ✅ | Create folder `{name, icon, color}` |
| PUT | `/:id` | ✅ | Update folder |
| DELETE | `/:id` | ✅ | Delete folder (notes moved to Uncategorized) |

### Users — `/api/users`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/profile` | ✅ | Get profile + stats |
| PUT | `/profile` | ✅ | Update `{name, avatar, theme}` |
| PUT | `/password` | ✅ | Change password |
| DELETE | `/account` | ✅ | Delete account + all data |

---

## ✨ Features

- 🔐 **JWT Authentication** — Signup, Login, persistent sessions
- 📝 **Markdown Notes** — Full markdown editor with live preview
- 💾 **Auto-save** — Notes save automatically 1.2s after you stop typing
- 📁 **Folders** — Organize notes, move between folders
- 🔍 **Full-text Search** — Search by title, content, and tags
- 🏷️ **Tags** — Add up to 10 tags per note
- 📌 **Pin Notes** — Pinned notes always appear first
- 🎨 **Color Labels** — Visual color coding for notes
- 🌙 **Dark Mode** — System-aware, toggleable
- 📦 **Archive** — Archive notes without deleting
- 📱 **Responsive** — Full mobile support with slide-out sidebar

---

## 🚀 Deploying to Production

### Backend (e.g. Railway, Render, Fly.io)
1. Set all environment variables in your platform dashboard
2. Set `NODE_ENV=production`
3. Use a strong random `JWT_SECRET`
4. Use a MongoDB Atlas connection string for `MONGODB_URI`
5. Deploy with `npm start`

### Frontend (e.g. Vercel, Netlify)
1. Set `VITE_API_URL=https://your-backend-url.com/api`
2. Run `npm run build` → deploy the `dist/` folder

---

## 🛠️ Tech Choices

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast dev, great DX |
| Styling | Tailwind CSS v3 | Utility-first, dark mode |
| Animations | Framer Motion | Smooth, physics-based |
| MD Editor | @uiw/react-md-editor | Lightweight, customizable |
| HTTP | Axios | Interceptors for auth |
| Backend | Express.js | Minimal, battle-tested |
| Database | MongoDB + Mongoose | Flexible schema, fast queries |
| Auth | JWT + bcryptjs | Stateless, secure |
| Validation | express-validator | Declarative input validation |
| Security | Helmet + rate-limit | Production hardening |
