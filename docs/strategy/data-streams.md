# SideCar Data Stream Inventory

> **Version:** 1.0 | **Created:** 2026-04-11  
> **Authority:** Product Planning (Non-Governance — Does Not Override Directives)

This document catalogs every external data stream that feeds the SideCar platform, its current and target source systems, integration status, and the derived AI/analytics products each stream enables.

---

## 1. Integration Status Legend

| Status | Meaning |
|--------|---------|
| 🟢 **Available** | API exists and is accessible to SideCar |
| 🟡 **Pending Approval** | API exists; awaiting authorization for SideCar SPFx consumption |
| 🟠 **Manual ETL** | Data exists but requires manual extract-transform-load into Dataverse |
| 🔴 **Not Yet Available** | API does not yet exist or is not exposed |

---

## 2. Data Stream Inventory

### Stream 1 — MyCompass Telemetry
- **Source:** MyCompass Mobile Application
- **Integration:** Direct pipe to Dataverse (planned)
- **Status:** 🔴 Not Yet Available — expected **25 Dec 2026**
- **Data Includes:**
  - Career plan drafts & stated preferences
  - Geographic desires & motivation narratives ("why I serve")
  - Dependent status, EFMP, and housing updates
  - Sailor-initiated career planning interactions
- **Enables:** Pvol predictions, Family Stability Indicators, High-Ambition Indicators

---

### Stream 2 — Outlook Emails & Attachments
- **Source:** MS365 (Outlook) via Power Automate
- **Integration:** Automated pipeline into Dataverse
- **Status:** 🟢 Available (Flank Speed native)
- **Data Includes:**
  - All Detailer/Coach ↔ Sailor email correspondence
  - Attached documents (orders, evaluations, etc.)
- **Enables:** Sentiment & Burnout Analysis, AI Coaching Vector

---

### Stream 3 — Teams Call Transcripts
- **Source:** MS365 (Teams) via Power Automate
- **Integration:** Automated pipeline into Dataverse
- **Status:** 🟢 Available (Flank Speed native)
- **Data Includes:**
  - Transcribed coaching and detailing conversations
- **Enables:** Sentiment & Burnout Analysis, AI Coaching Vector

---

### Stream 4 — Coaching Questionnaires
- **Source:** MS365 (Forms) via Power Automate
- **Integration:** Automated pipeline into Dataverse
- **Status:** 🟢 Available (Flank Speed native)
- **Data Includes:**
  - Structured coaching intake forms
  - Survey responses
- **Enables:** Pvol, Coaching Vector context

---

### Stream 5 — Service Record Data (Personnel)
- **Source (Current):** Mainframes (EAIS / OAIS / ODIS) — **Manual ETL**
- **Source (Target):** NSIPS API
- **Status:** 🟠 Manual ETL (Current) → 🟡 Pending Approval (NSIPS API exists but not yet authorized for SideCar SPFx)
- **Current Process:** Data must be manually extracted from legacy mainframes, transformed, and loaded into Dataverse. This is a significant operational burden and a primary driver for NSIPS API authorization.
- **Data Includes:**
  - Evaluations & promotion history
  - Rate, grade, NEC, and qualifications
  - PRDs (Projected Rotation Dates)
  - Administrative markers and service milestones
- **Enables:** Record Quality Synthesis, Promotion Velocity, Automated Record Reviews, Intervention Engine, BnF calculations

---

### Stream 6 — Billet Structure & Manning
- **Source (Authoritative):** TFMMS (Total Force Manpower Management System)
- **Source (Possible Alternate):** NSIPS (may contain billet data — unconfirmed completeness)
- **Status:** 🟡 Pending Approval — TFMMS API exists but not yet authorized for SideCar SPFx
- **Data Includes:**
  - Authoritative billet definitions
  - Activity Manpower Documents
  - Manning gap data and structural requirements
- **Enables:** Best Navy Fit (BnF), Force Architect View, Gap Analysis

---

