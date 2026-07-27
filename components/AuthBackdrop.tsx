'use client';

/**
 * Shared animated backdrop for the auth pages (login/register).
 * Renders the React Bits SideRays effect behind the page content.
 */
import SideRays from '@/components/reactbits/SideRays/SideRays';
import styles from '@/styles/Auth.module.css';

export default function AuthBackdrop() {
  return (
    <div className={styles.raysLayer}>
      <SideRays
        speed={2.6}
        rayColor1="#025df1"
        rayColor2="#ffffff"
        intensity={2}
        spread={3}
        origin="bottom-left"
        tilt={1}
        saturation={1.5}
        blend={0.75}
        falloff={0.8}
        opacity={1.0}
      />
    </div>
  );
}
