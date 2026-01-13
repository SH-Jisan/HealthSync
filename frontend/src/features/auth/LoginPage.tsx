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
                <div className={styles.brandNav}>
                    <Link to="/" className={styles.backBtn}>
                        <ArrowLeft size={20} weight="bold" />
                        <span>{t('common.back_home')}</span>
                    </Link>
                    <LanguageSwitcher />
                </div>

                <div className={styles.brandContent}>
                    <div className={styles.brandLogo}>
                        {/* HealthSync Pulse Icon */}
                        <img src="/logo3.png" alt="HealthSync Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                    </div>
                    <h1 className={styles.brandTitle}>HealthSync</h1>
                    <p className={styles.brandSubtitle}>
                        {t('auth.brand_subtitle')}
                    </p>
                </div>
            </div>

            {/* Right Panel: Clinical Form */}
            <div className={styles.formPanel}>
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