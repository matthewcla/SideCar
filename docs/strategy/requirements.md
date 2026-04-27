# SideCar Project Requirements & Infrastructure Needs

> **Version:** 1.0 | **Created:** 2026-04-01  
> **Authority:** Product Planning (Non-Governance — Does Not Override Directives)

Based on the technical architecture and capabilities outlined in the **SideCar Strategic Concept & Vision**, this project extends significantly beyond the baseline capabilities of a standard Flank Speed User account. 

To execute the data-dense, AI-driven, automated workflows described (specifically Dataverse integration, NLP sentiment analysis, and continuous data pipelines), the team will require elevated architectural access and Premium licensing.

## 1. Required Licenses and Access

### Microsoft Dataverse (Premium)
* **Why:** The vision explicitly states SideCar is powered by Microsoft Dataverse. While standard Flank Speed includes a lightweight "Dataverse for Teams," an enterprise-scale application consuming MyCompass telemetry, email sentiment, and legacy record data requires **Full Dataverse**.
* **The Ask:** **Power Apps Premium** and **Power Automate Premium** licenses. At a minimum, the service accounts moving the data require this, but depending on how the SPFx web part queries the data, all Distribution Officers (Coaches) utilizing the tool may require Premium licenses.

### Non-Personal Entity (NPE) / Service Accounts
* **Why:** The vision involves continuous, automated scraping of MS365 communications (Outlook/Teams) and MyCompass data into Dataverse. If a Sailor builds these automation flows on their personal `@us.navy.mil` account, the entire system breaks the moment they PCS or their password expires.
* **The Ask:** An official CNPC **Non-Personal Entity (NPE)** or Service Principal account to "own" the SideCar architecture, databases, and continuous Power Automate flows.

### CNPC Dedicated Power Platform Environment
* **Why:** You cannot build a platform that houses sensitive NLP sentiment analysis, retention risk indicators, and Pvol algorithms in the default "Personal Productivity" environment of Flank Speed.
* **The Ask:** Command IT / PEO Digital must provision a dedicated, managed **Power Platform Environment** within the Flank Speed tenant specifically for CNPC/SideCar.

### Azure Machine Learning (Azure ML), Azure AI Foundry & Power Platform AI Builder
* **Why:** The vision requires analyzing complex telemetry and surfacing "invisible" retention drivers. While AI Builder can handle lightweight, generic NLP, the platform requires establishing **micro-AI implementations focused on telemetry scanning and decision engine routing** to process Navy-specific communications (MyCompass histories, MS365 transcripts) securely. Additionally, foundational compute is required to train and execute custom models: Probability of Volunteerism (Pvol, a machine learning model), Best Navy Fit (BnF, a neural network), and the Retention Probability Score (a machine learning model).
* **The Ask:** An approved Naval Azure subscription specifically provisioned for **Azure Machine Learning (Azure ML)** to provide the necessary compute clusters for our neural network and custom models, governed via **Azure AI Foundry**, with access to **Azure OpenAI** for processing sensitive CUI contexts, alongside baseline **Power Platform AI Builder credits**.

### SharePoint App Catalog / Tenant Admin Access
* **Why:** The platform is hosted as a "modern SPFx web part."
* **The Ask:** The developers need permission to deploy custom SharePoint Framework (SPFx) code to the CNPC SharePoint App Catalog.

## 2. Cost Estimation (Illustrative)

*Note: The following estimates are based on standard Microsoft commercial/government retail pricing. Actual costs will vary based on the Department of the Navy's Enterprise Service Agreement (ESA) via DITCO and existing Flank Speed licensing agreements.*

### Startup Costs (Year 1 Authorization & Configuration)
* **Dedicated Power Platform Environment Provisioning:** ~$0 (Included in Flank Speed governance, but requires IT labor hours).
* **Initial Development & Setup Labor:** Absorbed by existing "Digital Strike Team" / Citizen Developer billeted personnel.
* **Service Account / NPE Provisioning:** ~$0 (Administrative process).
* **Estimated Startup Ask:** Minimal hard-dollar cost; primarily requires administrative approval and IT labor.

### Annual Recurring Costs (Operations & Maintenance)
Assuming a deployment to a full operational footprint of ~250 Distribution Officers/Coaches, plus the centralized Service Accounts managing the Dataverse pipelines.

* **Power Apps Premium Licenses:**
  * ~$20 per user/month x 250 users = ~$5,000/month
  * **Annual:** ~$60,000/year
* **Power Automate Premium (for Service Accounts):**
  * ~$15 per user/account/month x 5 accounts = ~$75/month
  * **Annual:** ~$900/year
* **Enterprise AI Infrastructure (Azure ML, AI Builder & Azure AI Foundry):**
  * **AI Builder** (Baseline generic NLP): ~$2,000/month
  * **Azure Machine Learning & Azure OpenAI** (Underlying compute for neural networks, ML micro-implementations, telemetry processing): Estimated at ~$5,000/month based on compute and telemetry volume.
  * **Annual:** ~$84,000/year (Consumption based)
* **Total Estimated Annual Licensing & Compute Cost:** **~$144,900/year** (subject to Navy ESA discounting).

*Return on Investment (ROI):* This ~$145k annual OPEX investment actively enables the structured divestment of legacy multi-million-dollar systems (EAIS, OAIS) while directly reducing the administrative friction that drives premature separation of high-value personnel.

---

## 3. Strategic Alignment: Advana Jupiter Migration Path

This Flank Speed/Azure architecture is explicitly designed as a transitional **Phase 1** capability. It aligns directly with the SECNAV’s data enterprise directives by establishing the logic, formatting, and vectoring required for a future migration to the Navy's enterprise data environment.

