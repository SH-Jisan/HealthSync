import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { Robot, Warning, FirstAid, Heartbeat, MagnifyingGlass } from 'phosphor-react';

// Interface Update to match Backend/Mobile App
interface InternetDoctor {
    title: string;
    address?: string;
    rating?: number;
    userRatingsTotal?: number;
    link?: string;
}

interface AIResponse {
    condition: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    specialty: string;
    advice: string;
    potential_causes: string[];
    internet_doctors?: InternetDoctor[];
}

export default function AIDoctor() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AIResponse | null>(null);

    const handleConsult = async () => {
        if (!symptoms.trim()) return;
        setLoading(true);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('triage-symptoms', {
                body: { symptoms, location: 'Dhaka' }
            });

            if (error) throw error;
            setResult(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('ai_doctor.error_fail');
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'HIGH': return { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' };
            case 'MEDIUM': return { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' };
            default: return { bg: '#D1FAE5', text: '#059669', border: '#6EE7B7' };
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                    width: '60px', height: '60px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
                }}>
                    <Robot size={32} color="white" />
                </div>
                <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{t('ai_doctor.title')}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>{t('ai_doctor.subtitle')}</p>
            </div>

            {/* Input Section */}
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <textarea
                    rows={4}
                    placeholder={t('ai_doctor.placeholder')}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ccc', fontSize: '1rem', marginBottom: '1rem', fontFamily: 'inherit' }}
                />
                <button
                    onClick={handleConsult}
                    disabled={loading || !symptoms}
                    style={{
                        width: '100%', padding: '14px', background: 'var(--primary)', color: 'white',
                        border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                    }}
                >
                    {loading ? t('ai_doctor.analyzing') : <><Heartbeat size={24} /> {t('ai_doctor.consult_btn')}</>}
                </button>
            </div>

            {/* Result Card */}
            {result && (
                <div style={{ marginTop: '2rem', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', animation: 'slideUp 0.4s ease-out' }}>

                    {/* Result Header */}
                    <div style={{
                        padding: '1.5rem',
                        background: getUrgencyColor(result.urgency).bg,
                        borderBottom: `1px solid ${getUrgencyColor(result.urgency).border}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Warning size={24} color={getUrgencyColor(result.urgency).text} weight="fill" />
                            <h2 style={{ margin: 0, color: getUrgencyColor(result.urgency).text }}>{result.condition}</h2>
                        </div>
                        <span style={{
                            background: 'white', color: getUrgencyColor(result.urgency).text,
                            padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem'
                        }}>
                            {result.urgency} {t('ai_doctor.urgency')}
                        </span>
                    </div>

                    <div style={{ padding: '2rem' }}>

                        {/* Causes */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('ai_doctor.causes')}</h4>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                {result.potential_causes.map((cause, idx) => (
                                    <li key={idx} style={{ marginBottom: '5px', color: 'var(--text-primary)' }}>{cause}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Advice */}
                        <div style={{ marginBottom: '2rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                            <h4 style={{ color: 'var(--primary)', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FirstAid size={20} /> {t('ai_doctor.advice')}
                            </h4>
                            <p style={{ margin: 0, fontStyle: 'italic', color: '#475569' }}>"{result.advice}"</p>
                        </div>

                        {/* Action Button */}
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>{t('ai_doctor.rec_specialist')} <strong>{result.specialty}</strong></p>

                            <button
                                onClick={() => navigate(`/doctors?specialty=${result.specialty}`, {
                                    state: { internetDoctors: result.internet_doctors } // Pass data to DoctorList
                                })}
                                style={{
                                    padding: '12px 30px', background: 'var(--primary)', color: 'white',
                                    border: 'none', borderRadius: '50px', fontWeight: 'bold',
                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                }}
                            >
                                <MagnifyingGlass size={20} weight="bold" />
                                {t('ai_doctor.find_specialist', { specialty: result.specialty })}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}