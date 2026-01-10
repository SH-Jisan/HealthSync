// src/features/about/AboutPage.tsx
import type { ReactNode } from 'react';
import { Code, Database, Brain, MagnifyingGlass } from 'phosphor-react'; // Removed CheckCircle

export default function AboutPage() {
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
                <h1 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>HealthSync Pro</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Version 1.0.0 (Web)</p>
            </div>

            {/* How to use Section */}
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>How to use</h2>
            <div style={{
                background: 'var(--surface)', padding: '2rem', borderRadius: '20px',
                boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)'
            }}>
                <StepRow num="1" text="Upload medical reports or prescriptions to maintain history." />
                <StepRow num="2" text="AI analyzes reports and creates a timeline automatically." />
                <StepRow num="3" text="Consult AI Doctor for instant symptom checking." />
                <StepRow num="4" text="Use Blood Bank to find donors or request blood." />
            </div>

            <div style={{ height: '2rem' }} />

            {/* Powered By Section */}
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Powered By</h2>
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem'
            }}>
                <TechCard icon={<Code size={24} />} title="React + Vite" subtitle="Web Framework" color="#3B82F6" bg="#EFF6FF" />
                <TechCard icon={<Database size={24} />} title="Supabase" subtitle="Backend DB" color="#10B981" bg="#ECFDF5" />
                <TechCard icon={<Brain size={24} />} title="Gemini AI" subtitle="Intelligence" color="#A855F7" bg="#F3E8FF" />
                <TechCard icon={<MagnifyingGlass size={24} />} title="Serper API" subtitle="Doc Search" color="#F97316" bg="#FFF7ED" />
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
                <p style={{ fontWeight: 500 }}>Made with ❤️ for Better Healthcare</p>
                <p style={{ fontSize: '0.9rem' }}>© 2024 HealthSync Inc.</p>
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

// Fix: Defined Interface to replace 'any'
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