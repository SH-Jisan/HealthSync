import { Buildings, Handshake, FirstAidKit, Globe } from 'phosphor-react';
import styles from './styles/TrustedPartners.module.css';

export default function TrustedPartners() {
    return (
        <section className={styles.section}>
            <h3 className={styles.title}>Trusted by Leading Healthcare Systems</h3>
            <div className={styles.grid}>
                <div className={styles.partner}><Buildings size={32} weight="duotone" /> City General</div>
                <div className={styles.partner}><Handshake size={32} weight="duotone" /> CareAlliance</div>
                <div className={styles.partner}><FirstAidKit size={32} weight="duotone" /> MediPlus</div>
                <div className={styles.partner}><Globe size={32} weight="duotone" /> WorldHealth</div>
            </div>
        </section>
    );
}
