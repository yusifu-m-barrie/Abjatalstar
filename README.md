# Abjatal Star Enterprise

Official website for Abjatal Star Enterprise — remittance, FX bureau, and Orange Money services in Sierra Leone.

The public website is built with **Next.js**. Content is managed via **Sanity Studio** at `/admin`.

---

## Quick start (developers)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Sanity Studio

Open [http://localhost:3000/admin](http://localhost:3000/admin).

Before opening `/admin`:
- Create a Sanity project at [sanity.io/manage](https://www.sanity.io/manage)
- Copy your `projectId` into `NEXT_PUBLIC_SANITY_PROJECT_ID`
- Confirm `NEXT_PUBLIC_SANITY_DATASET=production` (or update the dataset in `.env`)

Then login is handled by **Sanity project members** (no custom password system in this repo).

Optional (recommended once): seed the sample singleton documents so the website works immediately:

```bash
node scripts/seed-sanity.mjs
```

---

## Editable content
All business content is editable in **Sanity Studio** (no code changes required).

- **Site Settings**: website name, logo, phone numbers, WhatsApp, email, location/address, business hours, social links, footer text
- **Homepage**: hero title/subtitle/buttons, trust badges, services/branches sections, “how it works”, contact section
- **Services**, **Branches**, **Agents**
- **About Page**, **Contact Page**
- **SEO**: title + description fields for pages

Quick guide for admins/editors:
- Update `/admin` → **Services** to change service text + partner list
- Update `/admin` → **Branches** to change branch locations, addresses, phones, and branch hours
- Update `/admin` → **Agents** to update the authorized agent list
- Update `/admin` → **Contact** and **Site Settings** to update phone/email/address, contact form labels, and business hours
- Update `/admin` → **Homepage** and **About** for those page contents

### Sanity roles (administrator vs website editor)
Sanity Studio login is handled via **Sanity project members**. Website editors are **not** project administrators.

#### Invite a website editor (recommended)
1. Sign in as an **Administrator** at [https://www.abjatalstar.com/admin](https://www.abjatalstar.com/admin).
2. Open the **Invite Editor** tool in the Studio toolbar.
3. Enter the person’s email and click **Invite as Editor**.
4. They receive a Sanity email, accept it, then sign in at `/admin`.
5. They can update homepage, services, branches, about, contact, and site settings. Changes publish to [https://www.abjatalstar.com](https://www.abjatalstar.com).
6. They **cannot** manage members, API tokens, or delete documents.

The invite is always sent with Sanity’s built-in **Editor** role — never Administrator.

#### Manual invite (sanity.io/manage)
If the Studio tool is unavailable:
1. Open [sanity.io/manage](https://www.sanity.io/manage) → your project → **Members**.
2. Click **Invite**.
3. Choose role **Editor** (not Administrator / not Admin).
4. Tell them to open [https://www.abjatalstar.com/admin](https://www.abjatalstar.com/admin) after they accept.

Custom role names `mainAdmin` / `staffEditor` still work if you created them in Sanity. The Studio treats `administrator` / `mainAdmin` as admins and `editor` / `staffEditor` as website editors.

**Plan note:** Sanity’s **Editor** role is on **Growth** ($15/seat/month) and above. On the **Free** plan, only **Administrator** and **Viewer** exist — there is no Editor option in sanity.io/manage. Upgrade to Growth to invite website editors without full admin access. On Free, you can invite as **Administrator** (they can edit the site but also manage the whole Sanity project) or **Viewer** (read-only, cannot edit).

User management:
- To remove access: Studio **Invite Editor** list, or **Members** in Sanity.

Password note:
- Do not share passwords manually.
- If a staff member forgets their password, use the **Forgot password** link on the Sanity login screen.

---

## Branded staff email (AbjatalStar Mail)

Hybrid branded email portal for `@abjatalstar.com` staff. **No DNS changes** are made from this app — it uses existing HostGator/cPanel mailboxes.

Sanity is used only for **website content** and **staff email record storage** (plus activity logs). Mail admin login is **separate** from Sanity CMS at `/admin`.

### Live URLs

| Page | URL |
|------|-----|
| Staff mail login (branded URL → HostGator webmail) | https://www.abjatalstar.com/mail |
| Webmail redirect (alias) | https://abjatalstar.com/webmail → HostGator |
| Email admin dashboard | https://www.abjatalstar.com/admin/email-accounts |

### What is stored vs not stored

| Data | Stored? | Where |
|------|---------|--------|
| Staff mailbox records (name, email, role, status) | Yes | Sanity or local JSON |
| Activity logs (who created/edited/deactivated/deleted) | Yes | Sanity or local JSON |
| Staff mailbox passwords | **Never** | Sent to HostGator API only, then discarded |
| cPanel API token / username | **Never in browser** | Server env vars only (`CPANEL_*`) |
| Mail admin passwords | **Never in code** | Server env vars only (`MAIL_*_PASSWORD`) |

### Staff login flow (`/mail`)

1. Staff open **`/mail`** (or `/webmail`) — a branded AbjatalStar URL on your website.
2. They are redirected immediately to **HostGator webmail** (`WEBMAIL_DESTINATION_URL`, e.g. `https://mail.abjatalstar.com:2096`).
3. Staff sign in **once** on HostGator with their `@abjatalstar.com` email and mailbox password.
4. Optional: share `https://www.abjatalstar.com/mail?email=name@abjatalstar.com` to prefill the email field on the HostGator login page.

**Webmail page branding:** The orange “Webmail” title on the HostGator login screen is controlled by **cPanel on the server**, not this Next.js app. On shared HostGator hosting you typically need to ask HostGator support to replace `webmail-logo.svg` in the cPanel login theme (WHM-level change) if you want “Abjatal Webmail” instead of the default logo.

### Admin roles (`/admin/email-accounts`)

Mail dashboard auth is **not** Sanity. Sign in with role email + password:

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full access, view activity logs, view HostGator API **status** (not credentials), manage server-side cPanel config on Vercel |
| **Admin** | Create/edit/deactivate/delete staff mailboxes, view activity logs — **cannot** see cPanel token or credentials |
| **Staff / Editor** | Read-only staff email list |

### Manual mode (default)

Set `EMAIL_PROVIDER=manual` (or leave unset). No `CPANEL_*` required.

1. Admin signs in at `/admin/email-accounts/login`.
2. Adds staff record (name, username → `ayon@abjatalstar.com`, role, department).
3. Record saves as **Inactive** with instruction to create in HostGator cPanel → Email Accounts.
4. Admin creates mailbox in HostGator manually, then marks record **Active** in dashboard.

### cPanel API mode (optional)

When `CPANEL_HOST`, `CPANEL_USERNAME`, and `CPANEL_API_TOKEN` are set server-side:

1. Admin adds staff with mailbox password.
2. App creates mailbox in HostGator via cPanel API.
3. Record saves as **Active**.
4. Password is sent to HostGator only — **not stored** in dashboard or Sanity.
5. If HostGator API fails, record still saves as **Inactive** with a clear error message.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `EMAIL_PROVIDER` | `manual` (default) or `cpanel` |
| `MAIL_SUPER_ADMIN_EMAIL` / `MAIL_SUPER_ADMIN_PASSWORD` | Super Admin login |
| `MAIL_ADMIN_EMAIL` / `MAIL_ADMIN_PASSWORD` | Admin login |
| `MAIL_EDITOR_EMAIL` / `MAIL_EDITOR_PASSWORD` | Staff/Editor read-only login |
| `CPANEL_HOST` | **Server-only** HostGator server host, e.g. `mail.abjatalstar.com` (not the Vercel website domain) |
| `CPANEL_USERNAME`, `CPANEL_API_TOKEN` | **Server-only** cPanel API credentials |
| `WEBMAIL_DESTINATION_URL` | HostGator webmail URL, e.g. `https://mail.abjatalstar.com:2096` |
| `NEXT_PUBLIC_WEBMAIL_URL` | Branded staff entry URL, e.g. `https://abjatalstar.com/mail` |
| `NEXT_PUBLIC_WEBMAIL_DIRECT_URL` | Direct HostGator webmail URL (optional public link) |
| `NEXT_PUBLIC_BRAND_NAME` | `AbjatalStar` |
| `NEXT_PUBLIC_MAIL_DOMAIN` | `abjatalstar.com` |
| `SANITY_API_TOKEN` | Persists staff records + activity logs in production |

### Provider architecture

```
src/lib/email-providers/
  types.ts            — provider interface
  manual-provider.ts  — default when cPanel API is not configured
  cpanel-provider.ts  — HostGator mailbox create / password / delete
  cpanel-client.ts    — cPanel UAPI calls (server-only)
src/lib/mail-admin-roles.ts   — Super Admin / Admin / Editor permissions
src/lib/email-accounts/activity-log.ts — audit trail
```

---

## Deploy (live site)

**Live website:** https://www.abjatalstar.com  
**Live CMS (Sanity Studio):** https://www.abjatalstar.com/admin

Deploy the Next.js app on **Vercel** and set these environment variables in the project dashboard:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.abjatalstar.com` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | your Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2025-01-01` |

In [sanity.io/manage](https://www.sanity.io/manage) → **API** → **CORS origins**, add:

- `https://www.abjatalstar.com`
- `http://localhost:3000` (for local editing)

After deploy, open **https://www.abjatalstar.com/admin** to edit content. Changes publish from Sanity and appear on the live site.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

---
