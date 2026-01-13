// File: HealthSync/web/src/features/timeline/EventDetailsModal.tsx

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import {
    X, Printer, Calendar, User, FileText, Image as ImageIcon,
    DownloadSimple, Pill, Heartbeat, Thermometer, Drop, Eye, WarningCircle,
    Robot, CheckCircle, Warning, ShieldCheck
} from 'phosphor-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabaseClient';
import type { MedicalEvent } from '../../types';
import styles from './styles/EventDetailsModal.module.css';

interface EventDetailsProps {
    event: MedicalEvent;
    onClose: () => void;
}

export default React.forwardRef(function EventDetailsModal(
    { event, onClose }: EventDetailsProps,
    ref: React.Ref<HTMLDivElement>
) {
    // 1. Language Setup
    const { t, i18n } = useTranslation();
    const isBangla = i18n.language === 'bn';

    // 2. Tab Setup
    const [activeTab, setActiveTab] = useState<'overview' | 'medicines' | 'analysis' | 'file' | 'prescription'>(
        event.event_type === 'PRESCRIPTION' ? 'prescription' : 'overview'
    );
    const printRef = useRef<HTMLDivElement>(null);

    // 3. AI Data Extraction
    const aiData = event.ai_details;

    // Dynamic Content based on Language
    const simpleExplanation = isBangla
        ? aiData?.simple_explanation_bn
        : aiData?.simple_explanation_en;

    const detailedAnalysis = isBangla
        ? aiData?.detailed_analysis_bn
        : aiData?.detailed_analysis_en;

    const safetyStatus = aiData?.medicine_safety_check || 'N/A';

    const getImageUrl = (path: string) => {
        if (!path) return null;
        const { data } = supabase.storage.from('medical-reports').getPublicUrl(path);
        return data.publicUrl;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        if (event.attachment_urls && event.attachment_urls.length > 0) {
            const path = event.attachment_urls[0];
            const { data } = supabase.storage.from('medical-reports').getPublicUrl(path);
            const url = data.publicUrl;
            if (url) {
                const a = document.createElement('a');
                a.href = url;
                a.download = `HealthSync_Report_${event.id}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        }
    };

    // Tab Logic
    const tabs = ['overview', 'medicines', 'analysis', 'file'];
    if (event.event_type === 'PRESCRIPTION') {
        tabs.unshift('prescription');
    }

    // Helper for Safety Badge
    const getSafetyBadge = (status: string) => {
        if (status === 'Safe') return <span className={`${styles.safetyBadge} ${styles.safe}`}><ShieldCheck size={16} weight="fill"/> Safe</span>;
        if (status === 'Caution') return <span className={`${styles.safetyBadge} ${styles.caution}`}><Warning size={16} weight="fill"/> Caution</span>;
        if (status === 'Danger') return <span className={`${styles.safetyBadge} ${styles.danger}`}><WarningCircle size={16} weight="fill"/> Danger</span>;
        return null;
    };

    return (
        <motion.div
            ref={ref}
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className={styles.modal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            >
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerInfo}>
                        <div className={`${styles.iconBox} ${event.event_type === 'PRESCRIPTION' ? styles.prescriptionIcon : styles.reportIcon}`}>
                            {event.event_type === 'PRESCRIPTION' ? <FileText size={28} /> : <Heartbeat size={28} />}
                        </div>
                        <div>
                            <h2 className={styles.title}>{event.title}</h2>
                            <div className={styles.meta}>
                                <span className={styles.metaItem}><Calendar size={16} /> {format(new Date(event.event_date), 'dd MMM yyyy')}</span>
                                <span className={styles.metaItem}><User size={16} /> Dr. {event.uploader?.full_name || 'System/Self'}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button onClick={handleDownload} title="Download File" className={styles.iconBtn}><DownloadSimple size={20} /></button>
                        <button onClick={handlePrint} title="Print" className={styles.iconBtn}><Printer size={20} /></button>
                        <button onClick={onClose} title="Close" className={`${styles.iconBtn} ${styles.closeBtn}`}><X size={20} /></button>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`${styles.tabBtn} ${activeTab === tab ? styles.tabActive : ''}`}
                        >
                            {/* Tab Labels Translation can be added here */}
                            {tab === 'analysis' ? (isBangla ? 'বিশ্লেষণ (AI)' : 'AI Analysis') : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className={styles.content}>

                    {/* TAB: PRESCRIPTION */}
                    {activeTab === 'prescription' && (
                        <div className={styles.prescriptionView}>
                            <div className={styles.prescriptionHeader}>
                                <div className={styles.brand}>
                                    <h1>HealthSync</h1>
                                    <p>Smart Healthcare Solution</p>
                                </div>
                                <div className={styles.docInfo}>
                                    <h3>Dr. {event.uploader?.full_name}</h3>
                                    <p>{event.uploader?.specialty}</p>
                                    <p>{format(new Date(event.event_date), 'dd MMM yyyy')}</p>
                                </div>
                            </div>

                            <div className={styles.patientBar}>
                                <span><strong>Patient:</strong> {event.profiles?.full_name}</span>
                                <span><strong>Phone:</strong> {event.profiles?.phone}</span>
                            </div>

                            <div className={styles.rxSection}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <h2>Rx</h2>
                                    {/* Show Safety Badge if Available */}
                                    {getSafetyBadge(safetyStatus)}
                                </div>

                                <div className={styles.rxList}>
                                    {event.medicines && event.medicines.length > 0 ? (
                                        event.medicines.map((med, i) => (
                                            <div key={i} className={styles.medItem}>
                                                <strong>{med.name}</strong>
                                                <span>{med.dosage} — {med.duration}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>{event.summary || event.extracted_text}</p>
                                    )}
                                </div>
                            </div>

                            {event.summary && activeTab === 'prescription' && (
                                <div className={styles.adviceBox}>
                                    <h4>Advice:</h4>
                                    <p>{simpleExplanation || event.summary}</p>
                                </div>
                            )}

                            <div className={styles.signatureArea}>
                                <div className={styles.sigLine}></div>
                                <p>Doctor's Signature</p>
                            </div>
                        </div>
                    )}

                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className={styles.innerContent}>
                            {/* Only show Vitals if available */}
                            {(event.vitals?.bp || event.vitals?.hr || event.vitals?.temp || event.vitals?.weight) && (
                                <div className={styles.vitalsGrid}>
                                    <VitalCard icon={<Drop size={24} weight="fill" />} label="Blood Pressure" value={event.vitals?.bp || 'N/A'} unit={event.vitals?.bp ? 'mmHg' : ''} color="#EF4444" bg="#FEE2E2" />
                                    <VitalCard icon={<Heartbeat size={24} weight="fill" />} label="Heart Rate" value={event.vitals?.hr || 'N/A'} unit={event.vitals?.hr ? 'bpm' : ''} color="#EC4899" bg="#FCE7F3" />
                                    <VitalCard icon={<Thermometer size={24} weight="fill" />} label="Temperature" value={event.vitals?.temp || 'N/A'} unit={event.vitals?.temp ? '°F' : ''} color="#F59E0B" bg="#FEF3C7" />
                                    <VitalCard icon={<Eye size={24} weight="fill" />} label="Weight" value={event.vitals?.weight || 'N/A'} unit={event.vitals?.weight ? 'kg' : ''} color="#10B981" bg="#D1FAE5" />
                                </div>
                            )}

                            {/* --- AI SIMPLE EXPLANATION (New) --- */}
                            {aiData ? (
                                <div className={styles.simpleCard}>
                                    <div className={styles.simpleCardHeader}>
                                        <Robot size={32} color="#059669" weight="fill" />
                                        <div>
                                            <h3 className={styles.simpleCardTitle}>{isBangla ? 'সহজ ব্যাখ্যা' : 'Simple Explanation'}</h3>
                                            <p className={styles.simpleCardSubtitle}>{isBangla ? 'বাচ্চাদের মতো সহজ করে বুঝুন' : 'Easy to understand summary'}</p>
                                        </div>
                                    </div>
                                    <div className={styles.simpleText}>
                                        "{simpleExplanation}"
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.summarySection}>
                                    <h3 className={styles.sectionTitle}>
                                        <FileText size={24} color="var(--primary)" /> Medical Summary
                                    </h3>
                                    <p className={styles.summaryText}>
                                        {event.summary || 'No summary available provided by the doctor or AI.'}
                                    </p>
                                </div>
                            )}

                            {/* Key Findings Tags */}
                            {event.key_findings && event.key_findings.length > 0 && (
                                <div className={styles.findingTags} style={{marginTop: '1rem', justifyContent: 'center'}}>
                                    {event.key_findings.map((tag: string, i: number) => (
                                        <span key={i} className={styles.tag}>#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: MEDICINES */}
                    {activeTab === 'medicines' && (
                        <div className={`${styles.innerContent} ${styles.medicineTableWrapper}`}>
                            {event.medicines && event.medicines.length > 0 ? (
                                <table className={styles.medTable}>
                                    <thead>
                                    <tr>
                                        <th>Medicine Name</th>
                                        <th>Dosage</th>
                                        <th>Duration</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {event.medicines.map((med, idx) => (
                                        <tr key={idx}>
                                            <td><div className={styles.medName}><Pill color="var(--primary)" /> {med.name}</div></td>
                                            <td>{med.dosage || '-'}</td>
                                            <td>{med.duration || '-'}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className={styles.emptyState}>
                                    <div style={{ color: '#94A3B8' }}>
                                        <WarningCircle size={48} style={{ opacity: 0.5, marginBottom: '10px' }} />
                                        <p>No structured medicine data found.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: ANALYSIS (Enhanced) */}
                    {activeTab === 'analysis' && (
                        <div className={styles.innerContent}>
                            {aiData ? (
                                <>
                                    {/* 1. Simple Summary (Again for context) */}
                                    <div className={styles.simpleCard} style={{background: '#F0F9FF', borderColor: '#BAE6FD'}}>
                                        <div className={styles.simpleCardHeader}>
                                            <CheckCircle size={24} color="#0284C7" weight="fill" />
                                            <h3 className={styles.simpleCardTitle} style={{color:'#0369A1'}}>
                                                {isBangla ? 'এক নজরে' : 'Overview'}
                                            </h3>
                                        </div>
                                        <p style={{margin:0, color:'#075985'}}>{simpleExplanation}</p>
                                    </div>

                                    {/* 2. Detailed Markdown Analysis */}
                                    <div className={styles.detailedSection}>
                                        <div className={styles.detailHeader}>
                                            <FileText size={24} color="var(--primary)" />
                                            <h3 className={styles.detailTitle}>
                                                {isBangla ? 'বিস্তারিত রিপোর্ট বিশ্লেষণ' : 'Detailed Report Analysis'}
                                            </h3>
                                        </div>
                                        <div className={styles.markdownContent}>
                                            <ReactMarkdown>
                                                {detailedAnalysis || ''}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.analysisCard}>
                                    <h3 style={{ marginTop: 0 }}>Raw Text Extraction (OCR)</h3>
                                    <div className={styles.infoNote}>
                                        <WarningCircle size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                        Note: This text is automatically extracted from the image. It may contain multi-language text or errors.
                                    </div>
                                    <div className={styles.rawText}>
                                        {event.extracted_text || 'No text extracted from the document.'}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: FILE */}
                    {activeTab === 'file' && (
                        <div className={styles.fileContainer}>
                            {event.attachment_urls && event.attachment_urls.length > 0 ? (
                                <img
                                    src={getImageUrl(event.attachment_urls[0])!}
                                    alt="Document"
                                    className={styles.attachmentImg}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                                    <ImageIcon size={64} />
                                    <p>No attachment found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* PRINT-ONLY ELEMENT */}
            <div className={styles.printOnly} ref={printRef}>
                {/* Print layout code remains same */}
                <div className={styles.prescriptionView}>
                    <div className={styles.prescriptionHeader}>
                        <div className={styles.brand}>
                            <h1>HealthSync</h1>
                        </div>
                        <div className={styles.docInfo}>
                            <h3>Dr. {event.uploader?.full_name}</h3>
                            <p>{event.uploader?.specialty}</p>
                            <p>{format(new Date(event.event_date), 'dd MMM yyyy')}</p>
                        </div>
                    </div>
                    <div className={styles.patientBar}>
                        <span><strong>Patient:</strong> {event.profiles?.full_name}</span>
                        <span><strong>Phone:</strong> {event.profiles?.phone}</span>
                    </div>

                    <div className={styles.adviceBox}>
                        <h4>AI Summary:</h4>
                        <p>{simpleExplanation || event.summary}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

// Helper Components
interface VitalCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    unit: string;
    color: string;
    bg: string;
}
const VitalCard = ({ icon, label, value, unit, color, bg }: VitalCardProps) => (
    <div className={styles.vitalCard}>
        <div className={styles.vitalIcon} style={{ background: bg, color: color }}>
            {icon}
        </div>
        <div className={styles.vitalValue}>
            {value} <span className={styles.vitalUnit}>{unit}</span>
        </div>
        <div className={styles.vitalLabel}>{label}</div>
    </div>
);