// File: HealthSync/web/src/features/patient/PatientPrescriptions.tsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import {
    Prescription, Flask, User,
    ArrowRight, Robot, CheckCircle, Clock
} from 'phosphor-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion'; // Added Framer Motion
import EventDetailsModal from '../timeline/EventDetailsModal';
import styles from './styles/PatientPrescriptions.module.css';

interface MedicalItem {
    id: string;
    title: string;
    event_type: 'PRESCRIPTION' | 'TEST_ORDER';
    event_date: string;
    summary?: string;
    uploader?: {
        full_name: string;
        specialty?: string;
    };
    ai_details?: any;
    medicines?: any[];
    key_findings?: string[];
}

export default function PatientPrescriptions() {
    const { t } = useTranslation();
    const [items, setItems] = useState<MedicalItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'prescription' | 'test'>('prescription'); // Tab State

    // Modal State
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const fetchRecords = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data, error } = await supabase
                .from('medical_events')
                .select('*, uploader:uploader_id(full_name, specialty), profiles:patient_id(full_name, phone)')
                .eq('patient_id', user.id)
                .in('event_type', ['PRESCRIPTION', 'TEST_ORDER'])
                .order('event_date', { ascending: false });

            if (!error && data) {
                setItems(data as any[]);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // Filter Items based on Tab
    const filteredItems = items.filter(item => {
        if (activeTab === 'prescription') return item.event_type === 'PRESCRIPTION';
        return item.event_type === 'TEST_ORDER';
    });

    const handleAnalyze = async (e: React.MouseEvent, item: MedicalItem) => {
        e.stopPropagation();
        setAnalyzingId(item.id);

        try {
            let reportText = `Title: ${item.title}\nDate: ${item.event_date}\nDoctor: ${item.uploader?.full_name}\n`;

            if (item.medicines && item.medicines.length > 0) {
                reportText += `\nMedicines:\n` + item.medicines.map(m => `- ${m.name} (${m.dosage})`).join('\n');
            }

            if (item.key_findings && item.key_findings.length > 0) {
                reportText += `\nTests/Findings:\n` + item.key_findings.join(', ');
            }

            if (item.summary) {
                reportText += `\nDoctor Notes: ${item.summary}`;
            }

            const { data, error } = await supabase.functions.invoke('process-medical-report', {
                body: {
                    reportText: reportText,
                    patient_id: (await supabase.auth.getUser()).data.user?.id,
                    file_hash: `manual_${item.id}`,
                }
            });

            if (error) throw error;

            if (data?.data) {
                await supabase
                    .from('medical_events')
                    .update({ ai_details: data.data })
                    .eq('id', item.id);

                fetchRecords();
                alert("Analysis Complete!");
            }

        } catch (err) {
            console.error(err);
            alert("Failed to analyze. Please try again.");
        } finally {
            setAnalyzingId(null);
        }
    };

    if (loading) return <div className={styles.loading}>{t('common.loading') || 'Loading...'}</div>;

    const tabs = [
        { id: 'prescription', label: t('patient.prescriptions.tab_rx') || 'Prescriptions', Icon: Prescription },
        { id: 'test', label: t('patient.prescriptions.tab_tests') || 'Tests', Icon: Flask },
    ] as const;


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>{t('patient.prescriptions.title') || 'My Medical Records'}</h1>
                    <p>{t('patient.prescriptions.subtitle') || 'Manage your prescriptions and test orders'}</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className={styles.tabsContainer}>
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'prescription' | 'test')} // Correct casting
                            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activePill"
                                    className={styles.activePill}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className={styles.tabContent}>
                                <tab.Icon size={20} weight={activeTab === tab.id ? 'fill' : 'regular'} />
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab} // Triming transition on tab change
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {filteredItems.length === 0 ? (
                        <div className={styles.emptyState}>
                            {activeTab === 'prescription' ? <Prescription size={48} weight="duotone" /> : <Flask size={48} weight="duotone" />}
                            <h3>{activeTab === 'prescription' ? 'No prescriptions found' : 'No test orders found'}</h3>
                            <p>{activeTab === 'prescription' ? 'Prescriptions from your doctor will appear here.' : 'Test orders and reports will appear here.'}</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={styles.card}
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <div className={styles.cardHeader}>
                                        <div className={`${styles.iconBox} ${item.event_type === 'PRESCRIPTION' ? styles.rxIcon : styles.testIcon}`}>
                                            {item.event_type === 'PRESCRIPTION' ? <Prescription size={24} /> : <Flask size={24} />}
                                        </div>
                                        <span className={styles.date}>
                                            {format(new Date(item.event_date), 'dd MMM, yyyy')}
                                        </span>
                                    </div>

                                    <h3 className={styles.cardTitle}>{item.title}</h3>

                                    <div className={styles.doctorInfo}>
                                        <User size={16} weight="fill" />
                                        <span>Dr. {item.uploader?.full_name || 'Unknown'}</span>
                                    </div>

                                    <div className={styles.footer}>
                                        {/* AI Analysis Status / Button */}
                                        {item.ai_details ? (
                                            <div className={styles.aiBadge}>
                                                <CheckCircle size={16} weight="fill" />
                                                <span>AI Analyzed</span>
                                            </div>
                                        ) : (
                                            <button
                                                className={styles.analyzeBtn}
                                                onClick={(e) => handleAnalyze(e, item)}
                                                disabled={!!analyzingId}
                                            >
                                                {analyzingId === item.id ? (
                                                    <Clock size={16} className={styles.spin} />
                                                ) : (
                                                    <Robot size={16} weight="fill" />
                                                )}
                                                {analyzingId === item.id ? 'Analyzing...' : 'Analyze'}
                                            </button>
                                        )}

                                        <button className={styles.viewBtn}>
                                            View <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Reuse the EventDetailsModal for Viewing & AI Results */}
            {selectedItem && (
                <EventDetailsModal
                    event={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
}