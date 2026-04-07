# Liquidity Risk Reporting
### Basel III Data Platform — Regulatory Systems Intelligence

> **Risk. Intelligence. Control.**
> A modular data platform covering the full lifecycle from ERP ingestion to validated regulatory reporting.

Live: [regsys-analytics.org](https://regsys-analytics.org)

---

## What This System Demonstrates

This platform demonstrates end-to-end systems thinking across the full Record-to-Report lifecycle, from source ingestion and validation to governed regulatory reporting. It ingests real public regulatory data, transforms it through a controlled pipeline, and presents auditable Basel III metrics in an interactive dashboard.

Built to bridge Finance and IT, the architecture decisions, validation rules, and data model were designed from a regulatory reporting and liquidity risk perspective. The code was the output of those decisions, not the starting point.

---

## Live Features

| Feature | Description |
|---|---|
| **Executive Terminal** | Aggregate LCR and NSFR metrics with period averages from real ECB data |
| **Stress Test Simulator** | Apply a funding shock across both ratios simultaneously |
| **Strategic Pro-Forma Simulator** | Pre-trade analytics modelling the marginal LCR impact of a balance sheet adjustment using Basel III run-off weights |
| **LCR and NSFR Detail** | Quarterly trend charts with macro-event annotations (COVID-19, Geopolitical Shock) |
| **Data Quality** | Automated validation rules across 1M+ records with severity-based controls and expandable failure detail |
| **Data Lineage** | Trace any metric from source file through staging, warehouse, API, to dashboard figure |
| **AI Assistant** | Embedded Basel III co-pilot answering regulatory, data, and architecture questions |
| **System Architecture** | End-to-end pipeline diagram connecting all three system layers with GitHub links |

---

## Data Sources

| Source | Rows | Description |
|---|---:|---|
| ECB Supervisory Banking Statistics | 855 | Quarterly LCR and NSFR for ~110 Significant Institutions under the SSM |
| Deutsche Bundesbank BISTA | 1,029,756 | Monthly bank-level balance sheet data for German credit institutions |
| BIS Locational Banking Statistics | 4,101 | Cross-border banking positions across countries and instruments |
| ECB Eurosystem Balance Sheet | 1,134 | Annual consolidated Eurosystem balance sheet, 1999–2025 |

---

## System Architecture — Record-to-Report Lifecycle

The platform is structured across three connected system layers:

**1. Transaction Layer — ERP Ledger Posting Simulation**  
Simulates how business events become auditable journal entries and cash flow records.  
[github.com/fhabili/erp-ledger-posting-simulation](https://github.com/fhabili/erp-ledger-posting-simulation)

**2. Control Layer — Financial Close Validation Engine**  
Applies financial close controls and blocks invalid data from progressing to reporting.  
[github.com/fhabili/financial-close-validation-engine](https://github.com/fhabili/financial-close-validation-engine)

**3. Reporting Layer — Regsys Analytics Platform**  
Delivers validated LCR and NSFR metrics with full lineage from source to dashboard.  
[github.com/fhabili/regsys-analytics-platform](https://github.com/fhabili/regsys-analytics-platform)

---

## Data Pipeline

Every metric follows the same governed path:

| Layer | Description |
|---|---|
| **Source Data** | ECB and Bundesbank raw files ingested without modification |
| **Data Archive** | Immutable timestamped storage — retained 7 years for regulatory audit |
| **Data Warehouse** | Basel III mapping rules applied — LCR and NSFR computed under CRR Art. 416/422 |
| **Data Service** | Only warehouse-approved figures exposed to downstream consumers |
| **Dashboard** | Executive Terminal and detail views displaying final validated metrics |

---

## Validation Rules

| Rule | Severity | Description |
|---|---|---|
| DQ-001 Missing Counterparty LEI | Critical | Without LEI, regulators cannot verify counterparty concentration limits |
| DQ-002 Negative Liquidity Buffer | Critical | Mathematically impossible — indicates feed error or sign convention mismatch |
| DQ-003 LCR Out of Tolerance | High | Flags material period-over-period movement for human review |
| DQ-004 Missing Maturity Date | Medium | Required to assign flows to the correct LCR 30-day bucket |
| DQ-005 Collateral Below Threshold | Medium | Supports HQLA quality classification |
| DQ-006 Currency Mismatch | Low | Unhedged FX exposure can distort net cash flow calculation |

---

## Technical Stack

**Frontend:** React 18, TypeScript, Tailwind CSS, Recharts, Vite  
**Backend:** Python 3.12, FastAPI, Pydantic v2, Alembic, uv  
**Data:** PostgreSQL 16, SQLAlchemy, Medallion Architecture, BCBS 239-aligned lineage  
**AI Layer:** Gemini API, Context Injection, Streaming JSON
