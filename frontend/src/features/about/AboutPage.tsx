// src/features/about/AboutPage.tsx
import type { ReactNode } from 'react';
import { Code, Database, Brain, MagnifyingGlass } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

export default function AboutPage() {
    const { t } = useTranslation();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{
                    width: '100px', height: '100px', background: 'var(--primary)',
                    borderRadius: '20px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '3rem', fontWeight: 'bold'
                }}>
                    H
                </div>
                <h1 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{t('about.title')}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>{t('about.version')}</p>
            </div>

            {/* How to use Section */}
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>{t('about.how_to_use')}</h2>
            <div style={{
                background: 'var(--surface)', padding: '2rem', borderRadius: '20px',
                boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)'
            }}>
                <StepRow num="1" text={t('about.step_1')} />
                <StepRow num="2" text={t('about.step_2')} />
                <StepRow num="3" text={t('about.step_3')} />
                <StepRow num="4" text={t('about.step_4')} />
            </div>

            <div style={{ height: '2rem' }} />

            {/* Powered By Section */}
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>{t('about.powered_by')}</h2>
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem'
            }}>
                <TechCard icon={<Code size={24} />} title={t('about.tech.react.title')} subtitle={t('about.tech.react.subtitle')} color="#3B82F6" bg="#EFF6FF" />
                <TechCard icon={<Database size={24} />} title={t('about.tech.supabase.title')} subtitle={t('about.tech.supabase.subtitle')} color="#10B981" bg="#ECFDF5" />
                <TechCard icon={<Brain size={24} />} title={t('about.tech.gemini.title')} subtitle={t('about.tech.gemini.subtitle')} color="#A855F7" bg="#F3E8FF" />
                <TechCard icon={<MagnifyingGlass size={24} />} title={t('about.tech.serper.title')} subtitle={t('about.tech.serper.subtitle')} color="#F97316" bg="#FFF7ED" />
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
                <p style={{ fontWeight: 500 }}>{t('about.footer.made_with')}</p>
                <p style={{ fontSize: '0.9rem' }}>{t('about.footer.copyright')}</p>
            </div>
        </div>
    );
}

// Helper Components
function StepRow({ num, text }: { num: string, text: string }) {
    return (
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{
                minWidth: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)',
                color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}>
                {num}
            </div>
            <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--text-primary)' }}>{text}</p>
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
        <div style={{
            padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: bg, color: color, display: 'flex' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{subtitle}</div>
            </div>
        </div>
    );
}