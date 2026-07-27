'use client';

import { useState, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import type { PaymentRequest, PaymentFormState } from '@/lib/types';
import PaymentStatus from './PaymentStatus';
import styles from '@/styles/PaymentForm.module.css';

export default function PaymentForm() {
  const [formState, setFormState] = useState<PaymentFormState>({ status: 'idle' });
  const [paymentMode, setPaymentMode] = useState<'one-time' | 'incremental'>('one-time');
  const [formData, setFormData] = useState<PaymentRequest>({
    destination_address: '',
    asset_type: 'USDC', // all user-facing payments are USDC
    total_amount: 0,
    duration_value: 10,
    duration_unit: 'minutes',
    increment_value: 1,
    increment_unit: 'minutes',
  });

  // Calculate payment breakdown
  const breakdown = useMemo(() => {
    const { total_amount, duration_value, duration_unit, increment_value, increment_unit } = formData;

    if (total_amount <= 0 || duration_value <= 0 || increment_value <= 0) {
      return null;
    }

    const durationMultiplier = duration_unit === 'minutes' ? 60 : 3600;
    const totalDurationSeconds = duration_value * durationMultiplier;

    const incrementMultiplier = increment_unit === 'seconds' ? 1 : 60;
    const intervalSeconds = increment_value * incrementMultiplier;

    if (intervalSeconds >= totalDurationSeconds) {
      return null;
    }

    const numPayments = Math.floor(totalDurationSeconds / intervalSeconds);
    const amountPerPayment = total_amount / numPayments;

    return {
      numPayments,
      amountPerPayment: amountPerPayment.toFixed(7),
      intervalSeconds,
    };
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState({ status: 'submitting' });

    try {
      if (paymentMode === 'one-time') {
        // One-time instant payment (source is the logged-in company wallet)
        const response = await apiClient.sendPayment({
          destination_address: formData.destination_address,
          asset_type: formData.asset_type,
          amount: formData.total_amount,
        });

        if (response.success) {
          setFormState({ status: 'success', data: response });
        } else {
          throw new Error('Failed to send payment');
        }
      } else {
        // Incremental payment job
        const response = await apiClient.startPayment(formData);

        if (response.success) {
          setFormState({ status: 'tracking', jobId: response.job_id });
        } else {
          throw new Error('Failed to start payment');
        }
      }
    } catch (error) {
      setFormState({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  const handleReset = () => {
    setFormState({ status: 'idle' });
  };

  if (formState.status === 'tracking') {
    return <PaymentStatus jobId={formState.jobId} onReset={handleReset} />;
  }

  if (formState.status === 'success') {
    return (
      <div className={styles.formContainer}>
        <div className={styles.success}>
          <h4>Payment Sent Successfully!</h4>
          <div className={styles.successDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Amount:</span>
              <span className={styles.detailValue}>{formState.data.amount} {formState.data.asset_type}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Transaction Hash:</span>
              <span className={styles.detailValue}>{formState.data.transaction_hash}</span>
            </div>
          </div>
          <p className={styles.successMessage}>{formState.data.message}</p>
          <button onClick={handleReset} className={styles.resetButton}>
            Send Another Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Payment Mode</h3>
          <div className={styles.inputGroup}>
            <label htmlFor="payment_mode">Payment Type</label>
            <select
              id="payment_mode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as 'one-time' | 'incremental')}
              className={styles.select}
            >
              <option value="one-time">One-time (Instant)</option>
              <option value="incremental">Incremental (Over Time)</option>
            </select>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Destination Wallet</h3>
          <p className={styles.sourceNote}>
            Funds are sent from your company wallet automatically.
          </p>

          <div className={styles.inputGroup}>
            <label htmlFor="destination_address">Destination Address</label>
            <input
              type="text"
              id="destination_address"
              value={formData.destination_address}
              onChange={(e) => setFormData({ ...formData, destination_address: e.target.value })}
              placeholder="GXXXXXX..."
              required
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Payment Details</h3>

          <div className={styles.inputGroup}>
            <label htmlFor="total_amount">Total Amount (USDC)</label>
            <input
              type="number"
              id="total_amount"
              value={formData.total_amount || ''}
              onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
              placeholder="20"
              step="0.01"
              min="0"
              required
              className={styles.input}
            />
          </div>

          {paymentMode === 'incremental' && (
            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="duration_value">Duration</label>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    id="duration_value"
                    value={formData.duration_value}
                    onChange={(e) => setFormData({ ...formData, duration_value: parseInt(e.target.value) || 0 })}
                    min="1"
                    required
                    className={styles.input}
                  />
                  <select
                    value={formData.duration_unit}
                    onChange={(e) => setFormData({ ...formData, duration_unit: e.target.value as 'minutes' | 'hours' })}
                    className={styles.select}
                  >
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="increment_value">Send Every</label>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    id="increment_value"
                    value={formData.increment_value}
                    onChange={(e) => setFormData({ ...formData, increment_value: parseInt(e.target.value) || 0 })}
                    min="1"
                    required
                    className={styles.input}
                  />
                  <select
                    value={formData.increment_unit}
                    onChange={(e) => setFormData({ ...formData, increment_unit: e.target.value as 'seconds' | 'minutes' })}
                    className={styles.select}
                  >
                    <option value="seconds">seconds</option>
                    <option value="minutes">minutes</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {paymentMode === 'incremental' && breakdown && (
          <div className={styles.breakdown}>
            <h4>Payment Breakdown</h4>
            <p>
              <strong>{breakdown.numPayments}</strong> payments of{' '}
              <strong>{breakdown.amountPerPayment} USDC</strong> every{' '}
              <strong>{breakdown.intervalSeconds} seconds</strong>
            </p>
          </div>
        )}

        {formState.status === 'error' && (
          <div className={styles.error}>
            <strong>Error:</strong> {formState.error}
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={formState.status === 'submitting' || (paymentMode === 'incremental' && !breakdown)}
        >
          {formState.status === 'submitting'
            ? (paymentMode === 'one-time' ? 'Sending...' : 'Starting Payment...')
            : (paymentMode === 'one-time' ? 'Send Payment' : 'Start Payment')
          }
        </button>

        <div className={styles.warning}>
          <strong>ℹ️ Heads up</strong>
          <p>
            This payment is sent in USDC from your company wallet. Ensure it has a
            sufficient USDC balance and that the destination has a USDC trustline.
          </p>
        </div>
      </form>
    </div>
  );
}
