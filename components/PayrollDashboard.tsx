'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { PayrollEmployee, PayrollPayment } from '@/lib/types';
import styles from '@/styles/Company.module.css';

const CADENCES = [
  { label: 'Hourly', seconds: 3600 },
  { label: 'Every 5 minutes', seconds: 300 },
  { label: 'Every minute', seconds: 60 },
  { label: 'Every 15 seconds (demo)', seconds: 15 },
];

function usd(value: string | null, digits = 2): string {
  if (value === null) return '—';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(digits) : '—';
}

function cadenceLabel(seconds: number): string {
  return CADENCES.find((c) => c.seconds === seconds)?.label ?? `Every ${seconds}s`;
}

export default function PayrollDashboard() {
  const [rows, setRows] = useState<PayrollEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cadence, setCadence] = useState(3600);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [payments, setPayments] = useState<Record<number, PayrollPayment[]>>({});

  const expandedRef = useRef<number | null>(null);
  expandedRef.current = expandedId;

  const load = useCallback(async () => {
    try {
      const data = await apiClient.listPayroll();
      setRows(data);
      setError(null);
      // Refresh the open drip history too.
      const openId = expandedRef.current;
      if (openId !== null) {
        const p = await apiClient.getPayrollPayments(openId);
        setPayments((prev) => ({ ...prev, [openId]: p }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payroll');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while any drip is active so totals/history update live.
  useEffect(() => {
    const anyActive = rows.some((r) => r.drip_active);
    if (!anyActive && expandedId === null) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [rows, expandedId, load]);

  const applyRow = (updated: PayrollEmployee) =>
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

  const start = async (row: PayrollEmployee) => {
    setBusyId(row.id);
    setError(null);
    try {
      applyRow(await apiClient.startDrip(row.id, cadence));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start drip');
    } finally {
      setBusyId(null);
    }
  };

  const pause = async (row: PayrollEmployee) => {
    setBusyId(row.id);
    setError(null);
    try {
      applyRow(await apiClient.pauseDrip(row.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause drip');
    } finally {
      setBusyId(null);
    }
  };

  const toggleExpand = async (row: PayrollEmployee) => {
    if (expandedId === row.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(row.id);
    try {
      const p = await apiClient.getPayrollPayments(row.id);
      setPayments((prev) => ({ ...prev, [row.id]: p }));
    } catch {
      /* handled by list error surface */
    }
  };

  return (
    <div className={styles.container}>
      <section className={styles.card}>
        <div className={styles.payrollHeader}>
          <h3 className={styles.cardTitle}>Payroll</h3>
          <div className={styles.cadenceControl}>
            <label className={styles.label}>Drip frequency</label>
            <select
              className={styles.input}
              value={cadence}
              onChange={(e) => setCadence(Number(e.target.value))}
            >
              {CADENCES.map((c) => (
                <option key={c.seconds} value={c.seconds}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className={styles.hint}>
          Each employee is paid in USDC from your company wallet. Salary is converted
          to an hourly rate (annual ÷ 2080 work hours) and dripped at the chosen
          frequency. Start begins the drip; Pause stops it.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <p>Loading payroll…</p>
        ) : rows.length === 0 ? (
          <p className={styles.hint}>No employees yet. Add them from the My Company tab.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th></th>
                  <th>Employee</th>
                  <th>Pay</th>
                  <th>Hourly</th>
                  <th>Per drip</th>
                  <th>Frequency</th>
                  <th>Paid to date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const hasPay = row.pay_type !== null && row.pay_rate !== null;
                  const isOpen = expandedId === row.id;
                  return (
                    <Fragment key={row.id}>
                      <tr>
                        <td>
                          <button
                            className={styles.expandButton}
                            onClick={() => toggleExpand(row)}
                            aria-label="Toggle drip history"
                          >
                            {isOpen ? '▾' : '▸'}
                          </button>
                        </td>
                        <td>{row.first_name} {row.last_name}</td>
                        <td>
                          {hasPay
                            ? row.pay_type === 'salary'
                              ? `${usd(row.pay_rate)} / yr`
                              : `${usd(row.pay_rate)} / hr`
                            : '— not set —'}
                        </td>
                        <td>{hasPay ? `${usd(row.hourly_rate, 4)}` : '—'}</td>
                        <td>{hasPay ? `${usd(row.drip_amount, 4)}` : '—'}</td>
                        <td>{cadenceLabel(row.drip_interval_seconds)}</td>
                        <td>{usd(row.total_paid)} <span className={styles.muted}>({row.payment_count})</span></td>
                        <td>
                          <span
                            className={row.drip_active ? styles.statusActive : styles.statusPaused}
                          >
                            {row.drip_active ? 'Active' : 'Paused'}
                          </span>
                        </td>
                        <td>
                          {row.drip_active ? (
                            <button
                              className={styles.pauseButton}
                              disabled={busyId === row.id}
                              onClick={() => pause(row)}
                            >
                              Pause
                            </button>
                          ) : (
                            <button
                              className={styles.startButton}
                              disabled={busyId === row.id || !hasPay || !row.wallet_address}
                              title={
                                !hasPay
                                  ? 'Set the employee pay first'
                                  : !row.wallet_address
                                  ? 'Employee has no wallet'
                                  : ''
                              }
                              onClick={() => start(row)}
                            >
                              Start
                            </button>
                          )}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={9} className={styles.detailCell}>
                            <DripHistory items={payments[row.id]} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function DripHistory({ items }: { items: PayrollPayment[] | undefined }) {
  if (!items) return <p className={styles.hint}>Loading drips…</p>;
  if (items.length === 0) return <p className={styles.hint}>No drips yet for this employee.</p>;
  return (
    <table className={styles.detailTable}>
      <thead>
        <tr>
          <th>Time</th>
          <th>Amount (USDC)</th>
          <th>Status</th>
          <th>Detail</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p) => (
          <tr key={p.id}>
            <td>{new Date(p.created_at).toLocaleString()}</td>
            <td>{Number(p.amount).toFixed(7)}</td>
            <td>
              <span className={p.status === 'success' ? styles.statusActive : styles.statusPaused}>
                {p.status}
              </span>
            </td>
            <td className={styles.detailMono} title={p.transaction_hash ?? p.error ?? ''}>
              {p.status === 'success'
                ? p.transaction_hash
                  ? `${p.transaction_hash.slice(0, 10)}…`
                  : '—'
                : p.error ?? '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
