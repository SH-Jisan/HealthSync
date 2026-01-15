// src/features/about/AboutPage.tsx
import { useState, type ReactNode } from 'react';
import { Code, Database, Brain, MagnifyingGlass, ArrowLeft } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './AboutPage.module.css';

export default function AboutPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'about' | 'developers'>('about');

    return (
        <div className={styles.container}>
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className={styles.backBtn}>
                <ArrowLeft size={20} weight="bold" />
                <span>{t('common.back', 'Back')}</span>
            </button>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.logoBox}>
                    H
                </div>
                <h1 className={styles.title}>{t('about.title')}</h1>
                <p className={styles.version}>{t('about.version')}</p>
            </div>

            {/* Tabs */}
            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'about' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('about')}
                >
                    {t('about.tabs.about_app')}
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'developers' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('developers')}
                >
                    {t('about.tabs.developers')}
                </button>
            </div>

            {activeTab === 'about' && (
                <>
                    {/* Purpose */}
                    <div className={styles.infoSection}>
                        <h2 className={styles.sectionTitle}>{t('about.purpose_title')}</h2>
                        <p className={styles.infoDesc}>{t('about.purpose_desc')}</p>
                    </div>

                    {/* Features */}
                    <div className={styles.infoSection}>
                        <h2 className={styles.sectionTitle}>{t('about.features_title')}</h2>
                        <ul className={styles.featureList}>
                            {(t('about.feature_list', { returnObjects: true }) as string[]).map((feature, idx) => (
                                <li key={idx} className={styles.featureItem}>
                                    <Code size={20} color="var(--primary)" weight="bold" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* How to use Section */}
                    <h2 className={styles.sectionTitle}>{t('about.how_to_use')}</h2>
                    <div className={styles.stepsBox}>
                        <StepRow num="1" text={t('about.step_1')} />
                        <StepRow num="2" text={t('about.step_2')} />
                        <StepRow num="3" text={t('about.step_3')} />
                        <StepRow num="4" text={t('about.step_4')} />
                    </div>

                    <div className={styles.spacer} />

                    {/* Powered By Section */}
                    <h2 className={styles.sectionTitle}>{t('about.powered_by')}</h2>
                    <div className={styles.techGrid}>
                        <TechCard icon={<Code size={24} />} title={t('about.tech.react.title')} subtitle={t('about.tech.react.subtitle')} color="#3B82F6" bg="#EFF6FF" />
                        <TechCard icon={<Database size={24} />} title={t('about.tech.supabase.title')} subtitle={t('about.tech.supabase.subtitle')} color="#10B981" bg="#ECFDF5" />
                        <TechCard icon={<Brain size={24} />} title={t('about.tech.gemini.title')} subtitle={t('about.tech.gemini.subtitle')} color="#A855F7" bg="#F3E8FF" />
                        <TechCard icon={<MagnifyingGlass size={24} />} title={t('about.tech.serper.title')} subtitle={t('about.tech.serper.subtitle')} color="#F97316" bg="#FFF7ED" />
                    </div>
                </>
            )}

            {activeTab === 'developers' && (
                <div className={styles.devBox}>
                    <Code size={48} weight="duotone" color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                    <h2 className={styles.devTitle}>{t('about.developers_text')}</h2>
                </div>
            )}

            {/* Footer */}
            <div className={styles.footer}>
                <p className={styles.footerMadeWith}>{t('about.footer.made_with')}</p>
                <p className={styles.footerCopyright}>{t('about.footer.copyright')}</p>
            </div>
        </div>
    );
}

// Helper Components
function StepRow({ num, text }: { num: string, text: string }) {
    return (
        <div className={styles.stepRow}>
            <div className={styles.stepNum}>
                {num}
            </div>
            <p className={styles.stepText}>{text}</p>
        </div>
    );
}

interface TechCardProps {
    icon: ReactNode;
    title: string;
    subtitle: string;
    color: string;
    bg: string;
}

function TechCard({ icon, title, subtitle, color, bg }: TechCardProps) {
    return (
        <div className={styles.techCard}>
            <div
                className={styles.techIconBox}
                style={{ background: bg, color: color }}
            >
                {icon}
            </div>
            <div>
                <div className={styles.techTitle}>{title}</div>
                <div className={styles.techSubtitle}>{subtitle}</div>
            </div>
        </div>
    );
}