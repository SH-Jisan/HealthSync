// File: HealthSync/web/src/features/doctor/DoctorPatientProfile.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import TimelineView from '../timeline/TimelineView';
import {
    ArrowLeft, Phone, Drop, MapPin,
    Flask, Prescription, Calendar, Clock
} from 'phosphor-react';

// নিশ্চিত করুন এই দুটি ফাইল তৈরি করা আছে
import PrescriptionModal from './PrescriptionModal';
import TestOrderModal from './TestOrderModal';

import styles from './styles/DoctorPatientProfile.module.css';

interface PatientProfile {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    blood_group?: string;
    district?: string;
    dob?: string;
}

export default function DoctorPatientProfile() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [patient, setPatient] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);

    // Refresh Timeline Trigger
    const [refreshTimeline, setRefreshTimeline] = useState(0);

    const fetchPatient = async () => {
        if (!id) return;
        const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (data) setPatient(data as PatientProfile);
        setLoading(false);
    };

    useEffect(() => {
        if (id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchPatient();
        }
    }, [id]);

    const handleActionSuccess = () => {
        // টাইমলাইন রিফ্রেশ করার জন্য ট্রিগার আপডেট
        setRefreshTimeline(prev => prev + 1);
    };

    // Age calculation helper
    const getAge = (dob?: string) => {
        if (!dob) return 'N/A';
        return new Date().getFullYear() - new Date(dob).getFullYear();
    };

    if (loading) return <div>{t('common.loading') || 'Loading...'}</div>;
    if (!patient) return <div>{t('dashboard.doctor.profile.not_found') || 'Patient not found'}</div>;

    return (
        <div className={styles.container}>
            <button onClick={() => navigate(-1)} className={styles.backBtn}>
                <ArrowLeft size={20} /> {t('dashboard.doctor.profile.back')}
            </button>

            {/* Header Card (আপনার স্টাইল অপরিবর্তিত রাখা হয়েছে) */}
            <div className={styles.headerCard}>
                <div className={styles.avatar}>
                    {patient.full_name?.[0]}
                </div>
                <div className={styles.patientInfo}>
                    <h1>{patient.full_name}</h1>
                    <p className={styles.contactText}>
                        <Phone size={16} weight="fill" style={{marginRight: 6}} />
                        {patient.phone || patient.email}
                    </p>
                    <div className={styles.badges}>
                        {patient.blood_group && (
                            <span className={styles.bloodBadge}>
                                <Drop size={16} weight="fill" style={{marginRight: 4}} />
                                {patient.blood_group}
                            </span>
                        )}
                        <span className={styles.locationBadge}>
                            <MapPin size={16} weight="fill" style={{marginRight: 4}} />
                            {patient.district || 'Unknown Location'}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.layoutGrid}>
                {/* Left Column: Timeline */}
                <div>
                    {/* key prop পরিবর্তনের মাধ্যমে টাইমলাইন অটো-রিফ্রেশ হবে */}
                    <TimelineView userId={id!} key={refreshTimeline} />
                </div>

                {/* Right Column: Actions Sidebar (New Layout) */}
                <div className={styles.sidebar}>
                    <div className={styles.actionCard}>
                        <h3>{t('dashboard.doctor.profile.actions_title') || 'Doctor Actions'}</h3>

                        {/* Button 1: Test Assign */}
                        <button
                            className={styles.actionBtn}
                            onClick={() => setShowTestModal(true)}
                            style={{ background: '#EEF2FF', color: '#4338ca', borderColor: '#C7D2FE' }}
                        >
                            <Flask size={32} weight="duotone" />
                            <div>
                                <strong>{t('dashboard.doctor.profile.assign_test') || 'Assign Tests'}</strong>
                                <span>Order diagnostics</span>
                            </div>
                        </button>

                        {/* Button 2: Prescription */}
                        <button
                            className={styles.actionBtn}
                            onClick={() => setShowPrescriptionModal(true)}
                            style={{ background: '#ECFDF5', color: '#047857', borderColor: '#6EE7B7' }}
                        >
                            <Prescription size={32} weight="duotone" />
                            <div>
                                <strong>{t('dashboard.doctor.profile.write_rx') || 'Write Prescription'}</strong>
                                <span>Add medicines & advice</span>
                            </div>
                        </button>

                        {/* Patient Info Block */}
                        <div className={styles.infoBlock}>
                            <h4>Patient Info</h4>
                            <div className={styles.statRow}>
                                <Calendar size={20} />
                                <span>Age: {getAge(patient.dob)} Years</span>
                            </div>
                            <div className={styles.statRow}>
                                <Clock size={20} />
                                <span>Last Visit: Today</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showPrescriptionModal && id && (
                <PrescriptionModal
                    patientId={id}
                    onClose={() => setShowPrescriptionModal(false)}
                    onSuccess={handleActionSuccess}
                />
            )}

            {showTestModal && id && (
                <TestOrderModal
                    patientId={id}
                    onClose={() => setShowTestModal(false)}
                    onSuccess={handleActionSuccess}
                />
            )}
        </div>
    );
}