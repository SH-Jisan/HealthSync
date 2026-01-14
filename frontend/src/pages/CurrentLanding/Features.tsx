import { useTranslation } from 'react-i18next';
import {
    Robot, FileText, Drop,
    SquaresFour, Heart, ShieldCheck
} from 'phosphor-react';
import { motion } from 'framer-motion';
import styles from './styles/Features.module.css';

export default function Features() {
    const { t } = useTranslation();

    const features = [
        {
            icon: <Robot weight="duotone" />,
            title: t('landing.f1_title'),
            desc: t('landing.f1_desc')
        },
        {
            icon: <FileText weight="duotone" />,
            title: t('landing.f2_title'),
            desc: t('landing.f2_desc')
        },
        {
            icon: <Heart weight="duotone" />,
            title: t('landing.f3_title'),
            desc: t('landing.f3_desc')
        },
        {
            icon: <Drop weight="duotone" />,
            title: t('landing.f4_title'),
            desc: t('landing.f4_desc')
        },
        {
            icon: <SquaresFour weight="duotone" />,
            title: t('landing.f5_title'),
            desc: t('landing.f5_desc')
        },
        {
            icon: <ShieldCheck weight="duotone" />,
            title: t('landing.f6_title'),
            desc: t('landing.f6_desc')
        }
    ];

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
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <section className={styles.section} id="features">
            <div className={styles.container}>
                <div className={styles.titleContainer}>
                    <motion.h2
                        className={styles.title}
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        {t('landing.features_title')}
                    </motion.h2>
                    <motion.p
                        className={styles.subtitle}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Experience the next generation of healthcare technology.
                    </motion.p>
                </div>

                <motion.div
                    className={styles.grid}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            className={styles.card}
                            key={index}
                            variants={itemVariants}
                        >
                            <div className={styles.iconBox}>{feature.icon}</div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardDesc}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
