# Project SideCar

> **Version:** 2.0 | **Created:** 2026-03-28 | **Updated:** 2026-04-11  
> **Authority:** Product Planning (Non-Governance — Does Not Override Directives)

---

## 1. The Logic Behind "SideCar": A Conceptual Framework

In the context of the US Navy's continuous evolution in manpower, detailing, and career management, moving away from bureaucratic acronyms (e.g., NSIPS, MNA, NP2) toward a conceptual, user-centric metaphor marks a significant shift in design philosophy.

The name **"SideCar"** encapsulates a multi-layered strategic logic perfectly suited for a modern military human resources platform. It implies a system designed for support, agility, and situational awareness.

### 1a. The "Co-Pilot" Metaphor: Agency & Support
A sidecar is attached to a motorcycle; it does not steer the vehicle, but it rides alongside providing essential support, stability, and carrying capacity. 
*   **For the Sailor:** The Sailor remains in the driver's seat of their own career. "SideCar" implies an application that travels with them throughout their career journey—providing guidance, detailing options, and seamless support without taking away their personal agency. It is an enabler, not a dictatorial system.
*   **For the Command / Placement Officer:** The command is driving the readiness and mission of the ship. The SideCar app rides alongside to provide critical manning insights, structural support, and predictive gap analysis without disrupting operational focus.

### 1b. Architectural Reality: The "Bolt-On" Model
In modern software engineering (such as Kubernetes ecosystems), the "Sidecar pattern" refers to an auxiliary process that runs alongside a main application to provide supporting features—like monitoring, logging, routing, or modern interfaces—without altering the legacy core.
*   **The Navy Enterprise Metaphor:** The main "motorcycle" represents the massive, slow-moving legacy Navy HR infrastructure (the enterprise data lakes, mainframe databases, and complex legacy systems). **SideCar** implies a lightweight, modern, high-performance UI/UX layer that "bolts on" to this heavy machinery. It acknowledges the reality that while you cannot quickly rebuild the entire enterprise engine, you can attach a vastly superior, modern interface to ride alongside it and interact with it efficiently.

### 1c. The Detailing Relationship: Bringing Two Entities Together
Detailing and placement are fundamentally two-way negotiations relying on a relationship between the Sailor and the Detailer. 
*   A sidecar is inherently designed to carry a passenger. The application acts as that shared, collaborative space where the Detailer and the Sailor figuratively "ride together" through the permanent change of station (PCS), orders negotiation, or billet assignment process. It represents a unified journey and shared visibility rather than a combative or disconnected transaction.

### 1d. Situational Awareness: The "Glass Cockpit" Navigator
When someone is driving a motorcycle, their eyes must be locked straight ahead on the road. The person sitting in the sidecar has the freedom to look around, read the map, navigate, and watch for hazards. 
*   In the context of naval manpower, a Sailor or Commander is focused entirely on their immediate tactical job and mission. The **SideCar** app does the heavy lifting of looking ahead—monitoring Projected Rotation Dates (PRDs), tracking billet changes, calculating NEC and skill-match probabilities, and alerting the user to upcoming career milestones. It acts as the tactical navigator, aligning with a "Glass Cockpit" design philosophy that prioritizes high-density situational awareness.

### 1e. Non-Bureaucratic and Memorable Branding
Naval manpower platforms often suffer from "alphabet soup" syndrome, resulting in unmemorable systems that feel like chores to interact with.
*   Names like *SideCar* (or *Compass*, *NavFit*) stand out because they invoke physical metaphors rather than abstract acronyms. "SideCar" sounds like a helpful *assistant* or *companion* rather than just a *database*. This drastically shifts user expectations and can significantly increase adoption rates and user satisfaction, especially among Junior Sailors who expect modern, intuitive, consumer-grade application experiences.

---

## 2. Core Concept & Strategic Vision

