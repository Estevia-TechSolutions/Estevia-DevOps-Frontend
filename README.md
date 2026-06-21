# EvaOps — CloudOps Management & Governance (Frontend)

EvaOps is a DevOps control centre for managing Azure cloud resources, CI/CD pipelines, cost analytics, DNS bindings, credentials, and team access — built with React + TypeScript + Vite.

---

## Quick Start

```bash
npm install
npm run dev        # Development server at http://localhost:5173
npm run build      # Production build
```

### Environment Variables

Create a `.env` file at the project root:

```
VITE_API_BASE=http://localhost:5005/api
```

---

## Login Modes

EvaOps supports three login methods available on the login screen:

### 1. Sign in with Microsoft (Primary)
Standard Microsoft Entra ID (Azure AD) OAuth 2.0 SSO flow.
The user's role is determined by their DB record and is **never overwritten** by the SSO-derived default on re-login. Role changes made in Team Settings are permanently preserved.

### 2. Developer Override *(Viewer only)*
A quick-access login for local development and testing.
- **No password required** — requires entering the target **Organisation ID** (e.g. `estevia`)
- **Always logs in as `viewer` role** — read-only access, no mutations
- **Role preservation** — is reset to `viewer` on every login and during directory sync bypass.
- Session expires in 30 days

Use this to browse the dashboard and UI for any registered organisation without needing Azure AD credentials.

### 3. Admin Override *(Password protected)*
A password-protected backdoor that grants `admin`-level access to any registered organisation.
Intended for emergency access, onboarding support, and troubleshooting.

#### How it works
- Click **Admin Override** on the login screen
- Enter your **Organisation ID** (e.g. `estevia`)
- Enter the **Admin Override password** (see formula below)

#### ⚠️ Password Formula

```
Password = {First 4 letters of Org ID — UPPERCASE} + "2026" + "CbEt06"
```

| Organisation ID | First 4 Letters | Password          |
|-----------------|-----------------|-------------------|
| `estevia`       | `ESTE`          | `ESTE2026CbEt06`  |
| `protrack`      | `PROT`          | `PROT2026CbEt06`  |
| `connecthub`    | `CONN`          | `CONN2026CbEt06`  |
| `talenthq`      | `TALE`          | `TALE2026CbEt06`  |
| `docai`         | `DOCA`          | `DOCA2026CbEt06`  |

> **Notes:**
> - Only alphanumeric characters in the org ID are counted (hyphens/spaces are stripped).
> - The formula is case-sensitive — type it exactly as shown.
> - Admin Override sessions expire after **8 hours** (shorter than regular sessions for security).
> - Do not share this formula externally. Rotate by updating the suffix in `authController.js`.

---

## Role Hierarchy

| Role          | Description                                                  |
|---------------|--------------------------------------------------------------|
| `owner`       | Full access — can manage other owners                        |
| `admin`       | Full access — except decrypted secrets & owner management    |
| `contributor` | Can provision, deploy, manage DNS, pipelines, and databases  |
| `viewer`      | Read-only — dashboards, cost metrics, logs, scans            |

---

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + Lucide icons
- **Styling**: Vanilla CSS with CSS custom properties (dark/light theme)
- **Backend**: Node.js/Express REST API (`Estevia-DevOps-Backend`)
- **Auth**: Microsoft Entra ID (MSAL OAuth2) + JWT
- **Database**: MySQL via Azure Database for MySQL

---

## Key Features

- ☁️ Azure SWA & Container App cloud scanning
- 🚀 Guided provisioning wizard (frontend & backend apps)
- 💸 Azure cost breakdown & AI-driven optimization recommendations
- 🔗 GoDaddy DNS domain binding automation
- 🔁 Azure DevOps CI/CD pipeline registration & triggering
- 🗄️ DB Hub — schema browser, raw SQL, migration wizard
- 🔐 AES-256-GCM encrypted credential vault
- 👥 Team & role management with Azure AD sync
- 📋 Real-time events feed & audit trail
