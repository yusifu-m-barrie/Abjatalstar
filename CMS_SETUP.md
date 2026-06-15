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

1. Open `/admin`
2. Log in (on Netlify: use your invited email; locally: no login needed if proxy is running)
3. Click the section you want (e.g. **Home Page**)
4. Edit the fields
5. Click **Publish** (top right)
6. On Vercel, the site rebuilds automatically in 1–2 minutes

---

## Production Setup (Vercel + Netlify)

The live site runs on **Vercel** (`https://www.abjatalstar.com`). CMS login uses **Netlify Identity + Git Gateway** on a linked Netlify site.

### Step 1 — Netlify site (same GitHub repo)

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
2. Connect `yusifu-m-barrie/Abjatalstar` (same repo as Vercel)
3. Deploy once (build: `npm run build`, plugin in `netlify.toml`)
4. Note your Netlify URL, e.g. `https://abjatalstar.netlify.app`

### Step 2 — Enable Identity + Git Gateway

On the Netlify site:

1. **Site configuration → Identity** → **Enable Identity**
2. **Identity → Services → Git Gateway** → **Enable**
3. **Identity → Registration** → **Invite only**
4. **Identity → Invite users** → invite the business owner’s email
5. **Identity → Settings:**
   - **Site URL:** `https://www.abjatalstar.com/admin` (invite links open the CMS login page)
   - Allow login from your production domain

### Accepting an invite (first-time users)

1. Open the link from the Netlify invite email (it may land on the homepage — that is OK)
2. A **Set your password** popup should appear automatically
3. If no popup appears, go to `https://www.abjatalstar.com/admin` and log in with the invited email
4. After setting a password, use **https://www.abjatalstar.com/admin** to edit content

### Step 3 — Vercel environment variable

In **Vercel → Project → Settings → Environment Variables**, add:

| Name | Value | Example |
|------|--------|---------|
| `NETLIFY_SITE_URL` | Your real Netlify site URL (must start with `https://`) | `https://abjatalstar.netlify.app` |
| `NEXT_PUBLIC_SITE_URL` | Production domain | `https://www.abjatalstar.com` |

Redeploy Vercel after saving. This proxies `/.netlify/identity` and `/.netlify/git` to Netlify so CMS works on Vercel.

### Step 4 — Test

1. Open `https://www.abjatalstar.com/admin`
2. Log in with the invited email
3. Edit content → **Publish** → Vercel rebuilds from GitHub in ~1–2 minutes

**Optional:** In Netlify, disable auto-deploy if you only want Vercel to build the public site (Identity still works).

---

## Netlify-Only Hosting (Alternative)

If you move the whole site to Netlify, skip `NETLIFY_SITE_URL` on Vercel — Identity works automatically on the same domain.

1. Push this project to **GitHub**
2. [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
3. Connect your repo (build settings are in `netlify.toml`)
4. After deploy: **Site settings → Identity** → **Enable Identity**
5. **Identity → Services → Git Gateway** → **Enable**
6. **Identity → Invite users** → Invite the business owner
7. Visit `yoursite.com/admin` and log in with the invited email

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
| Can't log in on production | Enable Netlify Identity + Git Gateway; set `NETLIFY_SITE_URL` on Vercel and redeploy |
| **Unable to access identity settings** | Netlify Identity/Git Gateway not enabled, or `NETLIFY_SITE_URL` missing on Vercel |
| Changes not on website | Wait 2 min for Vercel rebuild, or hard-refresh browser |

---

## Need Help?

Contact your developer to add new fields, sections, or fix Netlify Identity setup.