* **Phase 1 (System of Engagement):** SideCar uses Azure Machine Learning, Azure AI Foundry, and Dataverse to rapidly prototype the MS365 integration layer. It establishes the "muscle memory" of training custom neural networks and deploying targeted AI micro-implementations exactly where Distribution Officers work (Teams, Outlook).
* **Phase 2 (Migration to Jupiter):** As **Advana Jupiter** (the DoD's enterprise data environment) matures its MLOps and API gateways, the heavy predictive modeling (Best Navy Fit) and authoritative legacy data lake will shift from the Flank Speed environment into Jupiter. The SideCar UI will remain the "Glass Cockpit" in MS365, but will ultimately query Jupiter's robust models via API.

---

## 4. Strategic Justification: Enabling Divestment of EAIS, OAIS, and ODIS (Point Paper)

This architecture serves as the primary technical enabler for the Navy's strategic mandate to divest from legacy, monolithic distribution infrastructures (EAIS, OAIS, and ODIS). Those systems are fundamentally rigid "Systems of Record" that force Distribution Officers into "swivel chair" operations, maintaining outdated databases via manual data entry instead of coaching.

SideCar's architecture breaks this dependency through three core pillars:

1. **Unified Data Abstraction (The Force Architect View):** EAIS (Enlisted) and OAIS/ODIS (Officer) rigidly separate the force into siloed mainframes. By abstracting these data streams into Microsoft Dataverse—and eventually Advana Jupiter—SideCar creates a single, unified talent management model. This neutralizes the operational need to maintain separate, expensive legacy databases.
2. **Workflow Automation Over Manual Transactions:** Legacy systems rely on Detailers manually tracking PRDs (Projected Rotation Dates) and typing in administrative markers. The SideCar/Power Automate integration manages PRD timelines algorithmically in the background, shifting the human operator from "transactional clerk" to "AI-Enabled Career Coach."
3. **Predictive Analytics Replacing Static Queries:** OAIS and EAIS rely on static, parameterized queries (e.g., "Find all E-6s with this NEC"). During the orders negotiation window, SideCar's Azure Machine Learning infrastructure replaces these queries with predictive **Probability of Volunteerism (Pvol)** (an ML model predicting the probability a Sailor will volunteer for a specific billet) and **Best Navy Fit (BnF)** (a neural network generating a percentage match score reflecting Sailor and Navy needs/preferences) to generate highly relevant billet recommendations. Alongside this, the **Retention Probability Score** (an ML model) continuously calculates the likelihood a Sailor will retain at the next reenlistment or career milestone. By deploying micro-AI implementations to scan MyCompass telemetry, the system proactively identifies the right Sailor for the right billet years in advance, vastly outperforming legacy mainframe logic.

By shifting the UI to Flank Speed and the complex modeling to Azure/Jupiter, the Navy can confidently sunset the EAIS, OAIS, and ODIS sustainment contracts, reallocating those multi-million-dollar monolithic budgets toward modern enterprise data integration and advanced AI development.

---

## 5. Executive Summary (Draft Explainer to 1-Star Admiral)

**To:** [Admiral's Name/Title]
**From:** [Your Name/Rank]
**Date:** [Date]
**Subject:** BLUF: Project SideCar - Modernizing Distribution & Required Flank Speed Architecture

Admiral,

**BLUF:** To execute Project SideCar—our initiative to transition Navy Detailing from reactive transactional processing to proactive, AI-enabled Career Coaching—we require your top-cover to secure dedicated Flank Speed enterprise architecture, specifically Premium Power Platform licensing and Non-Personal Entity (NPE) service accounts.

**The Strategic Context:**
We are engineering SideCar to bolt onto our legacy infrastructure and serve as a modern "Glass Cockpit" for our Distribution Officers. By automating PRD tracking and synthesizing data from MyCompass and MS365, SideCar calculates the Probability of Volunteerism (Pvol), Best Navy Fit (BnF), and Retention Probability Score — predicting retention risks and identifying burnout via sentiment analysis well before a Sailor submits a separation request. Ultimately, this platform provides the data density and workflow automation required to enable the structured divestment of our legacy systems (EAIS, OAIS, ODIS).

**The Hurdle:**
Currently, our developers are constrained by the standard "citizen developer" limitations of baseline Flank Speed accounts. To build a resilient, command-wide tool that does not break when a single Sailor PCSs, we must move out of personal productivity environments.

**The Ask:**
We request your endorsement to coordinate with PEO Digital / Flank Speed Command IT to provision the following for the SideCar development team:
1. **A Dedicated CNPC Power Platform Environment:** To securely house our predictive models, Sailor telemetry, and Microsoft Dataverse architecture outside of personal workspaces.
2. **Non-Personal Entity (NPE) Service Accounts:** To ensure our automated data pipelines and background record reviews are owned by the Command, guaranteeing continuity of operations.
3. **Azure Machine Learning & Premium Licensing:** Azure ML is required to provide the MLOps compute clusters for training and deploying the foundational neural network (BnF) and machine learning models (Pvol, Retention Probability Score) securely within the DoD cloud, managed via Azure AI Foundry, alongside the Premium Power Platform licenses needed to build the Dataverse telemetry engine.

With these architectural permissions unlocked, we can deliver a platform that fundamentally shifts our Force Architects from filling immediate gaps to strategically managing our talent pool years in advance.

Very respectfully,

[Your Name/Rank]  
[Your Title/Billet]  
Navy Personnel Command (CNPC)
