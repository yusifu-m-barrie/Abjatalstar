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

Hybrid email portal — **no DNS or HostGator changes** from the app. Uses existing `@abjatalstar.com` mailboxes on HostGator/cPanel.

### Live URLs

| Page | URL |
|------|-----|
| Staff mail login | https://www.abjatalstar.com/mail |
| Webmail gateway | https://abjatalstar.com/webmail → HostGator |
| Email admin dashboard | https://www.abjatalstar.com/admin/email-accounts |

### Environment variables (Vercel)

| Variable | Purpose |
|----------|---------|
| `EMAIL_PROVIDER` | `manual` (default) or `cpanel` (scaffold only) |
| `NEXT_PUBLIC_WEBMAIL_URL` | Branded gateway, e.g. `https://abjatalstar.com/webmail` |
| `WEBMAIL_DESTINATION_URL` | Real HostGator webmail URL (server-only) |
| `NEXT_PUBLIC_BRAND_NAME` | `AbjatalStar` |
| `NEXT_PUBLIC_MAIL_DOMAIN` | `abjatalstar.com` |
| `MAIL_ADMIN_PASSWORD` | Password for `/admin/email-accounts` |
| `SANITY_API_TOKEN` | Persists staff email records in production |

Optional: `NEXT_PUBLIC_WEBMAIL_DIRECT_URL` for the “Open Webmail Directly” button.

### Staff login flow

1. Staff opens `/mail` and enters `@abjatalstar.com` email + mailbox password.
2. Password is **never stored** — only validated locally, then cleared.
3. User is sent to `/webmail`, which redirects to HostGator webmail.
4. Staff completes sign-in on HostGator (existing cPanel mailboxes).

### Admin email workflow

1. Open `/admin/email-accounts/login` → enter `MAIL_ADMIN_PASSWORD`.
2. Add staff record (name, email, role, department).
3. System shows: *Create this email inside HostGator cPanel → Email Accounts.*
4. Create the mailbox in HostGator manually.
5. Mark the record **Active** in the dashboard.

### Provider architecture

```
src/lib/email-providers/
  types.ts            — provider interface
  manual-provider.ts  — default (in use)
  cpanel-provider.ts — scaffold only, no live API calls
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
