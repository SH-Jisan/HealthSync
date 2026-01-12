import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './styles/Hero.module.css';

export default function Hero() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <section className={styles.gradient_box}>
            <div className={styles.content_container}>
                <h1 className={styles.heroTitle}>
                    <div style={{
                        fontSize: '1.5rem',
                        color: 'var(--primary-light)',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px' }}
                    >
                        HealthSync
                    </div>
                    <div style={{
                        fontSize: '1.1rem',
                        color: '#A8DF8E',
                        marginBottom: '25px',
                        fontWeight: '500',
                        letterSpacing: '1px'
                    }}>
                        One Life, One Record, Total Care
                    </div>

                    Complete Healthcare <br />
                    <span className={styles.highlight}>At Your Fingertips</span>
                </h1>

                <p className={styles.heroDesc}>
                    Seamlessly connect with doctors, manage your medical history, find blood donors, and track your health vitals.
                    Safe, secure, and smart AI-powered analytics.
                </p>

                <div className={styles.ctaButtons}>
                    <button
                        className={styles.primaryBtn}
                        onClick={() => navigate('/login')}
                    >
                        {t('landing.get_started', 'Get Started Now')}
                    </button>
                    <button
                        className={styles.secondaryBtn}
                        onClick={() => navigate('/about')}
                    >
                        {t('landing.learn_more', 'Learn More')}
                    </button>
                </div>
            </div>
        </section>
    );
}
