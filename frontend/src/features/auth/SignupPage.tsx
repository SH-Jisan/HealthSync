import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Envelope, Phone, Lock, Buildings, FirstAid, Heartbeat
} from 'phosphor-react';
import styles from './SignupPage.module.css';

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
            <div className={styles.formBox}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t('auth.signup_title')}</h1>
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
                                        {/* CSS will handle color via inheritance */}
                                        <r.Icon size={24} />
                                    </div>
                                    <span className={styles.roleText}>{r.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className={styles.inputGroup}>
                        <User size={20} className={styles.icon} />
                        <input
                            required type="text" placeholder={t('auth.full_name_label')}
                            value={fullName} onChange={e => setFullName(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    {/* Phone */}
                    <div className={styles.inputGroup}>
                        <Phone size={20} className={styles.icon} />
                        <input
                            required type="tel" placeholder={t('auth.phone_label')}
                            value={phone} onChange={e => setPhone(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    {/* Email */}
                    <div className={styles.inputGroup}>
                        <Envelope size={20} className={styles.icon} />
                        <input
                            required type="email" placeholder={t('auth.email_label')}
                            value={email} onChange={e => setEmail(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    {/* Password */}
                    <div className={styles.inputGroup}>
                        <Lock size={20} className={styles.icon} />
                        <input
                            required type="password" placeholder={t('auth.password_hint')}
                            value={password} onChange={e => setPassword(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className={styles.submitBtn}
                    >
                        {loading ? t('auth.creating_account') : t('auth.signup_button')}
                    </button>
                </form>

                <p className={styles.loginText}>
                    {t('auth.already_have_account')}{' '}
                    <Link to="/login" className={styles.link}>
                        {t('auth.login_button')}
                    </Link>
                </p>
            </div>
        </div>
    );
}