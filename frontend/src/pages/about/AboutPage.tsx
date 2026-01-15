// src/features/about/AboutPage.tsx
import { useState, type ReactNode } from 'react';
import { Code, Database, Brain, MagnifyingGlass, ArrowLeft, Phone } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './AboutPage.module.css';

// Developer Assets
import rizviImg from '../../assets/developers/rizvi.jpg';
import nahidImg from '../../assets/developers/Nahid Vai.jpg';
import jisanImg from '../../assets/developers/jisan.png';
import muniraImg from '../../assets/developers/munira.jpeg';
import anisurImg from '../../assets/developers/anisur.jpeg';
import teamImg from '../../assets/developers/syntax_samuraies team.jpeg';

const developers = [
    {
        name: "Md Rifat Islam Rizvi",
        role: "Project Lead, AI/ML Developer",
        dept: "Department of CSE, Gopalganj Science & Technology University",
        contact: "01305612767",
        img: rizviImg
    },
    {
        name: "Md Nahid Hossain",
        role: "AI/ML Developer",
        dept: "Department of CSE, Gopalganj Science & Technology University",
        contact: "01859232959",
        img: nahidImg
    },
    {
        name: "Sanjid Hasan Jisan",
        role: "Frontend & Backend Developer",
        dept: "Department of CSE, Gopalganj Science & Technology University",
        contact: "01537284797",
        img: jisanImg
    },
    {
        name: "Munira Khondoker",
        role: "Data Analyst and Researcher",
        dept: "Department of CSE, Gopalganj Science & Technology University",
        contact: "01876541001",
        img: muniraImg
    },
    {
        name: "Anisur Rahman",
        role: "Video Editor & Graphic Designer",
        dept: "Department of CSE, Gopalganj Science & Technology University",
        contact: "01616414541",
        img: anisurImg
    }
];

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
                    <div className={styles.guideContainer}>
                        <h2 className={styles.sectionTitle}>{t('about.how_to_use')}</h2>

                        {['account', 'dashboard', 'appointments', 'history', 'blood'].map((section) => (
                            <div key={section} className={styles.guideSection}>
                                <h3 className={styles.guideTitle}>{t(`about.guide.${section}.title`)}</h3>
                                <div className={styles.stepsBox}>
                                    {(t(`about.guide.${section}.steps`, { returnObjects: true }) as string[]).map((step, idx) => (
                                        <StepRow key={idx} num={(idx + 1).toString()} text={step} />
                                    ))}
                                </div>
                            </div>
                        ))}
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
                <div className={styles.teamSection}>
                    <div className={styles.teamImgWrapper}>
                        <img src={teamImg} alt="Team Syntax Samuraies" className={styles.teamImg} />
                    </div>

                    <h2 className={styles.sectionTitle}>{t('about.developers_text', 'Developed By Team Syntax_Samuraies')}</h2>

                    <div className={styles.devGrid}>
                        {developers.map((dev, idx) => (
                            <div key={idx} className={styles.devCard}>
                                <img src={dev.img} alt={dev.name} className={styles.devAvatar} />
                                <h3 className={styles.devName}>{dev.name}</h3>
                                <div className={styles.devRole}>{dev.role}</div>
                                <p className={styles.devDept}>{dev.dept}</p>
                                <div className={styles.devContact}>
                                    <Phone size={16} weight="fill" /> {dev.contact}
                                </div>
                            </div>
                        ))}
                    </div>
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