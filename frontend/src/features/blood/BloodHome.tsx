import { useNavigate } from 'react-router-dom';
import { Drop, MagnifyingGlass, Megaphone, UserPlus } from 'phosphor-react';
import styles from './BloodHome.module.css';

export default function BloodHome() {
    const navigate = useNavigate();

    const options = [
        {
            title: 'Request Blood',
            desc: 'Post a request to find donors nearby.',
            icon: <Megaphone color="#EF4444" weight="fill" />,
            bg: '#FEF2F2',
            path: '/blood/request'
        },
        {
            title: 'Live Requests Feed',
            desc: 'See who needs help right now.',
            icon: <Drop color="#F97316" weight="fill" />,
            bg: '#FFF7ED',
            path: '/blood/feed'
        },
        {
            title: 'Become a Donor',
            desc: 'Register yourself to save lives.',
            icon: <UserPlus color="#10B981" weight="fill" />,
            bg: '#ECFDF5',
            path: '/blood/register'
        },
        {
            title: 'Find Donors',
            desc: 'Search donors by group & location.',
            icon: <MagnifyingGlass color="#3B82F6" weight="bold" />,
            bg: '#EFF6FF',
            path: '/blood/search' // (Optional: Implement later)
        }
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>Blood Bank</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Connect, donate, and save lives. Every drop counts.
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