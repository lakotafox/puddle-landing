'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import PaymentForm from '@/components/PaymentForm';
import ManageWallet from '@/components/ManageWallet';
import CompanyDashboard from '@/components/CompanyDashboard';
import PayrollDashboard from '@/components/PayrollDashboard';
import LineSidebar from '@/components/reactbits/LineSidebar/LineSidebar';
import Beams from '@/components/reactbits/Beams/Beams';
import { useAuth } from '@/lib/auth';
import styles from '@/styles/Dashboard.module.css';

type SectionKey =
  | 'company'
  | 'addEmployee'
  | 'employees'
  | 'payroll'
  | 'manage'
  | 'payment';

export default function Home() {
  const router = useRouter();
  const { me, isAuthenticated, isLoading, logout, hasRole } = useAuth();
  const isAdmin = hasRole('Admin');
  const canPayroll = hasRole('Admin', 'Payroll');
  // Nothing selected on land: the sidebar sits centered, hero-sized. First
  // pick docks it to the left (shrunk) and it stays docked from then on.
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const docked = activeSection !== null;
  // First reveal waits for the dock animation; later switches fade fast.
  const wasDocked = useRef(false);
  const contentDelay = wasDocked.current ? 0.05 : 0.4;
  useEffect(() => {
    if (docked) wasDocked.current = true;
  }, [docked]);

  // Sidebar entries depend on the user's roles.
  const sections = useMemo(() => {
    const list: { key: SectionKey; label: string }[] = [];
    if (isAdmin) {
      list.push({ key: 'company', label: 'My Company' });
      list.push({ key: 'addEmployee', label: 'Add Employee' });
      list.push({ key: 'employees', label: 'Manage Employees' });
    }
    if (canPayroll) list.push({ key: 'payroll', label: 'Payroll' });
    list.push({ key: 'manage', label: 'My Wallet' });
    list.push({ key: 'payment', label: 'Send Money' });
    return list;
  }, [isAdmin, canPayroll]);

  // Redirect unauthenticated users to the login page (first page reached).
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // While checking the session or redirecting, show a lightweight loader.
  if (isLoading || !isAuthenticated) {
    return <div className={styles.loading}>Loading…</div>;
  }

  return (
    <div className={styles.shell}>
      <div className={styles.beamsLayer}>
        <Beams
          beamWidth={1.3}
          beamHeight={15}
          beamNumber={12}
          lightColor="#06B6D4"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={0}
        />
      </div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Puddl3 Payroll</h1>
          <p className={styles.headerSub}>
            {me?.employer.company_name} · {me?.user.email}
            {me?.roles.length ? ` · ${me.roles.join(', ')}` : ''}
          </p>
        </div>
        <button className={styles.logoutButton} onClick={logout}>
          Log out
        </button>
      </header>

      <div className={`${styles.body} ${docked ? styles.bodyDocked : styles.bodyHero}`}>
        <motion.aside
          layout
          className={styles.sidebar}
          animate={{ scale: docked ? 0.8 : 1.4, x: docked ? 0 : -80 }}
          transition={{
            duration: 0.7,
            ease: [0.4, 0, 0.2, 1],
            layout: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
          }}
          style={{ transformOrigin: 'left center' }}
        >
          <LineSidebar
            items={sections.map((s) => s.label)}
            accentColor="#a855f7"
            textColor="#c4c4c4"
            markerColor="#06b6d4"
            showIndex
            showMarker
            proximityRadius={100}
            maxShift={30}
            falloff="smooth"
            markerLength={130}
            markerGap={0}
            tickScale={0.5}
            scaleTick
            itemGap={33}
            fontSize={1.1}
            smoothing={60}
            singleHighlight
            onItemClick={(index: number) => setActiveSection(sections[index].key)}
          />
        </motion.aside>

        {docked && (
          <motion.main
            key={activeSection}
            className={styles.main}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: contentDelay, ease: 'easeOut' }}
          >
            {activeSection === 'company' && isAdmin && <CompanyDashboard section="info" />}
            {activeSection === 'addEmployee' && isAdmin && <CompanyDashboard section="add" />}
            {activeSection === 'employees' && isAdmin && <CompanyDashboard section="manage" />}
            {activeSection === 'payroll' && canPayroll && <PayrollDashboard />}
            {activeSection === 'manage' && <ManageWallet />}
            {activeSection === 'payment' && <PaymentForm />}
          </motion.main>
        )}
      </div>
    </div>
  );
}
