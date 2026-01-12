import { useTranslation } from 'react-i18next';
import {
    Robot, FileText, Sparkle, Drop,
    SquaresFour, Translate
} from 'phosphor-react';
import styles from './styles/Features.module.css';

export default function Features() {
    const { t } = useTranslation();

    const features = [
        {
            icon: <Robot size={32} weight="fill" />,
            title: t('landing.f1_title'),
            desc: t('landing.f1_desc')
        },
        {
            icon: <FileText size={32} weight="fill" />,
            title: t('landing.f2_title'),
            desc: t('landing.f2_desc')
        },
        {
            icon: <Sparkle size={32} weight="fill" />,
            title: t('landing.f3_title'),
            desc: t('landing.f3_desc')
        },
        {
            icon: <Drop size={32} weight="fill" />,
            title: t('landing.f4_title'),
            desc: t('landing.f4_desc')
        },
        {
            icon: <SquaresFour size={32} weight="fill" />,
            title: t('landing.f5_title'),
            desc: t('landing.f5_desc')
        },
        {
            icon: <Translate size={32} weight="fill" />,
            title: t('landing.f6_title'),
            desc: t('landing.f6_desc')
        }
    ];

    return (
        <section className={styles.section} id="features">
            <div className={styles.titleContainer}>
                <h2 className={styles.title}>{t('landing.features_title')}</h2>
                <div className={styles.underline}></div>
            </div>

            <div className={styles.grid}>
                {features.map((feature, index) => (
                    <div className={styles.card} key={index}>
                        <div className={styles.iconBox}>{feature.icon}</div>
                        <h3 className={styles.cardTitle}>{feature.title}</h3>
                        <p className={styles.cardDesc}>{feature.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
