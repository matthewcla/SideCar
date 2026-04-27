# SideCar Workspace: Vision, Audit & Refactoring Plan

> **Version:** 2.0 | **Created:** 2026-03-28 | **Updated:** 2026-04-11  
> **Authority:** Product Planning (Non-Governance — Does Not Override Directives)  
> **Domain:** Module-Specific Development Roadmap  
> **Module:** MOD-WORK (`sidecar-app/src/Workspace/Workspace.tsx`)

---

## 1. Core Purpose

The `Workspace.tsx` module is the primary operational surface for Navy Detailers and Placement Coordinators. Its strategic mandate is to shift the user's role from a transactional "Detailing Clerk" to an **AI-Enabled Career Coach** and **Force Architect**. 

This document synthesizes the strategic vision, current architectural audit findings, the Bento-Box Hub refactoring specification, and the targeted development roadmap required to empower this persona shift and successfully sunset legacy platforms (EAIS, OAIS, ODIS).

## 2. The Operational Philosophy (The Scale Problem)

Detailers manage portfolios of thousands of constituents. The workspace is explicitly designed **not** to display all constituents at once. Doing so violates the "Glass Cockpit" usability principle and creates immense cognitive overload.

Instead, the workspace must operate as an **Alert-to-Action queue**. It must intelligently filter the noise, surfacing only the fraction of Sailors (e.g., 40-50 out of 3,000) who require immediate intervention on any given day. 

This urgency must be defined by:
- Expired statutory/administrative timelines (PRD/EAOS).
- Contact staleness thresholds.
- **Crucially:** Output from the **Intervention Engine**, which flags events based on behavioral telemetry, record changes, and eCRM-derived triggers (e.g., sudden drops in sentiment, high administrative friction, or unaddressed qualification gaps affecting long-range competitiveness).

---

## 3. Current State Audit (March 2026 Baseline)

The workspace currently serves as a highly capable and elite CRM, but it treats all urgency as timeline-based rather than strategically diagnostic.

### Foundational Strengths (Clerk & CRM Capabilities)
- **Retention UI:** Strong implementation of escalation flags and locked semantic color-coding for PRD urgency.
- **Communications Log:** Effective, timestamped timeline view of communications.
- **Contact Management:** Highly visible tracking of contact staleness (e.g., "77d ago") and bucketing by health.
- **Microsoft Bookings Structure:** Solid Calendar integration providing automated structure for appointments.
- **Pipeline Tracking:** Clear, horizontal visual tracking of assignment states (Prefs → Match → Slate).

### Strategic Deficiencies (The Career Coach Gap)
- **Predictive Depth:** Complete lack of **Probability of Volunteerism (Pvol)** analytics (the probability a Sailor will volunteer for a specific billet) and **Retention Probability Score** visibility.
- **Record Quality Synthesis:** No qualitative or comparative reading of a Sailor's record competitiveness against their peer group.
- **Coaching Gap Analysis:** The interface fails to map a Sailor's current record quality and qualifications against the requirements of their high-Pvol billets.
- **Qualitative Motivators:** Fails to surface the *why* a Sailor serves—behavioral telemetry and sentiment expected from MyCompass data (Note: MyCompass integration is a Phase 2 capability, expected Dec 2026).
- **Bookings Prep Cards:** Currently act as raw operational summaries rather than strategic pre-briefing tools. They lack Pvol objectives, competitiveness gaps, and synthesized Retention Probability Score data.

---

## 4. Development Roadmap & Required Workflows

To elevate the workspace from a CRM to a Force Architecture tool, the following capabilities must be integrated:

### Phase 1: Predictive & Diagnostic Injection
- **Pvol Integration:** During the orders negotiation window, inject Probability of Volunteerism metrics (the calculated likelihood per Sailor-billet pairing) into the main roster table and primary Sailor detail panel. Let the coach see what the Sailor wants before they even ask, empowering highly relevant billet recommendations.
- **Competitiveness Gap Engine:** Implement a visual diagnostic comparing a Sailor's current qualifications with the hard requirements of their Pvol target billets early in their tour.
- **Advanced Prep Cards:** Overhaul the Bookings modal. A Prep Card must tell the Coach *exactly* what strategic gap needs to be discussed during the call to maximize the Sailor's opportunity.

