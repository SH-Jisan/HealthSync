import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Drop, MagnifyingGlass, Megaphone, UserPlus, ListBullets, CaretRight
} from 'phosphor-react';
import { motion } from 'framer-motion';
import styles from './styles/BloodHome.module.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 15
        }
    }
};

export default function BloodHome() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const options = [
        {
            title: t('blood.options.request'),
            desc: t('blood.options.request_desc'),
            icon: <Megaphone color="#EF4444" weight="fill" />,
            bg: 'rgba(239, 68, 68, 0.1)',
            path: '/blood/request',
            color: '#EF4444'
        },
        {
            title: t('blood.options.feed'),
            desc: t('blood.options.feed_desc'),
            icon: <Drop color="#F97316" weight="fill" />,
            bg: 'rgba(249, 115, 22, 0.1)',
            path: '/blood/feed',
            color: '#F97316'
        },
        {
            title: t('blood.options.my_requests'),
            desc: t('blood.options.my_requests_desc'),
            icon: <ListBullets color="#8B5CF6" weight="bold" />,
            bg: 'rgba(139, 92, 246, 0.1)',
            path: '/blood/my-requests',
            color: '#8B5CF6'
        },
        {
            title: t('blood.options.register'),
            desc: t('blood.options.register_desc'),
            icon: <UserPlus color="#10B981" weight="fill" />,
            bg: 'rgba(16, 185, 129, 0.1)',
            path: '/blood/register',
            color: '#10B981'
        },
        {
            title: t('blood.options.search'),
            desc: t('blood.options.search_desc'),
            icon: <MagnifyingGlass color="#3B82F6" weight="bold" />,
            bg: 'rgba(59, 130, 246, 0.1)',
            path: '/blood/search',
            color: '#3B82F6'
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.heroSection}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={styles.header}
                >
                    <h1 className={styles.title}>
                        <span className="t-text-gradient">{t('blood.title')}</span>
                    </h1>
                    <div className="t-title-underline" />
                    <p className={styles.subtitle}>{t('blood.subtitle')}</p>
                </motion.div>
            </div>

            <motion.div
                className={styles.grid}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {options.map((opt, idx) => (
                    <motion.div
                        key={idx}
                        className={`${styles.card} t-card-glass`}
                        onClick={() => navigate(opt.path)}
                        variants={itemVariants}
                        whileHover={{ scale: 1.03, translateY: -5 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className={styles.iconWrapper} style={{ backgroundColor: opt.bg }}>
                            {opt.icon}
                        </div>
                        <div className={styles.content}>
                            <h3 className={styles.cardTitle}>{opt.title}</h3>
                            <p className={styles.cardDesc}>{opt.desc}</p>
                        </div>
                        <div className={styles.actionArrow} style={{ color: opt.color }}>
                            <CaretRight size={20} weight="bold" />
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}