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

### Sanity roles (main admin vs staff editor)
Sanity Studio login is handled via **Sanity project members**.

Recommended member setup (in `sanity.io/manage`):
1. Invite the **Main Admin** (workspace role with full admin permissions).
2. Invite a **Staff Editor** (workspace permissions for editing content only).
3. Assign roles in Sanity named:
   - `mainAdmin` for the Main Admin
   - `staffEditor` for Staff/Edit users

User management:
- To remove access: go to **Members** in Sanity and remove the user.

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
| Staff mail login (branded gateway) | https://www.abjatalstar.com/mail |
| Webmail redirect | https://abjatalstar.com/webmail → HostGator |
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

1. Staff opens `/mail` — a **secure branded gateway** to staff webmail.
2. They enter `@abjatalstar.com` email + mailbox password.
3. The page validates input, shows a loading state, clears the password from memory, and redirects to `/webmail`.
4. `/webmail` redirects to HostGator webmail (`WEBMAIL_DESTINATION_URL`, e.g. `https://abjatalstar.com:2096`).
5. Staff complete sign-in on HostGator. **Passwords are never stored, logged, or saved** by this site.

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
| `CPANEL_HOST`, `CPANEL_USERNAME`, `CPANEL_API_TOKEN` | **Server-only** HostGator API (never exposed to browser) |
| `NEXT_PUBLIC_WEBMAIL_URL` | Branded gateway, e.g. `https://abjatalstar.com/webmail` |
| `WEBMAIL_DESTINATION_URL` | HostGator webmail URL, e.g. `https://abjatalstar.com:2096` |
| `NEXT_PUBLIC_WEBMAIL_DIRECT_URL` | Direct webmail button on `/mail` |
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
