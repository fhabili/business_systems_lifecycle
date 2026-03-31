/**
 * Typed API client for the liquidity risk backend.
 * All paths are relative — Vite dev-server proxies /api → http://127.0.0.1:8080.
 */

export interface LcrTrendPoint {
  period: string;      // e.g. "2016Q3"
  lcr_ratio: number;   // percentage
}

export interface SummaryResponse {
  lcr_ratio: number | null;
  nsfr_ratio: number | null;
  data_quality_score: number | null;
  as_of_date: string | null;
  last_pipeline_run: string | null;
  lcr_trend: LcrTrendPoint[];
  active_alerts: string[];
}

export interface BankLcrRow {
  bank_id: string;
  bank_name: string | null;
  country: string | null;
  reference_date: string | null;   // ISO date "YYYY-MM-DD"
  hqla_amount: number | null;
  net_outflow: number | null;
  lcr_ratio: number | null;        // percentage
}

export interface LcrResponse {
  banks: BankLcrRow[];
  avg_lcr: number | null;
  min_lcr: number | null;
  max_lcr: number | null;
}

export interface BankNsfrRow {
  bank_id: string;
  bank_name: string | null;
  country: string | null;
  reference_date: string | null;
  asf_amount: number | null;
  rsf_amount: number | null;
  nsfr_ratio: number | null;       // percentage
}

export interface NsfrResponse {
  banks: BankNsfrRow[];
  avg_nsfr: number | null;
  min_nsfr: number | null;
  max_nsfr: number | null;
}

const BASE = '/api/v1';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const fetchSummary = () => apiFetch<SummaryResponse>('/summary');
export const fetchLcr     = () => apiFetch<LcrResponse>('/lcr');
export const fetchNsfr    = () => apiFetch<NsfrResponse>('/nsfr');

/** Convert an ISO date string "YYYY-MM-DD" to a quarter label like "2024 Q3". */
export function dateToQuarter(iso: string): string {
  const [year, month] = iso.split('-').map(Number);
  const q = Math.ceil(month / 3);
  return `${year} Q${q}`;
}
