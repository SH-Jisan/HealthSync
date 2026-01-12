import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Envelope, Phone, Lock, Buildings, FirstAid, Heartbeat, ArrowLeft
} from 'phosphor-react';
import styles from './SignupPage.module.css';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

export default function SignupPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CITIZEN');

    // Store Icon Component Reference instead of JSX Element
    const roles = [
        { value: 'CITIZEN', label: t('auth.roles.CITIZEN'), Icon: User },
        { value: 'DOCTOR', label: t('auth.roles.DOCTOR'), Icon: Heartbeat },
        { value: 'HOSPITAL', label: t('auth.roles.HOSPITAL'), Icon: Buildings },
        { value: 'DIAGNOSTIC', label: t('auth.roles.DIAGNOSTIC'), Icon: FirstAid },
    ];

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone,
                        role: role,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                alert(t('auth.success_msg'));
                navigate('/login');
            }
        } catch (err: unknown) {
            let message = t('auth.error_msg');
            if (err instanceof Error) {
                message = err.message;
            }
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Left Panel: Medical Branding */}
            <div className={styles.brandPanel}>
                <div className={styles.brandContent}>
                    <div className={styles.brandLogo}>
                        <svg width="60" height="60" viewBox="0 0 256 256" fill="white">
                            <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM128,152a24,24,0,1,1,24-24A24,24,0,0,1,128,152Zm40-88H88a8,8,0,0,1,0-16h80a8,8,0,0,1,0,16Z" opacity="0.2"></path>
                            <path d="M208,24H48A24,24,0,0,0,24,48V208a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V48A24,24,0,0,0,208,24Zm8,184a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8ZM88,56h80a8,8,0,0,1,0,16H88a8,8,0,0,1,0-16Zm40,48a24,24,0,1,0,24,24A24,24,0,0,0,128,104Zm0,32a8,8,0,1,1,8-8A8,8,0,0,1,128,136Zm40,32H88a8,8,0,0,1,0-16h80a8,8,0,0,1,0,16Z" fill="white"></path>
                        </svg>
                    </div>
                    <h1 className={styles.brandTitle}>{t('auth.join_healthsync')}</h1>
                    <ul className={styles.brandList}>
                        <li>{t('auth.brand_list.l1')}</li>
                        <li>{t('auth.brand_list.l2')}</li>
                        <li>{t('auth.brand_list.l3')}</li>
                        <li>{t('auth.brand_list.l4')}</li>
                    </ul>
                </div>
            </div>

            {/* Right Panel: Signup Form */}
            <div className={styles.formPanel}>
                <Link to="/" className={styles.backBtn}>
                    <ArrowLeft size={20} weight="bold" />
                    <span>{t('common.back_home')}</span>
                </Link>

                <div style={{ position: 'absolute', top: '30px', right: '30px', zIndex: 10 }}>
                    <LanguageSwitcher />
                </div>

                <div className={styles.formBox}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>{t('auth.signup_title')}</h2>
                        <p className={styles.subtitle}>{t('auth.signup_subtitle')}</p>
                    </div>

                    <form onSubmit={handleSignup} className={styles.form}>
                        {/* Role Selection */}
                        <div>
                            <label className={styles.roleLabel}>{t('auth.role_label')}</label>
                            <div className={styles.roleGrid}>
                                {roles.map((r) => (
                                    <div
                                        key={r.value}
                                        onClick={() => setRole(r.value)}
                                        className={`${styles.roleCard} ${role === r.value ? styles.active : ''}`}
                                    >
                                        <div className={styles.roleIcon}>
                                            <r.Icon size={32} weight={role === r.value ? "fill" : "duotone"} />
                                        </div>
                                        <span className={styles.roleText}>{r.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className={styles.inputGroup}>
                            <User size={20} className={styles.icon} weight="duotone" />
                            <input
                                required type="text" placeholder={t('auth.full_name_label')}
                                value={fullName} onChange={e => setFullName(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        {/* Phone */}
                        <div className={styles.inputGroup}>
                            <Phone size={20} className={styles.icon} weight="duotone" />
                            <input
                                required type="tel" placeholder={t('auth.phone_label')}
                                value={phone} onChange={e => setPhone(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        {/* Email */}
                        <div className={styles.inputGroup}>
                            <Envelope size={20} className={styles.icon} weight="duotone" />
                            <input
                                required type="email" placeholder={t('auth.email_label')}
                                value={email} onChange={e => setEmail(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        {/* Password */}
                        <div className={styles.inputGroup}>
                            <Lock size={20} className={styles.icon} weight="duotone" />
                            <input
                                required type="password" placeholder={t('auth.password_hint')}
                                value={password} onChange={e => setPassword(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className={`${styles.submitBtn} t-btn-primary`}
                        >
                            {loading ? t('auth.creating_account') : t('auth.signup_button')}
                        </button>
                    </form>

                    <p className={styles.footer}>
                        {t('auth.already_have_account')}{' '}
                        <Link to="/login" className={styles.link}>
                            {t('auth.login_button')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}