### Stream 8 — Administrative Friction Telemetry (eCRM)
- **Source:** eCRM (Salesforce-based MNCC/MyNavy Career Center platform)
- **Status:** 🟡 Pending Approval — eCRM Salesforce API exists but not yet authorized for SideCar SPFx
- **Data Includes:**
  - Helpdesk ticket volume and categories (pay, medical, admin)
  - Case resolution timelines
  - Repeat-contact patterns
- **Enables:** Administrative Stress Risk scoring, Intervention Engine, friction-based intervention triggers

---

### Stream 9 — Dependent / EFMP / Housing Data
- **Source (Current):** Legacy systems via **Manual ETL** (MyCompass not yet available)
- **Source (Target):** MyCompass + NSIPS API
- **Status:** 🟠 Manual ETL (legacy) + 🔴 Not Yet Available (MyCompass — expected **25 Dec 2026**) → 🟡 Pending Approval (NSIPS)
- **Data Includes:**
  - Dependent status changes
  - EFMP enrollment and categorization
  - Housing concerns and geographic constraints
- **Enables:** Family Stability Indicators, geographic billet prioritization

---

### Stream 10 — Evaluation & Promotion Velocity
- **Source (Current):** Service Records (Legacy mainframes) — **Manual ETL**
- **Source (Target):** NSIPS API
- **Status:** 🟠 Manual ETL (Current) → 🟡 Pending Approval — same NSIPS dependency as Stream 5
- **Data Includes:**
  - Evaluation marks and comparative rankings
  - Promotion timeline and velocity metrics
- **Enables:** Record Quality Synthesis, Competitiveness Coaching, BnF weighting

---

## 3. API Authorization Summary

The following external APIs **exist today** but require formal approval for SideCar SPFx consumption:

| API | System | Governance Owner | Streams Unblocked |
|-----|--------|-----------------|-------------------|
| **NSIPS API** | Navy Standard Integrated Personnel System | TBD | #5, #6 (partial), #9 (partial), #10 |
| **TFMMS API** | Total Force Manpower Management System | TBD | #6 |
| **eCRM API** | Salesforce (MNCC) | TBD | #8 |

> **Key Insight:** The primary integration blocker for SideCar is **not engineering** — it is **governance approval** for the SPFx application to consume these existing APIs.

---

## 4. Derived AI/Analytics Products

All streams converge in **Microsoft Dataverse** and are processed by **Azure AI Foundry** / **Power Platform AI Builder** to produce:

| Product | Input Streams | Description |
|---------|--------------|-------------|
| **Sentiment & Burnout Analysis** | #2, #3 | NLP over communications detecting shifting frustration |
| **Probability of Volunteerism (Pvol)** | #1, #5, #10 | Generated during orders negotiation: A machine learning model predicting the probability a Sailor will volunteer for a specific billet to inform Coach recommendations |
| **Best Navy Fit (BnF)** | #1, #5, #6, #10 | Generated during orders negotiation: A neural network generating a percentage match score reflecting how closely a billet aligns with Sailor and Navy needs/preferences |
| **Retention Probability Score** | #1, #2, #3, #8, #9 | Machine learning model predicting likelihood a Sailor will retain at next reenlistment (Enlisted) or career milestone (Officer) |
| **Record Quality Synthesis** | #5, #10 | Comparative strength metric vs. fleet averages |
| **Automated Record Reviews** | #5, #10 | Continuous review of Sailor data vs. career requirements (LADR, officer milestones) and cohort competitiveness |
| **Intervention Engine** | #5, #8 → Power Automate → MS365 | Micro-AI scanning and decision engine; monitors record changes and eCRM tickets to determine intervention path and route automated MS365 workflows (Outlook emails, Teams call bookings, Planner tasks) |
| **AI Coaching Vector** | #1, #2, #3, #4, #8 | Context-aware coaching scripts per interaction |
| **High-Ambition Indicators** | #1 | Flags proactive qualification/education pursuit |
| **Administrative Stress Risk** | #8 | Friction telemetry from eCRM helpdesk volumes |
| **Family Stability Indicators** | #1, #9 | Dependent/EFMP/housing risk for geographic prioritization |
| **Force Architect View** | #5, #6, #10 | Unified talent distribution across billet structure |
