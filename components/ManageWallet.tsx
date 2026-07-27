'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { WalletBalance } from '@/lib/types';
import styles from '@/styles/ManageWallet.module.css';

type BalanceState =
  | { status: 'loading' }
  | { status: 'success'; data: WalletBalance }
  | { status: 'error'; error: string };

export default function ManageWallet() {
  const [state, setState] = useState<BalanceState>({ status: 'loading' });
  const [copied, setCopied] = useState(false);

  const copyAddress = useCallback(async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. non-secure context) — ignore.
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await apiClient.getWalletBalance();
      setState({ status: 'success', data });
    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to read balance',
      });
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <h3>Your Company Wallet</h3>
        <p>
          A Stellar wallet was created and funded for your company when you registered,
          with a USDC trustline already set up. This page reads its balance directly
          from the Stellar network.
        </p>
      </div>

      {state.status === 'loading' && (
        <div className={styles.section}>
          <p>Reading balance from the Stellar network…</p>
        </div>
      )}

      {state.status === 'error' && (
        <div className={styles.error}>
          <strong>Error:</strong> {state.error}
          <button onClick={fetchBalance} className={styles.resetButton}>
            Retry
          </button>
        </div>
      )}

      {state.status === 'success' && (
        <div className={styles.section}>
          <div className={styles.balanceCard}>
            <span className={styles.balanceLabel}>USDC Balance</span>
            <span className={styles.balanceValue}>
              {state.data.usdc_balance.toFixed(2)} <span className={styles.asset}>USDC</span>
            </span>
          </div>

          <div className={styles.successDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Wallet Address:</span>
              <span className={styles.addressValue} title={state.data.address}>
                <span className={styles.addressText}>{state.data.address}</span>
                <button
                  type="button"
                  onClick={() => copyAddress(state.data.address)}
                  className={styles.copyButton}
                  aria-label="Copy wallet address"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>USDC Trustline:</span>
              <span className={styles.detailValue}>
                {state.data.has_trustline ? '✅ Active' : '❌ Missing'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Network:</span>
              <span className={styles.detailValue}>{state.data.network}</span>
            </div>
          </div>

          <button onClick={fetchBalance} className={styles.resetButton}>
            Refresh balance
          </button>

          {state.data.usdc_balance === 0 && (
            <p className={styles.successMessage}>
              Your wallet has a USDC trustline but no USDC yet, so the balance reads 0.00.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