SideCar represents the evolution of Navy HR's industrial distribution design into a fluid, user-centric experience. It acts as a modern, high-performance interface that "bolts on" to the massive legacy personnel infrastructure, providing Sailors and Distribution Officers with actionable, predictive insights rather than bureaucratic data entry screens.

Crucially, **tracking PRDs is no longer the primary focus.** The automated SideCar workflow manages members with respect to PRD in the background such that it ceases to be an issue. Instead, the interface elevates human operators to focus on retention risks, career milestones, and maximizing both the Sailor's opportunity and their contribution to the Navy mission. Everyone wins.

---

## 3. The Technological Foundation: Dataverse & MyCompass

- **Hosting & Deployment:** SideCar is hosted within the CNPC SharePoint environment as a modern SPFx web part, ensuring seamless, authenticated integration with existing enterprise ecosystems.
- **Data Architecture:** The platform is empowered by a comprehensive, high-quality dataset hosted in **Microsoft Dataverse**.
- **The Telemetry Engine:** SideCar's predictive power is fueled by fusing legacy record data with real-time, organic inputs:
  - **MyCompass:** The Sailor-facing mobile app for career planning and management. Every interaction—career plan drafts, stated preferences, and the qualitative capturing of *why* the member desires to serve in the military—is piped directly into the Dataverse. 
  - **MS365 Communications Pipeline:** All detailer/coach communications with the member—including Outlook emails and attachments, Teams call transcripts, and coaching questionnaires (Forms)—are automatically piped into the Dataverse.
- **Automated Record Reviews:** SideCar continuously reviews all Sailor data to track where they stand relative to their career requirements — LADR milestones (Enlisted), officer milestone requirements, and qualification timelines — as well as how competitive they are within their cohort. This replaces manual audits by the Distribution Officer with an always-current career health assessment.

---

## 4. Advanced AI Retention Diagnostics

Because all raw communication telemetry and behavior data from MyCompass and MS365 is centralized in Dataverse, SideCar utilizes advanced NLP (Natural Language Processing) and predictive modeling to surface "invisible" retention drivers directly to the Coach's Prep Card:
- **Sentiment & Burnout Analysis:** The AI detects shifting sentiment over time in emails and Teams transcripts. If a historically positive Sailor's communications begin to reflect frustration or burnout, SideCar flags an "Intervention Opportunity" long before an official separation request is filed.
- **Intervention Engine:** A micro-AI implementation focused on telemetry scanning and decision routing. It algorithmically monitors changes in a member's record and eCRM tickets to determine the optimal intervention path — by a detailer, mentor, commanding officer, or chain of command. When a trigger fires, the engine produces **automated MS365 workflows via Power Automate** to maximize intervention effectiveness: drafting and sending outreach emails (Outlook), booking coaching calls (Teams/Bookings), creating follow-up tasks (Planner/To Do), and scheduling calendar events. These automations ensure no critical life or career event is missed and that the right person is engaged at the right time with minimal manual effort.
- **Spouse & Family Stability Indicators:** Capturing updates to dependent status, EFMP, or housing concerns (via MyCompass or Forms) allows the Coach to prioritize geographically stable billets, addressing the #1 driver of Navy retention.
- **Proactive Ambition Tracking:** If telemetry indicates a Sailor is proactively pursuing qualifications, certifications, or degrees outside their required rate training, the system flags a "High-Ambition Indicator." This shifts the coaching conversation toward maximizing those new skills for the Navy's mission.
- **Administrative Friction Telemetry:** The system monitors "friction" — for example, high frequencies of eCRM helpdesk tickets regarding pay or medical issues. SideCar flags this towering Administrative Stress Risk, allowing the Coach to intervene, provide top-cover, and win loyalty.

---

## 5. Predictive Analytics, Record Quality, & Competitiveness Coaching

