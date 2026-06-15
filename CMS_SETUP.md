# Content Management Guide — Netlify CMS

This website uses **[Netlify CMS](https://www.netlifycms.org/)** so you can update text, branches, services, and business info **without writing any code**.

---

## Access the CMS

**Production:**
`https://www.abjatalstar.com/admin`

**Local development:**
`http://localhost:3000/admin`

---

## Local Setup (Two Terminals)

**Terminal 1** — Website:
```bash
npm run dev
```

**Terminal 2** — Netlify CMS proxy (required for local saving):
```bash
npm run cms
```

Then open **http://localhost:3000/admin**

---

## CMS Sections

| Section | What you can edit |
|---------|-------------------|
| **Site Settings** | Business name, phone, email, logo, hours, social links |
| **Home Page** | Hero text, trust badges, all homepage section headings |
| **About Us** | Company story, mission, vision, core values |
| **Services** | Service list, payment partners, page text |
| **Branches** | All branch locations, addresses, phones, hours |
| **How It Works** | Send/receive steps, page text |
| **Contact Us** | Contact form labels, service dropdown options |

---

## How to Edit Content

1. Open **https://www.abjatalstar.com/admin**
2. Sign in with your **admin email and password**
3. Click the section you want (e.g. **Home Page**)
4. Edit the fields
5. Click **Publish** (top right)
6. Vercel rebuilds automatically in 1–2 minutes

---

## Production Setup (Vercel — custom admin login)

The CMS uses a **simple email + password** (no Netlify invites required).

### Step 1 — GitHub Personal Access Token

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. Create a token with **repo** scope (to save CMS changes to GitHub)
3. Copy the token

### Step 2 — Vercel environment variables

**Vercel → Project → Settings → Environment Variables** → add:

| Name | Value |
|------|--------|
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_SESSION_SECRET` | Long random string (e.g. 32+ characters) |
| `GITHUB_TOKEN` | Your GitHub personal access token |
| `GITHUB_REPO` | `yusifu-m-barrie/Abjatalstar` |
| `GITHUB_BRANCH` | `main` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.abjatalstar.com` |

Redeploy Vercel after saving.

### Step 3 — Test

1. Open **https://www.abjatalstar.com/admin**
2. Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`
3. Edit content → **Publish**

---

## Local development

Create `.env.local` from `.env.example` with your admin credentials.

**Terminal 1:** `npm run dev`  
**Terminal 2:** `npm run cms` (local file saving)

Open **http://localhost:3000/admin** and sign in.

---

## Legacy: Netlify Identity (optional, not required)

If you previously set up Netlify Identity, you can ignore it — the CMS now uses custom login + GitHub token instead.

<details>
<summary>Old Netlify Identity setup (archived)</summary>

See git history for Netlify Identity + Git Gateway instructions.

</details>

---

## File Locations

```
public/admin/
  config.yml     ← Netlify CMS configuration
  index.html     ← CMS fallback entry

content/
  settings/site.json
  pages/home.json, about.json, ...
  shared/services.json, branches.json, ...
```

When you publish in Netlify CMS, changes are saved to these JSON files in your Git repo.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `/admin` shows 404 | Restart `npm run dev` |
| **Config.yml 404 error** | Restart `npm run dev` after code updates — config is served at `/admin/config.yml` |
| CMS loads but won't save locally | Run `npm run cms` in a second terminal |
| Can't log in on production | Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` on Vercel and redeploy |
| CMS loads but won't save | Set `GITHUB_TOKEN` with **repo** scope on Vercel |
| Changes not on website | Wait 2 min for Vercel rebuild, or hard-refresh browser |

---

## Need Help?

Contact your developer to add new fields, sections, or update admin credentials.
