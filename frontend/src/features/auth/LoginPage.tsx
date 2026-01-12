import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { Envelope, Lock, ArrowLeft } from 'phosphor-react';
import styles from './LoginPage.module.css';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
        } else {
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            {/* Left Panel: Brand & Vision */}
            <div className={styles.brandPanel}>
                <div className={styles.brandContent}>
                    <div className={styles.brandLogo}>
                        {/* HealthSync Pulse Icon */}
                        <svg width="60" height="60" viewBox="0 0 256 256" fill="white">
                            <path d="M232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-104,80H128V128H48.06a88.13,88.13,0,0,0,159.88,0H128ZM48,128h64v-80A88.11,88.11,0,0,0,48,128Z" opacity="0.2"></path>
                            <path d="M232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM114.77,74.55l-21.49,43-16.16-16.16a8,8,0,0,0-11.31,0L32,135.25A8,8,0,0,0,43.31,146.57l22.63-22.63L83.23,141.2a8,8,0,0,0,14.22.1l21.32-42.63L134.77,135.2l-21.49,43A8,8,0,0,0,120.44,189l.88,0a8,8,0,0,0,7.11-4.44l21.57-43.14L166.16,157.65a8,8,0,0,0,11.31,0L224,111.43a8,8,0,0,0-11.31-11.31l-40.63,40.63L150.77,119.55a8,8,0,0,0-14.22-.1l-21.32,42.63Z" fill="white"></path>
                        </svg>
                    </div>
                    <h1 className={styles.brandTitle}>HealthSync</h1>
                    <p className={styles.brandSubtitle}>
                        {t('auth.brand_subtitle')}
                    </p>
                </div>
            </div>

            {/* Right Panel: Clinical Form */}
            <div className={styles.formPanel}>
                <Link to="/" className={styles.backBtn}>
                    <ArrowLeft size={20} weight="bold" />
                    <span>{t('common.back_home')}</span>
                </Link>

                <div style={{ position: 'absolute', top: '30px', right: '30px', zIndex: 10 }}>
                    <LanguageSwitcher />
                </div>

                <form onSubmit={handleLogin} className={styles.formBox}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>{t('auth.welcome_back')}</h2>
                        <p className={styles.subtitle}>{t('auth.login_subtitle')}</p>
                    </div>

                    <div className={styles.inputsContainer}>
                        {/* Email */}
                        <div className={styles.inputGroup}>
                            <Envelope size={22} className={styles.icon} weight="duotone" />
                            <input
                                required
                                type="email"
                                placeholder={t('auth.email_label')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        {/* Password */}
                        <div className={styles.inputGroup}>
                            <Lock size={22} className={styles.icon} weight="duotone" />
                            <input
                                required
                                type="password"
                                placeholder={t('auth.password_label')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className={`${styles.submitBtn} t-btn-primary`}>
                        {loading ? t('common.loading') : t('auth.login_button')}
                    </button>

                    <p className={styles.footer}>
                        {t('auth.no_account')}{' '}
                        <Link to="/signup" className={styles.link}>
                            {t('auth.create_account')}
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}