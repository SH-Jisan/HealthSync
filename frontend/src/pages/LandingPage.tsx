import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { ShieldCheck, Heartbeat, Drop, Brain } from 'phosphor-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const toggleLang = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');
    };

    return (
        <div
            style={{
                fontFamily: "'Poppins', sans-serif",
                backgroundColor: 'var(--background)',
                minHeight: '100vh',
            }}
        >
            {/* Navbar */}
            <nav
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem 2rem',
                    maxWidth: '1200px',
                    margin: '0 auto',
                }}
            >
                <div
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <ShieldCheck size={32} weight="fill" />
                    {t('common.health_sync', 'HealthSync')}
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Language Toggle */}
                    <button
                        onClick={toggleLang}
                        style={{
                            background: 'none',
                            border: '1px solid var(--primary)',
                            borderRadius: '20px',
                            padding: '5px 15px',
                            cursor: 'pointer',
                            color: 'var(--primary)',
                        }}
                    >
                        {i18n.language === 'en' ? 'বাংলা' : 'English'}
                    </button>

                    {/* Login */}
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: '50px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0, 121, 107, 0.2)',
                        }}
                    >
                        {t('common.login', 'Login')}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header
                style={{
                    textAlign: 'center',
                    padding: '4rem 1rem',
                    maxWidth: '800px',
                    margin: '0 auto',
                }}
            >
                <h1
                    style={{
                        fontSize: '3.5rem',
                        lineHeight: '1.2',
                        marginBottom: '1.5rem',
                        color: 'var(--text-primary)',
                    }}
                >
                    <Trans i18nKey="landing.hero_title">
                        Your Personal <span style={{ color: 'var(--primary)' }}>AI Health</span>{' '}
                        Assistant
                    </Trans>
                </h1>

                <p
                    style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '2.5rem',
                    }}
                >
                    {t(
                        'landing.hero_desc',
                        'Manage medical records, consult AI doctors, find blood donors, and book appointments - all in one place.'
                    )}
                </p>

                <button
                    onClick={() => navigate('/login')}
                    style={{
                        background: 'var(--primary-dark)',
                        color: 'white',
                        border: 'none',
                        padding: '16px 40px',
                        borderRadius: '50px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                    }}
                >
                    {t('landing.get_started', 'Get Started Now')}
                </button>
            </header>

            {/* Features Grid */}
            <section
                style={{
                    maxWidth: '1000px',
                    margin: '2rem auto',
                    padding: '0 1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                }}
            >
                <FeatureCard
                    icon={<Brain size={32} color="#7E22CE" />}
                    title={t('landing.feature_ai', 'AI Doctor')}
                    desc={t(
                        'landing.feature_ai_desc',
                        'Instant symptom analysis and triage using advanced Gemini AI.'
                    )}
                    bg="#F3E8FF"
                />

                <FeatureCard
                    icon={<Heartbeat size={32} color="#059669" />}
                    title={t('landing.feature_timeline', 'Medical Timeline')}
                    desc={t(
                        'landing.feature_timeline_desc',
                        'Keep track of your history. Upload reports and let AI organize them.'
                    )}
                    bg="#D1FAE5"
                />

                <FeatureCard
                    icon={<Drop size={32} color="#DC2626" />}
                    title={t('landing.feature_blood', 'Blood Bank')}
                    desc={t(
                        'landing.feature_blood_desc',
                        'Real-time blood requests and donor connecting system.'
                    )}
                    bg="#FEE2E2"
                />
            </section>

            {/* Footer */}
            <footer
                style={{
                    textAlign: 'center',
                    padding: '3rem',
                    marginTop: '3rem',
                    borderTop: '1px solid var(--border)',
                }}
            >
                <p style={{ color: 'var(--text-secondary)' }}>
                    {t(
                        'landing.footer',
                        '© 2024 HealthSync Inc. Better Healthcare for Everyone.'
                    )}
                </p>
            </footer>
        </div>
    );
}

// Feature Card Component
function FeatureCard({ icon, title, desc, bg }: any) {
    return (
        <div
            style={{
                padding: '2rem',
                borderRadius: '20px',
                background: 'white',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                }}
            >
                {icon}
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem' }}>{title}</h3>
            <p
                style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                }}
            >
                {desc}
            </p>
        </div>
    );
}