### Phase 2: Missing Core Workflows
1. **Mass Update Functionality:** To efficiently shape the force architecture across thousands of records, the workspace needs bulk operational capabilities directly tied to the communication engine (e.g., logging a sweeping Subspec/AQD attainment or broadcasting a critical billet gap to a highly-filtered cohort).
2. **Separations Tracker:** A high-visibility, dedicated workflow that ingests live NSIPS separation status. Sailors filing for separation represent acute retention risks that demand immediate, specialized coach intervention outside the normal PRD rotation pipeline.
3. **Automated Coaching Gap Pathway:** A 1-click workflow to instantly draft and send a Sailor a personalized, actionable plan for qualification attainment based on their Pvol targets.

---

## 5. Bento-Box Hub Architecture (Refactoring Plan)

The traditional Detailer workspace has artificially capped the user's role as a "Detailing Clerk" reacting to PRD timelines via a monolithic Kanban board. Rather than managing standard assignments in a visual pipe, the Coach needs a Command Center that prioritizes "intelligent interventions" determined by the **Intervention Engine**, alongside Pvol and BnF percentage-match analytics.

To achieve this, the Kanban layout is being entirely purged. The `pipeline-board-wrapper` (which currently houses the Kanban Board) will be dismantled and replaced by a responsive CSS grid system (`.bento-grid`).

### Core Layout Principles
- **Persistent Visibility:** The left-hand sidebar ("Priority Interventions", "Today's Schedule", "Action List") remains intact. It is the steady heartbeat of the workspace.
- **Dynamic Hub:** The primary viewport will consist of four high-density "Cards" or "Widgets" arranged in a responsive grid.
- **Priority-Weighted Scaling:** The visual footprint (size and placement) of each widget in the bento grid is algorithmically driven by the user's immediate operational priorities. A workflow that requires urgent action expands; idle workflows collapse.
- **Modal Isolation:** These widgets are dashboards. Engaging deeply with one of these workflows (e.g., actively writing an order) will use the Glass Cockpit UX standard: it will expand into a full-viewport modal overlay (`.bento-modal`), ensuring the user is never navigated to a disparate page. When closed, they return instantly to the hub.

---

## 6. Widget Design & Structural Specs

### Widget A: Coaching Strategy & Intervention Planner (The "Digital Twin")
*Grid Placement: Primary focus area, spans upper 60% of the Bento Grid.*

**Concept:** The detailer is tipped off to intervene by the **Automated Record Reviews** and the **Intervention Engine**, which feed the "Telemetered Digital Twin" of the Sailor. This widget provides the interface to understand the risk and execute automated communication.

**UI Layout & Hierarchy:**
- **Split-Pane Architecture:**
  - *Left Pane (The Roster):* A condensed vertical feed of Sailors flagged by the Intervention Engine. Each row displays Name, Rate, and the primary "Driver Token" (e.g., `Sentiment Drop`, `BnF Mismatch`, `Admin Friction`, `Repeat Helpdesk Contact`).
  - *Right Pane (The Digital Twin Canvas):* Displays the telemetered intelligence when a Sailor is selected.
