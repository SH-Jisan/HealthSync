import { useTranslation } from 'react-i18next';
import { Buildings, Handshake, FirstAidKit, Globe } from 'phosphor-react';
import styles from './styles/TrustedPartners.module.css';

export default function TrustedPartners() {
    const { t } = useTranslation();

    return (
        <section className={styles.section}>
            <h3 className={styles.title}>{t('landing.partners_title')}</h3>
            <div className={styles.grid}>
                <div className={styles.partner}><Buildings size={32} weight="duotone" /> {t('landing.p1')}</div>
                <div className={styles.partner}><Handshake size={32} weight="duotone" /> {t('landing.p2')}</div>
                <div className={styles.partner}><FirstAidKit size={32} weight="duotone" /> {t('landing.p3')}</div>
                <div className={styles.partner}><Globe size={32} weight="duotone" /> {t('landing.p4')}</div>
            </div>
        </section>
    );
}
