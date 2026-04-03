export interface FailedRow { [key: string]: string | number }

export interface Rule {
  id: string
  name: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  regulatoryImpact: 'High' | 'Medium' | 'Low'
  passed: number
  failed: number
  total: number
  tooltip: string
  failedRows: { columns: string[]; rows: FailedRow[]; issue: string }
}

export const SEV_BADGE: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-amber-100 text-amber-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-blue-100 text-blue-700',
}

export const SEV_BAR: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#3b82f6',
}

export const RULES: Rule[] = [
  {
    id: 'DQ-001', name: 'Missing Counterparty LEI', severity: 'Critical', regulatoryImpact: 'High',
    passed: 847, failed: 3, total: 850,
    tooltip: 'Every counterparty in a liquidity flow must have a valid Legal Entity Identifier (LEI). Without it, regulators cannot identify who owes whom — making the LCR counterparty concentration limit impossible to verify.',
    failedRows: {
      columns: ['record_id', 'counterparty_name', 'lei', 'flow_type', 'amount_eur'],
      issue: 'lei',
      rows: [
        { record_id: 'CF-20250331-0041', counterparty_name: 'Meridian Capital GmbH', lei: '', flow_type: 'OUTFLOW', amount_eur: 4200000 },
        { record_id: 'CF-20250331-0188', counterparty_name: 'Vega Finance SRL', lei: '', flow_type: 'OUTFLOW', amount_eur: 870000 },
        { record_id: 'CF-20250331-0412', counterparty_name: 'Unknown Entity', lei: 'N/A', flow_type: 'INFLOW', amount_eur: 150000 },
      ],
    },
  },
  {
    id: 'DQ-002', name: 'Negative Liquidity Buffer', severity: 'Critical', regulatoryImpact: 'High',
    passed: 850, failed: 0, total: 850,
    tooltip: 'HQLA (High Quality Liquid Assets) must always be non-negative. A negative buffer is mathematically impossible under the LCR framework and indicates a data feed error or sign convention mismatch.',
    failedRows: { columns: [], rows: [], issue: '' },
  },
  {
    id: 'DQ-003', name: 'LCR Ratio Out of Tolerance (>5% MoM swing)', severity: 'High', regulatoryImpact: 'High',
    passed: 849, failed: 1, total: 850,
    tooltip: 'A month-on-month LCR swing greater than 5 percentage points is flagged for human review. It may indicate a genuine stress event, a data error, or a reclassification of assets.',
    failedRows: {
      columns: ['bank_id', 'period', 'lcr_prev', 'lcr_curr', 'swing_pp'],
      issue: 'swing_pp',
      rows: [
        { bank_id: 'ECB_EU_AGGREGATE', period: '2025 Q1', lcr_prev: 162.4, lcr_curr: 158.6, swing_pp: -3.8 },
      ],
    },
  },
  {
    id: 'DQ-004', name: 'Missing Maturity Date on Flow', severity: 'Medium', regulatoryImpact: 'Medium',
    passed: 843, failed: 7, total: 850,
    tooltip: 'Every cash flow in the 30-day horizon must have a maturity date so run-off rates can be applied correctly. Missing maturities mean the flow cannot be assigned to the right LCR bucket under CRR Article 425.',
    failedRows: {
      columns: ['record_id', 'flow_type', 'maturity_date', 'amount_eur', 'asset_class'],
      issue: 'maturity_date',
      rows: [
        { record_id: 'FL-20250331-0072', flow_type: 'OUTFLOW', maturity_date: '', amount_eur: 320000, asset_class: 'UNSECURED' },
        { record_id: 'FL-20250331-0119', flow_type: 'OUTFLOW', maturity_date: '', amount_eur: 55000, asset_class: 'RETAIL_DEPOSIT' },
        { record_id: 'FL-20250331-0204', flow_type: 'INFLOW', maturity_date: 'NULL', amount_eur: 1100000, asset_class: 'SECURED_HQLA' },
      ],
    },
  },
  {
    id: 'DQ-005', name: 'Collateral Value Below Threshold', severity: 'Medium', regulatoryImpact: 'Medium',
    passed: 850, failed: 0, total: 850,
    tooltip: 'Collateral posted against secured funding must have a market value above the contractually agreed haircut floor. If collateral falls below this level, the funding counts as unsecured — increasing the run-off rate used in the LCR denominator.',
    failedRows: { columns: [], rows: [], issue: '' },
  },
  {
    id: 'DQ-006', name: 'Currency Mismatch on Settlement', severity: 'Low', regulatoryImpact: 'Low',
    passed: 848, failed: 2, total: 850,
    tooltip: 'When the settlement currency of a flow differs from the reporting currency (EUR) without a matching FX hedge, the net cash flow figure may be understated or overstated.',
    failedRows: {
      columns: ['record_id', 'flow_currency', 'settlement_currency', 'fx_hedge', 'amount_eur'],
      issue: 'fx_hedge',
      rows: [
        { record_id: 'FX-20250331-0033', flow_currency: 'USD', settlement_currency: 'EUR', fx_hedge: 'NONE', amount_eur: 210000 },
        { record_id: 'FX-20250331-0091', flow_currency: 'GBP', settlement_currency: 'EUR', fx_hedge: 'NONE', amount_eur: 88000 },
      ],
    },
  },
]

// Pre-computed global quality score from the RULES array above.
// Used as a frontend fallback when the backend validation pipeline has not yet
// populated data_quality_score in the database.
const _totalChecks = RULES.reduce((s, r) => s + r.total, 0)
const _totalFailed = RULES.reduce((s, r) => s + r.failed, 0)
export const GLOBAL_QUALITY_SCORE = (_totalChecks - _totalFailed) / _totalChecks * 100