- **Digital Twin Canvas Elements:**
  - **Header Block:** Sailor Name, Rate, Days Since Last Contact, and the objective **Retention Probability Score**.
  - **Milestone & Empathy Context:** A dedicated alert zone highlighting recent notable changes in the Sailor's record or eCRM tickets. Designed to build instant rapport. Examples:
    - *Celebratory (*`🎉`*)*: Newly acquired NEC, selection for advancement, degree completion.
    - *Empathy (*`❤️`*)*: Recent EFMP enrollment, pending COLO request, identified administrative/pay hardships via eCRM (Stream #8).
  - **Analytics Block (Sentiment):** A visual sparkline (`<SentimentSparkline />`) mapping a 6-month sentiment trend. Includes a text readout of extracted burnout triggers (e.g., "Critical Stressor: High Admin Friction").
  - **Gap Engine Block (Pvol vs Record):** A visual progress bar depicting the Sailor's objective Competitiveness Score versus the required score for their top Pvol target. A bulleted list below outlines the exact missing qualifications or AQDs causing the gap.
  - **AI Coaching Vector Block:** A stylized inset box (`<CoachingPrompt />`) containing a synthesized coaching script/prompt for the Detailer to utilize (e.g., "Address frustration regarding admin friction. Pitch CSG-staff billet as a pathway to gaining required NEC.").
- **Automated MS365 Action Footer:** The hub doesn't just display flags; it closes the loop. It includes Power Automate-enabled buttons to trigger MS365 workflows directly from the hub: "Auto-Send Outreach Email" (Outlook), "Book Coaching Call" (Teams/Bookings), and "Generate Follow-up Task" (Planner).

### Widget B: Orders Writing Hub
*Grid Placement: Lower left quadrant.*

**Concept:** A dedicated command center for executing the technical assignment of Sailors. While Widget A handles the "Why" and "What" (Coaching/Matching), Widget B handles the "How" (Administrative Execution). It functions as an Alert-to-Action queue for stalled processing and the entry point for deep-dive order drafting.

**UI Layout & Hierarchy:** 
- A dense, vertically scrolling high-visibility table (`.orders-widget-table`).
- **Columns/Data:** 
  - `Sailor Name` (Linked to full record)
  - `Target Command / Billet` 
  - `Status Lozenge` (`Drafting`, `Routing`, `Released`, `Mod Pending`, `ORMOD`)
  - `Time-in-Status` (e.g., "4d")
- **Alert-to-Action Visual Emphasis:** 
  - Rows automatically elevate to the top and highlight with a gold/red structural border if stalled (e.g., Pending Branch Approver > 3 days, OBLISERV required but unsigned). 
- **Modal Interaction (Deep Work):** 
  - Clicking any row does not simply expand the widget; it triggers the specific **Orders Workstation Modal**. 
  - This isolated modal provides the actual drafting tools: Accounting Data checks, Obliserv (EAOS vs PRD) verification, En Route Training pipeline construction, and routing checklists.

### Widget C: Slating & Assignment Overview
*Grid Placement: Lower right quadrant.*

**Concept:** The Force Architecture engine. This widget allows the Coach to shift from individual assignments to analyzing the supply/demand health of their entire community, and to rapidly approve Best Navy Fit (BnF) percentage-match algorithmic matches.

**UI Layout & Hierarchy:**
- **Macro-Metrics (Top Ribbon):** Three large, bold metric cards displaying: "Available Billets (Current Window)", "Unslated Inventory", and "Projected Match Rate".
- **Supply/Demand Deficit Bar:** A centralized horizontal bar graphic visualizing the net deficit/surplus for the user's specific community (e.g., IT E-5).
- **Pending Proposed Matches (Bottom Feed):** A list of AI-generated optimal matches (`Sailor Y -> Billet Z`). 
- **Modal Interaction (Deep Work):**
  - Clicking the widget frame launches the **Slating Optimizer Modal**. This is an immersive, split-screen UI showing the Unslated Pool on the left, and Open Requisitions on the right, enabling drag-and-drop manual slating or algorithmic execution.

### Widget D: Separations Tracker
*Grid Placement: Smallest footprint, anchored centrally on the right edge or below Orders Writing, utilizing high-alert "Glass Cockpit" styling.*

**Concept:** Acute crisis management. This widget identifies personnel actively flagged in NSIPS for separation *(Note: currently dependent on Manual ETL until the NSIPS API is authorized)*. It shifts the Detailer's mindset from "routine assignment" to "tactical retention or smooth offboarding."

**UI Layout & Hierarchy:**
- **High-Alert Aesthetic:** Encased in a crimson/gold structural border (`.widget--critical`) to draw immediate eye movement if populated.
- **Data Table:** A tight, dense list of Sailors with an active C-WAY or NSIPS separation intent.
  - `Sailor Name` & `Intent Date`
  - `Stated Driver`: The primary reason for separation (e.g., `Civilian Sector Pay`, `Geographic Instability`).
  - `Retention Probability Score`: The precise likelihood the Sailor will reverse intent and retain at their reenlistment/milestone limit.
  - `AI Recommendation Lozenge`: Suggests either `[RETAIN]` (for low probability but high impact losses) or `[PROCESS]` (for smooth offboarding).
- **Modal Interaction (Deep Work):**
  - Clicking a row launches the **Retention/Offboarding Modal**. 
  - If the AI suggests `[RETAIN]`, the Modal automatically generates a "Retention Pitch" (e.g., surfacing lucrative re-enlistment bonuses, highly-desirable OCONUS billets available, or specialized schools). 
  - If `[PROCESS]`, it surfaces the smooth administrative offboarding checklist to ensure the Sailor transitions positively to the civilian sector or reserves, maintaining good faith.

---

## 7. Synthetic Data Scaffolding Requirements

Because SideCar is currently a decoupled concept prototype (C-03 Constraint: Synthetic Only), we must build the underlying data structures in `sidecar-app/src/services/SyntheticData.ts` to support the bento widgets. 

### `SYNTHETIC_DIGITAL_TWIN`
Provides the deep telemetry for the **Intervention Planner**.
- `sailorId`
- `interventionTriggers`: Array of strings triggering the review (e.g., `Sentiment Drop`, `Admin Friction`).
- `notableEvents`: Array of objects (e.g., `{ type: 'celebratory', text: 'Selected for advancement to E-6' }` or `{ type: 'empathy', text: 'Recent EFMP Category 4 update' }`).
- `sentimentTrend`: Array of integers indicating recent burnout/morale trend.
- `burnoutTriggers`: Array of identified stressors.
- `competitivenessGaps`: Array of missing qualifications needed for their Pvol target.
- `aiCoachingPrompt`: Generated text snippet for the coach.
- `retentionProbabilityScore`: Float (0.00-1.00) indicating retention likelihood.
- `eCrmTickets`: Array of relevant helpdesk tickets from Salesforce.

### `SYNTHETIC_ORDERS_STATUS`
Drives the **Orders Writing** widget.
- `sailorId`
- `targetCommand`, `targetBillet`
- `status` (`Drafting`, `Routing`, `Released`, `Mod Pending`)
- `daysInStatus`: Integer
- `administrativeBlockers`: Array (e.g., `["OBLISERV Required: EAOS < 24mo", "Awaiting Medical Screening"]`) 
- `routingStep`: String (e.g., `Branch Head Approval`)

### `SYNTHETIC_SLATING_BOARD`
Drives the **Slating & Assignment** widget.
- `communityMetrics`: Object containing `availableBillets`, `unslatedSailors`, `deficitScore`.
- `proposedMatches`: Array of objects (e.g., `{ sailorId: '123', billetId: 'B007', bnfScore: 92, status: 'Pending Review' }`).

### `SYNTHETIC_SEPARATIONS`
Drives the **Separations Tracker** widget.
- `sailorId`
- `intentDate`, `statedDriver` (String: e.g., 'Work/Life Balance')
- `retentionProbabilityScore`: Float (0.00-1.00)
- `aiRecommendation`: String (`RETAIN` or `PROCESS`)
- `retentionPitch`: String (e.g., "Offer SRB multiplier and guaranteed Hawaii orders.")

---

## 8. Advancements in Core Workflows

### Advanced Prep Cards (The "Why")
Currently, the `PrepCard` component is generic. It will be refactored to hook directly into the new `SYNTHETIC_DIGITAL_TWIN` dataset. Detailers will clearly see a Sailor's predictive profile *before* a Microsoft Bookings call begins.

### Mass Operations Parity
The hub must support force-level actions. We will introduce a "Select Mode" toggle inside the Bento Hub which transforms the interfaces to allow multi-select. 
- Example UX: The Coach can select 15 Sailors inside the Intervention Planner with similar "Competitiveness Gaps" and launch a Mass Action email providing a standardized coaching plan to all 15 simultaneously.

---

## 9. Execution Phases

Once this plan is approved and transitioned to an Implementation Plan artifact, development will proceed in the following order:

1. **Phase 1: Data Scaffolding & Layout Purge:** Strip the Kanban board from HTML/CSS. Build the Grid layout. Inject the new synthetic data models into `SyntheticData.ts`.
2. **Phase 2: Bento Widget Construction:** Build the HTML/CSS structural shells for the 4 core widgets based on the specs above, populating them with the new dummy data.
3. **Phase 3: The Coaching Strategy UI:** Implement the split-pane UI for the Intervention Planner, wiring up the UI to represent the Digital Twin telemetry (Events, Pvol, Sentiment Sparklines, AI Coaching Prompts).
4. **Phase 4: Workflow Parity:** Overhaul the Prep Card and enable Mass Actions.

---

## 10. Conclusion

The current `Workspace.tsx` module provides a massive quality-of-life improvement for basic portfolio management. However, its true value lies in its potential predictive capability. All future development on this module must prioritize diagnostic intelligence over raw data display, and embrace the Bento-Box Hub architecture to manage cognitive load. Only by fully integrating the core predictive triad—**Probability of Volunteerism (Pvol), Best Navy Fit (BnF), and Retention Probability Score**—along with an automated **Intervention Engine** bridging into MS365 workflows, will SideCar fulfill its mandate to create AI-Enabled Career Coaches out of today's detailers.
