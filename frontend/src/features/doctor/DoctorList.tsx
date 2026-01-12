import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import type { Doctor } from '../../types';
import { FirstAid, MagnifyingGlass, User, Globe, MapPin, Star } from 'phosphor-react';
import BookAppointmentModal from './BookAppointmentModal';
import styles from './styles/DoctorList.module.css';

interface InternetDoctor {
    title: string;
    address?: string;
    rating?: number;
    userRatingsTotal?: number;
    link?: string;
}

export default function DoctorList() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const { state } = useLocation();
    const initialSpec = searchParams.get('specialty') || 'All';
    const internetDoctors: InternetDoctor[] = state?.internetDoctors || [];

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSpec, setSelectedSpec] = useState(initialSpec);
    const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
    const [activeTab, setActiveTab] = useState<'app' | 'google'>('app');

    const predefinedSpecialties = ['All', 'Cardiology', 'General Medicine', 'Neurology', 'Pediatrics', 'Dermatology'];
    const displaySpecialties = predefinedSpecialties.includes(selectedSpec) || selectedSpec === 'All'
        ? predefinedSpecialties
        : [...predefinedSpecialties, selectedSpec];

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDoctors();
    }, [selectedSpec]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t('doctor_list.title')}</h1>
                <p className={styles.subtitle}>{t('doctor_list.subtitle')}</p>

                {selectedSpec !== 'All' && (
                    <div className={styles.filterBadge}>
                        {t('doctor_list.filter_by')} <strong>{selectedSpec}</strong>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    onClick={() => setActiveTab('app')}
                    className={`${styles.tabBtn} ${activeTab === 'app' ? styles.tabBtnActive : ''}`}
                >
                    {t('doctor_list.tabs.app_doctors')}
                </button>
                <button
                    onClick={() => setActiveTab('google')}
                    className={`${styles.tabBtn} ${activeTab === 'google' ? styles.tabBtnActive : ''}`}
                >
                    <Globe size={20} /> {t('doctor_list.tabs.google_doctors')}
                </button>
            </div>

            {/* TAB 1: APP DOCTORS */}
            {activeTab === 'app' && (
                <>
                    <div className={styles.filters}>
                        {displaySpecialties.map(spec => (
                            <button
                                key={spec}
                                onClick={() => setSelectedSpec(spec)}
                                className={`${styles.filterChip} ${selectedSpec === spec ? styles.filterChipActive : ''}`}
                            >
                                {t(`doctor_list.specialties.${spec}`, spec)}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className={styles.emptyState}>{t('doctor_list.loading')}</div>
                    ) : doctors.length === 0 ? (
                        <div className={styles.emptyState}>
                            <MagnifyingGlass size={48} />
                            <p>{t('doctor_list.no_results', { spec: selectedSpec })}</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {doctors.map(doc => (
                                <div key={doc.id} className={styles.card}>
                                    <div className={styles.avatar}>
                                        <User size={40} />
                                    </div>
                                    <h3 className={styles.docName}>{doc.full_name}</h3>
                                    <span className={styles.specialty}>
                                        {doc.specialty || t('doctor_list.general_physician')}
                                    </span>
                                    <button
                                        onClick={() => setBookingDoctor(doc)}
                                        className={styles.bookBtn}
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
                        <div className={styles.emptyState}>
                            <Globe size={48} />
                            <p>{t('doctor_list.no_internet')}</p>
                        </div>
                    ) : (
                        <div className={styles.googleList}>
                            {internetDoctors.map((doc, idx) => (
                                <div key={idx} className={styles.googleCard}>
                                    <div className={styles.googleInfo}>
                                        <div className={styles.googleIcon}>
                                            <Globe size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0 }}>{doc.title}</h3>
                                            <div className={styles.googleMeta}>
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
                                        className={styles.mapBtn}
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