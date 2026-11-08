# LedgerMind 🧠
### Memory-Powered Accounts Payable Exception Agent

**Turning invoice exceptions into informed financial decisions.**

LedgerMind is an AI-assisted Accounts Payable (AP) exception management platform designed to help finance teams identify invoice discrepancies, understand vendor history, and make evidence-backed decisions.

Instead of treating every invoice exception as an isolated issue, LedgerMind aims to bring relevant historical context into the review process.

---

## 🚨 The Problem

Accounts Payable teams process large volumes of invoices, but exceptions such as duplicate invoices, price mismatches, incorrect quantities, and vendor inconsistencies can make the process difficult.

Traditional workflows often involve:
- Manually investigating invoice discrepancies.
- Searching through previous invoices and vendor records.
- Repeating investigations for similar historical issues.
- Spending time collecting evidence before making decisions.
- Losing valuable context between separate reviews.

**The result:** Slower invoice processing, repetitive manual work, and limited access to historical context.

## 💡 Our Solution

LedgerMind proposes a memory-powered AP exception management workspace.

The platform is designed to:
1. Identify potential invoice exceptions.
2. Bring relevant vendor and historical context into the review.
3. Present supporting evidence and recommendations.
4. Help finance teams understand why an invoice needs attention.
5. Keep final financial decisions under human control.

Our vision is to make AP exception handling more contextual, explainable, and efficient.

## ✨ Key Features

- **Finance Dashboard:** Overview of invoice activity, key metrics, and exception summaries.
- **Invoice Queue:** Centralized view of invoices requiring attention.
- **Invoice Navigation:** Access invoice-related information through the workspace.
- **Vendor Management:** Dedicated vendor information section.
- **Memory Insights:** Planned contextual insights from historical vendor interactions.
- **Reports:** Dedicated reporting workspace.
- **Activity Timeline:** Sample activity information for the dashboard.
- **Human-in-the-Loop:** Financial decisions remain with authorized human reviewers.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| TypeScript | Type-safe development |
| Vite | Development server and build tooling |
| Tailwind CSS | UI styling |
| React Router | Application navigation |
| Recharts | Dashboard charts |
| Lucide React | Interface icons |

## 🏗️ Project Architecture

The planned architecture separates structured financial data from contextual memory.

- **Business Database:** Intended source of truth for invoices, vendors, and financial records.
- **Hindsight Memory:** Planned contextual memory layer for retrieving relevant historical information.
- **AI Reasoning Layer:** Planned layer for explaining exceptions and generating evidence-backed recommendations.
- **Frontend Workspace:** Interface for reviewing invoices, exceptions, and supporting information.

Hindsight is intended to provide contextual memory, not replace the business database.

## 📸 Application Preview

The current version provides a frontend demonstration with synthetic INR sample data.

> Add screenshots of the dashboard, invoice queue, and memory insights here.

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/jagadesh-jpg/LedgerMind.git
```

Navigate to the project:

```bash
cd LedgerMind
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal.

### Production Build

```bash
npm run build
```

## 📍 Current Development Status

**Phase 1A — Frontend Prototype**

The current version includes the dashboard, navigation, sample invoice data, charts, and placeholder workspaces.

| Component | Status |
|---|---|
| Frontend dashboard | Implemented |
| Invoice workspace | Initial implementation |
| Vendor workspace | Placeholder |
| Memory Insights UI | Placeholder / demo preview |
| Backend integration | Not connected |
| Database integration | Not connected |
| Hindsight integration | Not connected |
| AI exception reasoning | Planned |
| Live invoice processing | Not implemented |

All displayed financial information is synthetic demonstration data. The current prototype does not process real invoices or perform financial transactions.

## 🔒 Responsible AI & Human Oversight

LedgerMind is designed around responsible financial automation.

- No automatic invoice approvals.
- No automatic payments.
- No unauthorized bank or vendor changes.
- Recommendations should be supported by relevant evidence.
- Authorized humans retain control over financial decisions.

## 👥 Team

| Role | Name |
|---|---|
| Team Leader | Vellor Pavan |
| Team Member | Jagadesh |

## 🎯 Our Vision

We envision a future where finance teams spend less time searching for historical information and more time making informed decisions.

**LedgerMind — Remember the context. Understand the exception. Make better decisions.**

---

## 📄 License

This project is currently developed as a hackathon prototype. A formal open-source license can be added when the team decides on its distribution terms.
