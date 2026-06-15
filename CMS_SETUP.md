# Content Management Guide — Netlify CMS

This website uses **[Netlify CMS](https://www.netlifycms.org/)** so you can update text, branches, services, and business info **without writing any code**.

---

## Access the CMS

**Production (after Netlify deploy):**
`https://your-website.com/admin`

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
6. On Netlify, the site rebuilds automatically in 1–2 minutes

---

## Netlify Production Setup (One-Time)

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
| Can't log in on production | Enable Netlify Identity + Git Gateway |
| Changes not on website | Wait 2 min for Netlify rebuild, or hard-refresh browser |

---

## Need Help?

Contact your developer to add new fields, sections, or fix Netlify Identity setup.
