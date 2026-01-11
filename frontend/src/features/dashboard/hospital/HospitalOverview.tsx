import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { Users, CalendarCheck, FileText, ArrowRight } from 'phosphor-react';
// import { useNavigate } from 'react-router-dom'; // <--- রিমুভ করা হয়েছে

export default function HospitalOverview() {
    const { t } = useTranslation();


    return (
        <div>
            <h1 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>{t('dashboard.hospital.overview.title')}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{
                    background: 'var(--surface)', padding: '2rem', borderRadius: '16px',
                    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '12px', background: '#E0F2F1', color: 'var(--primary)', borderRadius: '12px' }}>
                            <Users size={32} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary)' }}>24</h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('dashboard.hospital.overview.doctors_staff')}</p>
                        </div>
                    </div>
                    <button style={{ color: 'var(--primary)', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {t('dashboard.hospital.overview.manage')} <ArrowRight size={16} />
                    </button>
                </div>

                <div style={{
                    background: 'var(--surface)', padding: '2rem', borderRadius: '16px',
                    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '12px', background: '#F3E8FF', color: '#7E22CE', borderRadius: '12px' }}>
                            <CalendarCheck size={32} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary)' }}>18</h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('dashboard.hospital.overview.appointments')}</p>
                        </div>
                    </div>
                    <button style={{ color: '#7E22CE', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {t('dashboard.hospital.overview.view_schedule')} <ArrowRight size={16} />
                    </button>
                </div>

                <div style={{
                    background: 'var(--surface)', padding: '2rem', borderRadius: '16px',
                    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '12px', background: '#FFEDD5', color: '#C2410C', borderRadius: '12px' }}>
                            <FileText size={32} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary)' }}>56</h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('common.total')} {t('dashboard.doctor.patients.title')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>{t('dashboard.hospital.overview.quick_actions')}</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button style={{
                    padding: '1rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    <Users size={20} color="var(--primary)" /> {t('dashboard.hospital.overview.assign_doctor')}
                </button>
                <button style={{
                    padding: '1rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    <FileText size={20} color="#C2410C" /> {t('dashboard.hospital.overview.update_inventory')}
                </button>
                <button style={{
                    padding: '1rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    <CalendarCheck size={20} color="#7E22CE" /> {t('dashboard.hospital.overview.view_analytics')}
                </button>
            </div>
        </div>
    );
}

// Styles removed as they were not used (inline styles are used instead)
