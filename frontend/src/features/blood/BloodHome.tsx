import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Drop,
    MagnifyingGlass,
    Megaphone,
    UserPlus,
    ListBullets,
} from 'phosphor-react';
import styles from './BloodHome.module.css';

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
            path: '/blood/search' // (Optional: Implement later)
        }
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>{t('blood.title')}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    {t('blood.subtitle')}
                </p>
            </div>

            <div className={styles.grid}>
                {options.map((opt, idx) => (
                    <div key={idx} className={styles.card} onClick={() => navigate(opt.path)}>
                        <div className={styles.iconBox} style={{ backgroundColor: opt.bg }}>
                            {opt.icon}
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{opt.title}</h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{opt.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}