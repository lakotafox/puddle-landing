'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { PaymentJobStatus } from '@/lib/types';
import styles from '@/styles/PaymentStatus.module.css';

interface PaymentStatusProps {
  jobId: string;
  onReset: () => void;
}

export default function PaymentStatus({ jobId, onReset }: PaymentStatusProps) {
  const [status, setStatus] = useState<PaymentJobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const jobStatus = await apiClient.getPaymentStatus(jobId);
        setStatus(jobStatus);
        setError(null);

        // Stop polling if job is completed, failed, or cancelled
        if (['completed', 'failed', 'cancelled'].includes(jobStatus.status)) {
          setIsPolling(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch status');
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 2 seconds if still in progress
    if (isPolling) {
      intervalId = setInterval(fetchStatus, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, isPolling]);

  const handleCancel = async () => {
    try {
      await apiClient.cancelPayment(jobId);
      // Status will update on next poll
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel payment');
    }
  };

  if (error && !status) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
        <button onClick={onReset} className={styles.button}>
          Back to Form
        </button>
      </div>
    );
  }

  if (!status) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading payment status...</div>
      </div>
    );
  }

  const progressPercentage = (status.completed_payments / status.schedule.num_payments) * 100;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Payment Status</h2>

      <div className={styles.statusCard}>
        <div className={styles.statusHeader}>
          <span className={`${styles.statusBadge} ${styles[status.status]}`}>
            {status.status.toUpperCase()}
          </span>
          <span className={styles.jobId}>Job ID: {status.job_id}</span>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className={styles.progressText}>
            {status.completed_payments} of {status.schedule.num_payments} payments completed
            {status.failed_payments > 0 && ` (${status.failed_payments} failed)`}
          </div>
        </div>

        <div className={styles.scheduleInfo}>
          <h4>Payment Schedule</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Total Amount:</span>
              <span className={styles.infoValue}>{status.schedule.total_amount} USDC</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Per Payment:</span>
              <span className={styles.infoValue}>{status.schedule.amount_per_payment} USDC</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Interval:</span>
              <span className={styles.infoValue}>{status.schedule.interval_seconds} seconds</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Total Payments:</span>
              <span className={styles.infoValue}>{status.schedule.num_payments}</span>
            </div>
          </div>
        </div>

        {status.transactions.length > 0 && (
          <div className={styles.transactionsSection}>
            <h4>Recent Transactions</h4>
            <div className={styles.transactionsList}>
              {status.transactions.slice(-10).reverse().map((tx) => (
                <div
                  key={tx.payment_number}
                  className={`${styles.transaction} ${styles[tx.status]}`}
                >
                  <div className={styles.transactionHeader}>
                    <span className={styles.paymentNumber}>
                      Payment #{tx.payment_number}
                    </span>
                    <span className={`${styles.txStatus} ${styles[tx.status]}`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className={styles.transactionDetails}>
                    <span>{tx.amount} USDC</span>
                    {tx.timestamp && (
                      <span className={styles.timestamp}>
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  {tx.transaction_hash && (
                    <div className={styles.txHash} title={tx.transaction_hash}>
                      Tx: {tx.transaction_hash.substring(0, 12)}...
                    </div>
                  )}
                  {tx.error && (
                    <div className={styles.txError}>{tx.error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {status.error && (
          <div className={styles.errorBox}>
            <strong>Error:</strong> {status.error}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {status.status === 'in_progress' && (
          <button onClick={handleCancel} className={styles.cancelButton}>
            Cancel Payment
          </button>
        )}
        {['completed', 'failed', 'cancelled'].includes(status.status) && (
          <button onClick={onReset} className={styles.button}>
            Start New Payment
          </button>
        )}
      </div>
    </div>
  );
}
