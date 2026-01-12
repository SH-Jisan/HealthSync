import { useTranslation } from 'react-i18next';
import { Users, CalendarCheck, FileText, ArrowRight } from 'phosphor-react';
import styles from './styles/HospitalOverview.module.css';

export default function HospitalOverview() {
    const { t } = useTranslation();

    return (
        <div>
            <h1 className={styles.title}>{t('dashboard.hospital.overview.title')}</h1>

            <div className={styles.statsGrid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.iconWrapper} ${styles.iconUsers}`}>
                            <Users size={32} />
                        </div>
                        <div>
                            <h3 className={styles.statValue}>24</h3>
                            <p className={styles.statLabel}>{t('dashboard.hospital.overview.doctors_staff')}</p>
                        </div>
                    </div>
                    <button className={`${styles.actionLink} ${styles.actionLinkPrimary}`}>
                        {t('dashboard.hospital.overview.manage')} <ArrowRight size={16} />
                    </button>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.iconWrapper} ${styles.iconCalendar}`}>
                            <CalendarCheck size={32} />
                        </div>
                        <div>
                            <h3 className={styles.statValue}>18</h3>
                            <p className={styles.statLabel}>{t('dashboard.hospital.overview.appointments')}</p>
                        </div>
                    </div>
                    <button className={`${styles.actionLink} ${styles.actionLinkPurple}`}>
                        {t('dashboard.hospital.overview.view_schedule')} <ArrowRight size={16} />
                    </button>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.iconWrapper} ${styles.iconFile}`}>
                            <FileText size={32} />
                        </div>
                        <div>
                            <h3 className={styles.statValue}>56</h3>
                            <p className={styles.statLabel}>{t('common.total')} {t('dashboard.doctor.patients.title')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className={styles.sectionTitle}>{t('dashboard.hospital.overview.quick_actions')}</h2>
            <div className={styles.actionsContainer}>
                <button className={styles.quickActionBtn}>
                    <Users size={20} color="var(--primary)" /> {t('dashboard.hospital.overview.assign_doctor')}
                </button>
                <button className={styles.quickActionBtn}>
                    <FileText size={20} color="#C2410C" /> {t('dashboard.hospital.overview.update_inventory')}
                </button>
                <button className={styles.quickActionBtn}>
                    <CalendarCheck size={20} color="#7E22CE" /> {t('dashboard.hospital.overview.view_analytics')}
                </button>
            </div>
        </div>
    );
}
