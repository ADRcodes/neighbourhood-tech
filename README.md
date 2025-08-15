# Neighbourhood Tech — Frontend

![Deploy Frontend to S3](https://github.com/ADRcodes/neighbourhood-tech/actions/workflows/deploy-s3.yml/badge.svg)

A Vite + React + Tailwind single‑page app (SPA) for the Neighbourhood Tech project.

---

## Tech stack

* **Vite** (React)
* **Tailwind CSS**
* **Node 20** (recommended)
* **GitHub Actions** → **AWS S3 (Static Website Hosting)**

---

## Quick start (local dev)

1. **Install deps**

   ```bash
   npm ci
   ```
2. **Point the app at your local API** (Spring Boot dev profile runs on `:8080`):

   ```ini
   # .env.development
   VITE_API_URL=http://localhost:8080
   ```
3. **Run**

   ```bash
   npm run dev   # http://localhost:5173
   ```

> The app reads `import.meta.env.VITE_API_URL` at build/runtime. Example usage:
>
> ```ts
> const api = import.meta.env.VITE_API_URL;
> fetch(`${api}/events`).then(r => r.json())
> ```

---

## Building

```bash
npm run build   # outputs to dist/
```

---

## Environment variables

* **`VITE_API_URL`** – base URL of the backend API

  * **Dev:** `http://localhost:8080`
  * **Prod:** set via GitHub Actions **Repository Variable** so we don’t hardcode it in the repo (see CI/CD below)

> Create a local example with:
>
> ```bash
> cp .env.development .env.development.local # optional overrides ignored by git
> ```

---

## CI/CD (GitHub Actions → S3)

**Workflow:** `.github/workflows/deploy-s3.yml`

* Triggers on **push to `main`** (and manual **Run workflow**)
* Builds the app with Node 20
* Assumes an AWS IAM role via **GitHub OIDC** (no long‑lived keys)
* Syncs `dist/` to S3 bucket **`neighbourhood-tech`** in **`us-east-1`**
* Sets `index.html` **no‑cache** to avoid SPA update issues; hashed assets keep default caching

**Repo Variable (prod API URL):** `VITE_API_URL = http://100.28.99.197`

**S3 website endpoint:**

```
http://neighbourhood-tech.s3-website-us-east-1.amazonaws.com
```

> If the bucket name/region ever changes, update both the workflow `S3_BUCKET` env and the backend CORS allowlist.

---

## Manual deploy (fallback)

If you need to deploy without CI (AWS CLI configured to the target account):

```bash
npm ci && npm run build
aws s3 sync dist s3://neighbourhood-tech --delete
aws s3 cp s3://neighbourhood-tech/index.html s3://neighbourhood-tech/index.html \
  --metadata-directive REPLACE \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"
```

---

## CORS & backend

The backend (Spring Boot) controls CORS via an env var, e.g. `APP_ALLOWED_ORIGINS`. Make sure the **exact** S3 website origin is allowed, plus `http://localhost:5173` for local dev.

---

## Troubleshooting

* **Workflow step ‘Configure AWS (OIDC)’ fails** → The IAM role trust policy must match `repo:ADRcodes/neighbourhood-tech:ref:refs/heads/main` and audience `sts.amazonaws.com`.
* **Deployed site doesn’t update** → We force `index.html` to no‑cache; hard refresh. If still stale, confirm you’re visiting the **website endpoint** for the correct bucket/region.
* **CORS errors in browser** → Update backend `APP_ALLOWED_ORIGINS` to include your S3 website origin.
* **SPA 404s on refresh** → S3 Static website hosting **Error document = index.html**.
* **Build uses wrong API URL** → Check the repo **Variable** `VITE_API_URL` (and any `.env.*` overrides used during the build).

---

## Scripts

* `npm run dev` – Vite dev server
* `npm run build` – production build to `dist/`
* `npm run preview` – preview the built app locally

---

## Project structure (typical)

```
.
├─ public/           # static assets copied as-is
├─ src/
│  ├─ components/
│  ├─ pages/
│  ├─ hooks/
│  ├─ lib/          # API helpers, utils
│  ├─ styles/
│  └─ main.tsx      # app entry
├─ index.html
├─ vite.config.ts
├─ package.json
└─ tailwind.config.ts
```

---

## Contributing (team workflow)

* Branch from `main`, open a PR
* CI will build PRs; only `main` triggers a deploy
* Keep `.env.development` pointing to `http://localhost:8080` for local work

---

## Notes

* Node 20 is recommended for CI parity
* The deploy workflow uses concurrency to cancel overlapping runs
* Hashed assets are cache‑friendly; `index.html` is forced no‑cache to pull new bundles
