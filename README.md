# SideCar

**The Navy's Agentic Distribution Platform**

Navy Personnel Command · NPC Agentic Lab · March 2026

---

## 🚀 New Here? One Command and You're In.

```bash
git clone https://github.com/DevinnOneill/Project-Sidecar.git && cd Project-Sidecar/sidecar-app && npm install && npm run dev
```

**That's it.** Copy-paste the command above, hit Enter, and the onboarding script walks you through everything:

| What It Does | Time |
|---|---|
| Explains what SideCar is | 1 min |
| How the project works | 1 min |
| Sets up your workspace | automatic |
| Switches to your assigned branch | automatic |
| Opens SideCar in your browser | automatic |
| Teaches you the 7 rules | 2 min |
| Shows you how to save work | 1 min |
| Git commands cheat sheet | 1 min |

**No experience needed. Takes about 5 minutes. Everything is explained.**

> 📖 Also see: [START_HERE.md](START_HERE.md) — one command, one page.

---

## What is SideCar?

SideCar modernizes how the Navy distributes Sailors to assignments. Right now, Detailers juggle **4 disconnected tools** — MyNavy Assignment exports, NSIPS, Outlook, and local spreadsheets. SideCar puts it all in **one browser-based dashboard**.

**Who uses SideCar:**

Every stakeholder within the distribution workflow. 


**Current phase:** Phase 1A — Proof of Concept. All data is synthetic (fake but realistic). No real Sailor records.

---

## How This Project Works

This project uses a **governed development framework**. Here's the short version:

| Concept | What It Means |
|---------|---------------|
| **One file at a time** | You work on ONE file per session. Need another? New session. |
| **AI assistant** | Opens automatically in your editor. Knows the rules. Guides you. |
| **Guardrails** | Git hooks catch mistakes at commit time. Clear error messages. |
| **Code review** | Your branch → QA review → production. Nothing skips a step. |
| **Halts are good** | If the system stops you, it caught something. Read the message, fix it. |

### Branch Workflow

```
dev-1 or dev-2  →  main
  (your team)      (production)
```

The project uses exactly four fixed branches. Developers push to their assigned branch (dev-1 or dev-2). Nobody creates new branches. Nobody's code goes straight to production. Ever.

---

## The 7 Rules

These are enforced automatically by git hooks and AI. You don't need to memorize them — the system will stop you and explain what's wrong. Full detail with constraint IDs: [ONBOARDING.md](ONBOARDING.md) §"The 7 Rules".

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | React 19 + TypeScript | Component-based architecture with full type safety. |
| **Build Tool** | Vite | Fast HMR development, optimized production builds. |
| **Routing** | React Router v7 | Client-side routing between modules. |
| **Animation** | Framer Motion | Declarative animations for state transitions. |
| **Styling** | CSS Custom Properties | Component-scoped CSS files with design tokens in `src/index.css`. |
| **Data** | Synthetic in `SyntheticData.ts` | No database. Adapter pattern for future Graph API. |
| **Fonts** | Inter + DM Mono | System fallbacks if missing. |
| **Deployment** | SPFx / Microsoft 365 | Target: NMCI via SharePoint Framework web parts. |

**Why this stack?** SideCar targets SPFx deployment on Microsoft 365 for NMCI. Vite + React + TypeScript gives us component-based architecture, full type safety, and optimized builds that compile to Chrome 110+ compatible output.

---

## File Map

```
Project-Sidecar/
├── START_HERE.md ............. New? Start here
├── README.md ................. You are reading this
├── ONBOARDING.md ............. The rules + onboarding guide
├── GIT.md .................... Git workflow guide
├── WHITE_PAPER.md ............ Governance framework
├── CHANGELOG.md .............. Merge history
│
├── sidecar-app/ .............. React application
│   ├── src/
│   │   ├── Landing/ .......... Landing page (role selector, search)
│   │   ├── Workspace/ ........ Detailer workspace (roster, calendar, actions)
│   │   ├── Personnel/ ........ Sailor record view (radar chart, comm log)
│   │   ├── Command/ .......... Command manning view
│   │   ├── Analytics/ ........ Portfolio analytics dashboard
│   │   ├── AdvancedSearch/ ... SQL-like query builder
│   │   ├── components/ ....... Shared components (Topbar)
│   │   ├── models/ ........... TypeScript interfaces (ISailor.ts)
│   │   ├── services/ ......... Business logic + data layer
│   │   │   ├── SideCarAdapter.ts ... Data access interface
│   │   │   ├── PrdEngine.ts ....... PRD computation (LOCKED)
│   │   │   └── SyntheticData.ts ... Test data generator
│   │   ├── App.tsx ........... Router + layout
│   │   ├── index.css ......... Design tokens (:root)
│   │   └── main.tsx .......... Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── directives/ ............... Governance documents
│   ├── Gemini.md ............. Master Session Brief
│   ├── DEVELOPMENT.md ........ Code standards, commit format
│   ├── SECURITY.md ........... Data boundary law
│   ├── UI-UX.md .............. Design system specs
│   └── INTEGRATIONS.md ....... Adapter contracts
│
├── workflow/ .................. Module routing
│   └── MODULE-MAP.md ......... Which module owns which file
```

---

## Design System

SideCar uses the **Covenant Design System** — light mode only, white surfaces with brass gold accents. All tokens are defined in `src/index.css` (`:root`). Full spec: [directives/UI-UX.md](directives/UI-UX.md).

---

## Commit Format

```
[SC-YYYY-MMDD-NNN] MODULE-ID: Brief description
```

**Example:**
```
[SC-2026-0327-001] MOD-DET: Add PRD tier column to dashboard table
```

**Module IDs:** See [`workflow/MODULE-MAP.md`](workflow/MODULE-MAP.md) for the full module-to-file routing table.

---

## Microsoft 365 Integration Roadmap

The adapter pattern makes this seamless. Pages never know where data comes from:

```
Phase 1A (now):   getSailors() → embedded JS array
Phase 1B (next):  getSailors() → Microsoft Graph API
Phase 2 (target): getSailors() → Dataverse API
```

| Phase | Data | Gate to Next |
|---|---|---|
| **1A** (current) | Synthetic only | COMNAVPERSCOM sponsorship + GCC High tenant |
| **1B** | Real Sailor records (pilot) | RMF assessment initiated |
| **2** | Full Navy data | ATO issued through DoD RMF |

---

## Glossary

Full Navy + project terminology: [`directives/Gemini.md`](directives/Gemini.md) §18 — Navy Terminology.

---

## Need Help?

| Question | Where to Look |
|---|---|
| How do I use git? | [GIT.md](GIT.md) |
| What CSS class do I use? | `src/index.css` or [UI-UX.md](directives/UI-UX.md) |
| How do I get data? | `src/services/SideCarAdapter.ts` → `SideCarAdapter.getSailors()` |
| What are the rules? | [Gemini.md](directives/Gemini.md) Section 5 |
| My commit was rejected | Read the error — hooks tell you exactly what's wrong |
| My PR failed QA | Fix the violations, push again — QA re-runs automatically |

---

