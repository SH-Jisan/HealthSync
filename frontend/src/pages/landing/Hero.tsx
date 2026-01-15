import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CaretRight, PlayCircle, ShieldCheck, Users, Clock, FileText } from 'phosphor-react';
import { motion } from 'framer-motion';
import styles from './styles/Hero.module.css';

export default function Hero() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const stats = [
        { icon: <Clock weight="fill" />, end: "Full Medical", label: "History" },
        { icon: <FileText weight="fill" />, end: "Medical report", label: "by AI summarized" },
        { icon: <ShieldCheck weight="fill" />, end: "Enhanced", label: "Health Routine" },
        { icon: <Users weight="fill" />, end: "Emergency", label: "Blood" },
    ];

    return (
        <section className={styles.heroContainer}>
            {/* Background Abstract Layer */}
            <div className={styles.heroBg} />

            <div className={styles.contentWrapper}>
                {/* Left Side: Text Content */}
                <div className={styles.textContent}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className={styles.tagline}>{t('landing.hero_tagline')}</span>
                        <h1 className={styles.title}>
                            {t('landing.hero_title')} <br />
                            <span className={styles.highlight}>{t('landing.hero_highlight')}</span>
                        </h1>
                        <h2 className={styles.subtitle}>
                            One Life, One Record, Total Care
                        </h2>
                        <p className={styles.description}>{t('landing.hero_desc')}</p>
                    </motion.div>

                    <motion.div
                        className={styles.ctaGroup}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <button className={styles.primaryBtn} onClick={() => navigate('/login')}>
                            {t('landing.get_started')} <CaretRight size={20} weight="bold" />
                        </button>
                        <button className={styles.secondaryBtn} onClick={() => navigate('/about')}>
                            {t('landing.learn_more')} <PlayCircle size={20} weight="regular" />
                        </button>
                    </motion.div>
                </div>

                {/* Right Side: Stats / Visuals (Desktop Only mostly) */}
                <motion.div
                    className={styles.statsContainer}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statCard}>
                            <div className={styles.iconBox}>{stat.icon}</div>
                            <div className={styles.statInfo}>
                                <h3>{stat.end}</h3>
                                <p>{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
