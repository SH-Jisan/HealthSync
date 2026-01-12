import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Drop, MagnifyingGlass, Megaphone, UserPlus, ListBullets,
} from 'phosphor-react';
import styles from './styles/BloodHome.module.css';

export default function BloodHome() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const options = [
        {
            title: t('blood.options.request'),
            desc: t('blood.options.request_desc'),
            icon: <Megaphone color="#EF4444" weight="fill" />,
            bg: '#FEF2F2',
            path: '/blood/request'
        },
        {
            title: t('blood.options.feed'),
            desc: t('blood.options.feed_desc'),
            icon: <Drop color="#F97316" weight="fill" />,
            bg: '#FFF7ED',
            path: '/blood/feed'
        },
        {
            title: t('blood.options.my_requests'),
            desc: t('blood.options.my_requests_desc'),
            icon: <ListBullets color="#8B5CF6" weight="bold" />,
            bg: '#F3E8FF',
            path: '/blood/my-requests'
        },
        {
            title: t('blood.options.register'),
            desc: t('blood.options.register_desc'),
            icon: <UserPlus color="#10B981" weight="fill" />,
            bg: '#ECFDF5',
            path: '/blood/register'
        },
        {
            title: t('blood.options.search'),
            desc: t('blood.options.search_desc'),
            icon: <MagnifyingGlass color="#3B82F6" weight="bold" />,
            bg: '#EFF6FF',
            path: '/blood/search'
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t('blood.title')}</h1>
                <p className={styles.subtitle}>{t('blood.subtitle')}</p>
            </div>

            <div className={styles.grid}>
                {options.map((opt, idx) => (
                    <div key={idx} className={styles.card} onClick={() => navigate(opt.path)}>
                        <div className={styles.iconBox} style={{ backgroundColor: opt.bg }}>
                            {opt.icon}
                        </div>
                        <h3 className={styles.cardTitle}>{opt.title}</h3>
                        <p className={styles.cardDesc}>{opt.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}