'use client';

import styles from '@/styles/TabNavigation.module.css';

export type TabKey = 'company' | 'payroll' | 'payment' | 'manage';

interface TabNavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  /** Show the admin-only "My Company" tab. */
  showCompany?: boolean;
  /** Show the Admin/Payroll "Payroll" tab. */
  showPayroll?: boolean;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
  showCompany = false,
  showPayroll = false,
}: TabNavigationProps) {
  return (
    <div className={styles.tabs}>
      {showCompany && (
        <button
          className={`${styles.tab} ${activeTab === 'company' ? styles.active : ''}`}
          onClick={() => onTabChange('company')}
        >
          My Company
        </button>
      )}
      {showPayroll && (
        <button
          className={`${styles.tab} ${activeTab === 'payroll' ? styles.active : ''}`}
          onClick={() => onTabChange('payroll')}
        >
          Payroll
        </button>
      )}
      <button
        className={`${styles.tab} ${activeTab === 'manage' ? styles.active : ''}`}
        onClick={() => onTabChange('manage')}
      >
        My Wallet
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'payment' ? styles.active : ''}`}
        onClick={() => onTabChange('payment')}
      >
        Send Money
      </button>
    </div>
  );
}