A core feature of the SideCar platform is shifting assignment methodology from "filling a gap today" to "building a career years in advance." Using demographic, behavioral, and historical data, the system provides advanced analytics for the AI-Enabled Career Coach:
- **Record Quality Synthesis:** SideCar must synthesize the qualitative strength of the Sailor's service record (evaluations, promotion velocity, acquired qualifications) and present a clear, comparative metric. The Coach must instantly understand the objective competitiveness and quality of the record relative to fleet averages.
- **Probability of Volunteerism (Pvol):** *Utilized specifically during the orders negotiation window.* A machine learning model that predicts the probability that a Sailor will volunteer for a specific billet. Pvol is calculated per Sailor-billet pairing using behavioral telemetry, stated preferences (MyCompass), career trajectory, and historical assignment patterns, empowering the Career Coach to make highly relevant billet recommendations.
- **Best Navy Fit (BnF):** *Utilized specifically during the orders negotiation window.* A neural network that generates a percentage match score reflecting how closely a billet aligns with both the Sailor's needs/preferences and the Navy's mission requirements. BnF evaluates rate/grade compatibility, qualification alignment, geographic preferences, career trajectory, and Pvol predictions to produce a composite fitness score. BnF replaces static mainframe queries with predictive optimization, ensuring the Coach recommends billets that maximize mutual benefit.
- **Retention Probability Score:** A machine learning model that calculates the predicted likelihood that a Sailor will retain at their next reenlistment decision point (Enlisted) or career milestone (Officer). This score is derived from behavioral telemetry, sentiment analysis, family stability indicators, career satisfaction signals, and administrative friction data to flag retention risks well before a separation request is filed.
- **Long-Range Competitiveness Planning:** SideCar maps the Sailor's *current record quality* directly against the *requirements* for those high-Pvol billets.

---

## 6. The Strategic Mandate: Legacy Divestment

By consolidating these capabilities into a single, high-density workspace, SideCar fulfills a critical strategic objective for the enterprise: **enabling the Navy HR structured divestment of EAIS, OAIS, and ODIS.** SideCar is engineered from the ground up with the data density, workflow automation, and predictive intelligence required to permanently sunset these legacy systems. This divestment path is further supported by a planned migration from the current Flank Speed/Azure architecture to **Advana Jupiter** (the DoD's enterprise data environment), ensuring alignment with SECNAV data enterprise directives.

---

## 7. The Evolution of Roles: Coaches and Architects

By eliminating the friction of manual transaction processing and automating PRD management, the platform actively kills the legacy concept of "detailing" and "placement."
- **The AI-Enabled Career Coach:** Distribution Officers shift from being transaction clerks hunting for billet matches to strategic mentors. The system proactively flags **retention risks, Pvol goals, and satisfied tour requirements** so the Coach can intervene effectively over a multi-year horizon. To further augment effectiveness, SideCar generates an **AI Coaching Vector** for each interaction — a context-aware coaching script synthesized from the Sailor's behavioral telemetry, competitiveness gaps, and BnF targets.
- **The Force Architect:** Rather than reactively filling manning gaps, personnel managers become strategic asset managers. Empowered by predictive modeling and the outputs of automated background record reviews, they actively shape the distribution of talent and combat systemic shortages before they hit the fleet.

---

## 8. UI/UX Design Philosophy (The Glass Cockpit)

To meet the demands of high-stress, high-volume users, the user interface design strictly adheres to Naval UX standards and the "Glass Cockpit" philosophy:
- **Cognitive Load Reduction:** Data is synthesized to highlight qualitative states (e.g., "Retention Risk: High", "Pvol Match", "Record Competitiveness: Top 10%"), rather than throwing raw text or dates at the operator.
- **Alert-to-Action Efficiency:** Major tactical issues identified by automated background records reviews or NLP sentiment analysis are surfaced instantly with 1-click mitigation pathways.

---
**Summary:**
"SideCar" signals that the software is a **modern, agile companion** designed specifically to help the user navigate the complex Navy personnel system safely and effectively, riding right alongside them on their career journey. It replaces reactive, timeline-based distribution with proactive, AI-enabled career coaching and force architecture.
