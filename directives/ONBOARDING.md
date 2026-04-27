# ONBOARDING.md — New Developer Protocol

> **Version:** 3.0 | **Domain:** Developer Onboarding, Formal Gates, Role Authority
> **Amended:** 2026-04-11 — Stripped content duplicated from root ONBOARDING.md
> **Authority:** Tier 1
> **Loaded By:** Any session involving a new developer or agent

---

## 0. New Here? Start with ONBOARDING.md

If this is your first time touching this project, read `ONBOARDING.md` in the project root **before anything else**. It's written in plain English and walks you through everything — setup, rules, workflow, environment, common mistakes, and glossary. Then come back here for the formal gates below.

## 1. Before You Write Any Code

No developer begins production work until three gates are cleared:

### Gate 0: Onboarding Agent
One command — clone and onboard in one shot:
```bash
git clone https://github.com/DevinnOneill/Project-Sidecar.git && cd Project-Sidecar/sidecar-app && npm install && npm run dev
```
The onboarding agent walks you through everything: git hooks, branch creation, dependency verification, the 7 rules, and first-run orientation. One-time per clone. If you've already onboarded, it detects the `.onboarded` sentinel and skips.

### Gate 1: Directive Library Review
Read every file in this order. Confirm understanding of each.
1. `directives/Gemini.md` — Master Session Brief
2. `directives/DEVELOPMENT.md` — Development Standards
3. `directives/SECURITY.md` — Data Boundary Law
4. `directives/UI-UX.md` — Covenant Design System
5. `directives/INTEGRATIONS.md` — Adapter Contracts
6. `directives/AUDIT.md` — Verification Protocol
7. `directives/TESTING.md` — Quality Gate
8. This file (`directives/ONBOARDING.md`)

### Gate 2: Load Confirmation Session
The Orchestrator (or Tier 1) conducts a verbal or written confirmation:
- Can you state the 5 Covenant principles?
- What are the 14 constitutional constraints?
- What is the module boundary for the page you will be working on?
- What happens when your Execution Script is ambiguous?
- Where does data come from and how do you access it?
- What are the four QA dimensions and the pass threshold?

### Gate 3: First Commit Review
Your first commit is reviewed by Tier 1 regardless of QA gate status. This is not a trust issue — it is a calibration step. Tier 1 confirms that your output matches the governance model before you operate independently.

## 2. The Development Team — Role Map

All 5 developers are:
- Subject matter experts in Navy personnel management and distribution
- The ultimate end users of what is being built
- Operating as Tier 3 Module Agents under the governance framework

The AI agent is the primary development and governance LLM, operating through Cursor, VS Code, and other AI-assisted IDE sessions.

| Role | Authority | Constraint |
|---|---|---|
| Module Agent (each developer + AI) | Feature code within assigned module boundary | Active Execution Script required. Boundary explicitly defined. |
| Tier 1 (OSC Oneil) | Directive Library ownership. Sole merge authority. | Full program context. Authors the directives. |
| Orchestrator (AI session manager) | Session management. Execution Script generation. | No production code authority. |
| Verifier (independent AI instance) | Pass/halt verdict on output. | AUDIT.md only. Zero execution context. |
| QA Agent (AI or human) | Quality gate scoring. | TESTING.md loaded. Thresholds confirmed. |

---

*For development environment setup, first-session walkthrough, common mistakes, and locator references, see [`ONBOARDING.md`](../ONBOARDING.md) in the project root.*

*ONBOARDING.md v3.0 — SideCar Directive Library — Amended 2026-04-11*
