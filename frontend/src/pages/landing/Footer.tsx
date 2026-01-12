import { useTranslation } from 'react-i18next';
import styles from './styles/Footer.module.css';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className={styles.footer} id="contact">
            <div className={styles.content}>
                <div className={styles.column}>
                    <h3>{t('common.health_sync')}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                        {t('landing.footer_desc')}
                    </p>
                </div>
                <div className={styles.column}>
                    <h3>{t('landing.footer_services')}</h3>
                    <ul>
                        <li><a href="#">{t('landing.s1')}</a></li>
                        <li><a href="#">{t('landing.s2')}</a></li>
                        <li><a href="#">{t('landing.s3')}</a></li>
                        <li><a href="#">{t('landing.s4')}</a></li>
                    </ul>
                </div>
                <div className={styles.column}>
                    <h3>{t('landing.footer_company')}</h3>
                    <ul>
                        <li><a href="#">{t('landing.c1')}</a></li>
                        <li><a href="#">{t('landing.c2')}</a></li>
                        <li><a href="#">{t('landing.c3')}</a></li>
                        <li><a href="#">{t('landing.c4')}</a></li>
                    </ul>
                </div>
            </div>
            <div className={styles.bottom}>
                &copy; {new Date().getFullYear()} {t('common.health_sync')}. {t('landing.rights')}
            </div>
        </footer>
    );
}
