import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom'; // Import useLocation
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabaseClient';
import type { Doctor } from '../../../types';
import { FirstAid, MagnifyingGlass, User, Globe, MapPin, Star } from 'phosphor-react';
import BookAppointmentModal from './BookAppointmentModal';

// Interface for Google Doctors (matching Serper API format)
interface InternetDoctor {
    title: string;
    address?: string;
    rating?: number;
    userRatingsTotal?: number;
    link?: string;
}

export default function DoctorList() {
    const { t } = useTranslation();
    // 1. Get URL params & Location State
    const [searchParams] = useSearchParams();
    const { state } = useLocation(); // Data passed from AI Doctor
    const initialSpec = searchParams.get('specialty') || 'All';
    const internetDoctors: InternetDoctor[] = state?.internetDoctors || [];

    // State
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSpec, setSelectedSpec] = useState(initialSpec);
    const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
    const [activeTab, setActiveTab] = useState<'app' | 'google'>('app'); // Tab State

    const predefinedSpecialties = ['All', 'Cardiology', 'General Medicine', 'Neurology', 'Pediatrics', 'Dermatology'];
    const displaySpecialties = predefinedSpecialties.includes(selectedSpec) || selectedSpec === 'All'
        ? predefinedSpecialties
        : [...predefinedSpecialties, selectedSpec];

    // Fetch App Doctors
    const fetchDoctors = async () => {
        setLoading(true);
        let query = supabase.from('profiles').select('*').eq('role', 'DOCTOR');

        if (selectedSpec !== 'All') {
            query = query.ilike('specialty', `%${selectedSpec}%`);
        }

        const { data, error } = await query;
        if (!error && data) setDoctors(data as Doctor[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchDoctors();
        // If we have internet doctors, switch to that tab if app doctors are empty, or just stay on app
        if (internetDoctors.length > 0 && doctors.length === 0) {
            // Optional: Auto switch logic could go here
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSpec]);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ color: 'var(--primary)' }}>{t('doctor_list.title')}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>{t('doctor_list.subtitle')}</p>

                {selectedSpec !== 'All' && (
                    <div style={{
                        display: 'inline-block', marginTop: '10px', padding: '4px 12px',
                        background: '#E0F2F1', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.9rem'
                    }}>
                        {t('doctor_list.filter_by')} <strong>{selectedSpec}</strong>
                    </div>
                )}
            </div>

            {/* Main Tabs (App vs Google) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                <button
                    onClick={() => setActiveTab('app')}
                    style={{
                        padding: '1rem 2rem', background: 'none', border: 'none',
                        borderBottom: activeTab === 'app' ? '3px solid var(--primary)' : '3px solid transparent',
                        color: activeTab === 'app' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'
                    }}
                >
                    {t('doctor_list.tabs.app_doctors')}
                </button>
                <button
                    onClick={() => setActiveTab('google')}
                    style={{
                        padding: '1rem 2rem', background: 'none', border: 'none',
                        borderBottom: activeTab === 'google' ? '3px solid var(--primary)' : '3px solid transparent',
                        color: activeTab === 'google' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Globe size={20} /> {t('doctor_list.tabs.google_doctors')}
                </button>
            </div>

            {/* TAB 1: APP DOCTORS */}
            {activeTab === 'app' && (
                <>
                    {/* Specialty Filters */}
                    <div style={{
                        display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '1rem', justifyContent: 'center', flexWrap: 'wrap'
                    }}>
                        {displaySpecialties.map(spec => (
                            <button
                                key={spec}
                                onClick={() => setSelectedSpec(spec)}
                                style={{
                                    padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--primary)',
                                    background: selectedSpec === spec ? 'var(--primary)' : 'transparent',
                                    color: selectedSpec === spec ? 'white' : 'var(--primary)',
                                    cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', textTransform: 'capitalize'
                                }}
                            >
                                {t(`doctor_list.specialties.${spec}`, spec)}
                            </button>
                        ))}
                    </div>

                    {/* App Doctor Grid */}
                    {loading ? (
                        <div style={{ textAlign: 'center', marginTop: '3rem' }}>{t('doctor_list.loading')}</div>
                    ) : doctors.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)' }}>
                            <MagnifyingGlass size={48} />
                            <p>{t('doctor_list.no_results', { spec: selectedSpec })}</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem'
                        }}>
                            {doctors.map(doc => (
                                <div key={doc.id} style={{
                                    background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px',
                                    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
                                }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%', background: '#E0F2F1', color: 'var(--primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
                                    }}>
                                        <User size={40} />
                                    </div>
                                    <h3 style={{ margin: '0 0 5px 0' }}>{doc.full_name}</h3>
                                    <span style={{
                                        background: '#F1F5F9', color: 'var(--text-secondary)', padding: '4px 10px',
                                        borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500
                                    }}>
                                        {doc.specialty || t('doctor_list.general_physician')}
                                    </span>
                                    <button
                                        onClick={() => setBookingDoctor(doc)}
                                        style={{
                                            marginTop: '1.5rem', width: '100%', padding: '10px',
                                            background: 'var(--primary)', color: 'white', border: 'none',
                                            borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        <FirstAid size={20} /> {t('doctor_list.book_btn')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* TAB 2: GOOGLE DOCTORS */}
            {activeTab === 'google' && (
                <div>
                    {internetDoctors.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)' }}>
                            <Globe size={48} />
                            <p>{t('doctor_list.no_internet')}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {internetDoctors.map((doc, idx) => (
                                <div key={idx} style={{
                                    background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px',
                                    border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{
                                            padding: '12px', borderRadius: '8px', background: '#EFF6FF', color: '#3B82F6'
                                        }}>
                                            <Globe size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0 }}>{doc.title}</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                {doc.address && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <MapPin size={16} /> {doc.address}
                                                    </span>
                                                )}
                                                {doc.rating && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 'bold' }}>
                                                        <Star size={16} weight="fill" /> {doc.rating} ({doc.userRatingsTotal || 0})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <a
                                        href={doc.link || `https://www.google.com/search?q=${encodeURIComponent(doc.title + ' ' + (doc.address || ''))}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            padding: '10px 20px', background: 'transparent', border: '1px solid #22C55E',
                                            color: '#22C55E', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none',
                                            display: 'flex', alignItems: 'center', gap: '8px'
                                        }}
                                    >
                                        <MapPin size={20} /> {t('doctor_list.view_map')}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Booking Modal */}
            {bookingDoctor && (
                <BookAppointmentModal
                    doctor={bookingDoctor}
                    onClose={() => setBookingDoctor(null)}
                />
            )}
        </div>
    );
}