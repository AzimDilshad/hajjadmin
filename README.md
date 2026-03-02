# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Full-stack setup (Frontend + Backend)

This project now includes a Node.js backend API in `backend/server.js` backed by MongoDB.

### Run locally

```sh
npm install
npm run server     # backend on http://localhost:4000 (MongoDB required)
npm run dev        # frontend on http://localhost:5173
```

If needed, configure API base URL in frontend:

```sh
# .env
VITE_API_URL=http://localhost:4000/api
```

Backend env (recommended):

```sh
# .env
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB_NAME=hajjumrah_wayfinder
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=8h
```


### Single-click Windows launcher (.bat)

A one-click launcher is included:

- `launch-local.bat` (repo root)
- `scripts/windows/start-local.bat`

Usage:

1. Double-click `launch-local.bat` in File Explorer.
2. It will:
   - verify Node.js,
   - run `npm install`,
   - ensure MongoDB is reachable (tries Windows `MongoDB` service, then Docker `mongo-wayfinder`),
   - create `.env` defaults if missing,
   - open one terminal for backend (`npm run server`),
   - open one terminal for frontend (`npm run dev`).
3. It auto-opens `http://localhost:5173` in your browser.

To stop the software, close both opened terminal windows.

### End-to-end API test

Run backend end-to-end verification (login + create package/pilgrim/payment/user + status toggle + bootstrap checks):

```sh
npm run test:e2e
```


### API documentation PDF

A generated API reference is available at:

- `docs/api-documentation.pdf`

To regenerate it from `docs/api-documentation.md`:

```sh
npm run docs:api:pdf
```

### Windows 11 hosting (quick guide)

1. Install Node.js LTS.
2. Open PowerShell in the project folder.
3. Run:
   ```powershell
   npm install
   npm run build
   npm run server
   ```
4. In another terminal run `npm run preview` for the frontend.
5. For production, use a process manager (like PM2) and reverse proxy (IIS/Nginx) to expose frontend + API.


### Productivity features added

- Persistent pilgrim **document center** with classification (PP copy, Aadhar, Medical, Visa, Ticket, Photo, Other), upload/view/download/delete and selected-document export.
- Pilgrims page has **document export wizard** to select a pilgrim, choose available docs and export in one click.
- Dashboard **operational alerts** for passports expiring in next 6 months and pilgrims missing documents.
- Pilgrims list includes per-pilgrim **document count** and package tags for faster compliance tracking.
- Packages now support **tags + edit + delete**, improving sorting and operational grouping (e.g., Hajj 2026 group labels).
- Users now support **edit profile, set/reset password and delete** for better admin control.
- Added dynamic **Leads Management** section with status pipeline (New → Converted), follow-up scheduling, assignment and quick search/filter.

### Default login accounts

These users are auto-seeded on first backend start if missing.


> If you add users manually in MongoDB Compass, login works with either:
> - `passwordHash` (bcrypt hash), or
> - temporary plain `password` field (auto-migrated to `passwordHash` on first successful login).

- `admin@goodhope.com / admin123`
- `manager@goodhope.com / manager123`
- `accounts@goodhope.com / acc123`
- `data@goodhope.com / data123`
