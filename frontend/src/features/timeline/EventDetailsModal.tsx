// File: HealthSync/web/src/features/timeline/EventDetailsModal.tsx

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import {
    X, Printer, Calendar, User, FileText, Image as ImageIcon,
    DownloadSimple, Heartbeat, Thermometer, Drop, Eye, CheckCircle, FirstAid, WarningCircle
} from 'phosphor-react';
import { format, isValid } from 'date-fns';
import { supabase } from '@/shared/lib/supabaseClient';
import type { MedicalEvent } from '../../types';
import ErrorBoundary from '../../components/ErrorBoundary';
import styles from './styles/EventDetailsModal.module.css';
import DiseaseInsight from './components/DiseaseInsight'; // [NEW]
import MedicineTable from './components/MedicineTable';   // [NEW]

// Lazy load the printable view to save initial bundle/DOM size
const PrintablePrescription = React.lazy(() => import('./components/PrintablePrescription'));

interface EventDetailsProps {
    event: MedicalEvent;
    onClose: () => void;
}

const safeFormat = (dateString: string | undefined, dateFormat: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isValid(date) ? format(date, dateFormat) : 'Invalid Date';
};

// Extracted VitalCard to prevent re-creation
const VitalCard = React.memo(({ icon, label, value, unit, color, bg }: any) => (
    <div className={styles.vitalCard}>
        <div className={styles.vitalIcon} style={{ background: bg, color: color }}>
            {icon}
        </div>
        <div className={styles.vitalValue}>
            {value} <span className={styles.vitalUnit}>{unit}</span>
        </div>
        <div className={styles.vitalLabel}>{label}</div>
    </div>
));

const EventDetailsModal = React.forwardRef<HTMLDivElement, EventDetailsProps>(function EventDetailsModal(
    { event, onClose },
    ref
) {
    // 1. Language Setup
    const { i18n } = useTranslation();
    const isBangla = i18n.language === 'bn';

    // 2. Tab Setup
    const [activeTab, setActiveTab] = useState<'overview' | 'medicines' | 'analysis' | 'file' | 'prescription'>(
        event.event_type === 'PRESCRIPTION' ? 'prescription' : 'overview'
    );
    const [isPrinting, setIsPrinting] = useState(false);

    // 3. AI Data Extraction
    const aiData = event.ai_details;

    // Dynamic Content based on Language
    const simpleExplanation = isBangla
        ? aiData?.simple_explanation_bn
        : aiData?.simple_explanation_en;

    const detailedAnalysis = isBangla
        ? aiData?.detailed_analysis_bn
        : aiData?.detailed_analysis_en;

    // [NEW] Disease Insight Data
    const diseaseInsight = isBangla
        ? aiData?.disease_insight_bn
        : aiData?.disease_insight_en;

    const safetyStatus = aiData?.medicine_safety_check || 'N/A';

    // Helper to normalize path/url
    const getStoragePath = (urlOrPath: string) => {
        if (!urlOrPath) return '';
        if (urlOrPath.startsWith('http')) {
            // Try to extract path from Supabase URL
            const matches = urlOrPath.split('/reports/');
            if (matches.length > 1) return matches[1];
            // Fallback for other URL structures if needed, or return as is if implementation changes
            return urlOrPath;
        }
        return urlOrPath;
    };

    const getImageUrl = (path: string) => {
        if (!path) return null;
        if (path.startsWith('http')) return path; // Already a URL
        const { data } = supabase.storage.from('reports').getPublicUrl(path);
        return data.publicUrl;
    };

    const handlePrint = () => {
        setIsPrinting(true);
    };

    // Handle printing effect
    useEffect(() => {
        if (isPrinting) {
            // Small delay to ensure render
            const timer = setTimeout(() => {
                window.print();
                setIsPrinting(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isPrinting]);

    const handleDownload = async () => {
        if (event.attachment_urls && event.attachment_urls.length > 0) {
            try {
                const urlOrPath = event.attachment_urls[0];
                const path = getStoragePath(urlOrPath);

                console.log('Downloading file from path:', path);

                const { data, error } = await supabase.storage
                    .from('reports')
                    .download(path);

                if (error) throw error;

                if (data) {
                    // Create a blob URL and force download
                    const url = window.URL.createObjectURL(data);
                    const a = document.createElement('a');
                    a.href = url;

                    // Determine file extension
                    const ext = path.split('.').pop() || 'jpg';
                    a.download = `HealthSync_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.${ext}`;

                    document.body.appendChild(a);
                    a.click();

                    // Cleanup
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }
            } catch (err) {
                console.error('Download failed:', err);
                alert('Failed to download file. Please try again.');
            }
        }
    };

    // Tab Logic
    const tabs = ['overview', 'medicines', 'analysis', 'file'];
    if (event.event_type === 'PRESCRIPTION') {
        tabs.unshift('prescription');
    }

    // Optimization: Memoize render-heavy parts
    const memoizedMarkdown = React.useMemo(() => (
        <ReactMarkdown>{detailedAnalysis || ''}</ReactMarkdown>
    ), [detailedAnalysis]);

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
                <ErrorBoundary>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerInfo}>
                            <div className={`${styles.iconBox} ${event.event_type === 'PRESCRIPTION' ? styles.prescriptionIcon : styles.reportIcon}`}>
                                {event.event_type === 'PRESCRIPTION' ? <FileText size={28} /> : <Heartbeat size={28} />}
                            </div>
                            <div>
                                <h2 className={styles.title}>{event.title}</h2>
                                <div className={styles.meta}>
                                    <span className={styles.metaItem}><Calendar size={16} /> {safeFormat(event.event_date, 'dd MMM yyyy')}</span>
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
                                {/* Simple Tab Localization */}
                                {tab === 'analysis' ? (isBangla ? 'বিশ্লেষণ (AI)' : 'AI Analysis') :
                                    tab === 'overview' ? (isBangla ? 'ওভারভিউ' : 'Overview') :
                                        tab === 'medicines' ? (isBangla ? 'ঔষধ' : 'Medicines') :
                                            tab === 'file' ? (isBangla ? 'ফাইল' : 'File') :
                                                tab === 'prescription' ? (isBangla ? 'প্রেসক্রিপশন' : 'Prescription') :
                                                    tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className={styles.content}>

                        {/* TAB: PRESCRIPTION */}
                        {activeTab === 'prescription' && (
                            // Use the same component structure but inside the modal
                            // Since PrintablePrescription styles are mostly generic, we can reuse logic or just keep the inline code if extracted
                            // Actually, for consistency with 'Print', maybe we should use the PrintablePrescription *component* here too?
                            // But PrintablePrescription has 'printOnly' class.
                            // Let's keep the inline implementation but use extracted helpers where possible.
                            <div className={styles.prescriptionView}>
                                <div className={styles.prescriptionHeader}>
                                    <div className={styles.brand}>
                                        <h1>HealthSync</h1>
                                        <p>Smart Healthcare Solution</p>
                                    </div>
                                    <div className={styles.docInfo}>
                                        <h3>Dr. {event.uploader?.full_name}</h3>
                                        <p>{event.uploader?.specialty}</p>
                                        <p>{safeFormat(event.event_date, 'dd MMM yyyy')}</p>
                                    </div>
                                </div>

                                <div className={styles.patientBar}>
                                    <span><strong>Patient:</strong> {event.profiles?.full_name}</span>
                                    <span><strong>Phone:</strong> {event.profiles?.phone}</span>
                                </div>

                                <div className={styles.rxSection}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h2>Rx</h2>
                                        {/* Use the safe/caution badge logic */}
                                        {safetyStatus === 'Safe' && <span className={`${styles.safetyBadge} ${styles.safe}`}><CheckCircle size={16} weight="fill" /> Safe</span>}
                                        {safetyStatus === 'Caution' && <span className={`${styles.safetyBadge} ${styles.caution}`}><WarningCircle size={16} weight="fill" /> Caution</span>}
                                        {safetyStatus === 'Danger' && <span className={`${styles.safetyBadge} ${styles.danger}`}><WarningCircle size={16} weight="fill" /> Danger</span>}
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

                                {/* Show AI Summary on Prescription if available */}
                                {simpleExplanation && (
                                    <div className={styles.adviceBox}>
                                        <h4>AI Explanation:</h4>
                                        <p>{simpleExplanation}</p>
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
                                {/* Vitals */}
                                {(event.vitals?.bp || event.vitals?.hr || event.vitals?.temp || event.vitals?.weight) && (
                                    <div className={styles.vitalsGrid}>
                                        <VitalCard icon={<Drop size={24} weight="fill" />} label="Blood Pressure" value={event.vitals?.bp || 'N/A'} unit={event.vitals?.bp ? 'mmHg' : ''} color="#EF4444" bg="#FEE2E2" />
                                        <VitalCard icon={<Heartbeat size={24} weight="fill" />} label="Heart Rate" value={event.vitals?.hr || 'N/A'} unit={event.vitals?.hr ? 'bpm' : ''} color="#EC4899" bg="#FCE7F3" />
                                        <VitalCard icon={<Thermometer size={24} weight="fill" />} label="Temperature" value={event.vitals?.temp || 'N/A'} unit={event.vitals?.temp ? '°F' : ''} color="#F59E0B" bg="#FEF3C7" />
                                        <VitalCard icon={<Eye size={24} weight="fill" />} label="Weight" value={event.vitals?.weight || 'N/A'} unit={event.vitals?.weight ? 'kg' : ''} color="#10B981" bg="#D1FAE5" />
                                    </div>
                                )}

                                {/* --- AI SIMPLE EXPLANATION --- */}
                                {aiData ? (
                                    <div className={styles.simpleCard}>
                                        <div className={styles.simpleCardHeader}>
                                            <Drop size={32} color="#059669" weight="fill" /> {/* Placeholder icon if Robot not imported used previously */}
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
                                    <div className={styles.findingTags} style={{ marginTop: '1rem', justifyContent: 'center' }}>
                                        {event.key_findings.map((tag: string, i: number) => (
                                            <span key={i} className={styles.tag}>#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: MEDICINES */}
                        {activeTab === 'medicines' && (
                            <MedicineTable medicines={event.medicines} />
                        )}

                        {/* TAB: ANALYSIS (Enhanced with Disease Insight) */}
                        {activeTab === 'analysis' && (
                            <div className={styles.innerContent}>
                                {aiData ? (
                                    <>
                                        {/* 1. Simple Summary Refresher */}
                                        <div className={styles.simpleCard} style={{ background: '#F0F9FF', borderColor: '#BAE6FD' }}>
                                            <div className={styles.simpleCardHeader}>
                                                <CheckCircle size={24} color="#0284C7" weight="fill" />
                                                <h3 className={styles.simpleCardTitle} style={{ color: '#0369A1' }}>
                                                    {isBangla ? 'এক নজরে' : 'Overview'}
                                                </h3>
                                            </div>
                                            <p style={{ margin: 0, color: '#075985' }}>{simpleExplanation}</p>
                                        </div>

                                        {/* 2. [NEW] Disease / Condition Insight Card */}
                                        {diseaseInsight && (
                                            <div className={styles.diseaseCard}>
                                                <div className={styles.diseaseCardHeader}>
                                                    <FirstAid size={24} color="#4338ca" weight="fill" />
                                                    <h3 className={styles.diseaseCardTitle}>
                                                        {isBangla ? 'সম্ভাব্য রোগ ও অবস্থা' : 'Condition Insight'}
                                                    </h3>
                                                </div>
                                                <DiseaseInsight insight={diseaseInsight} />
                                            </div>
                                        )}

                                        {/* 3. Detailed Markdown Analysis */}
                                        <div className={styles.detailedSection}>
                                            <div className={styles.detailHeader}>
                                                <FileText size={24} color="var(--primary)" />
                                                <h3 className={styles.detailTitle}>
                                                    {isBangla ? 'বিস্তারিত রিপোর্ট বিশ্লেষণ' : 'Detailed Report Analysis'}
                                                </h3>
                                            </div>
                                            <div className={styles.markdownContent}>
                                                {memoizedMarkdown}
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
                                    (() => {
                                        const url = getImageUrl(event.attachment_urls[0]);
                                        if (!url) return null;

                                        const isPdf = url.toLowerCase().includes('.pdf') ||
                                            event.attachment_urls[0].toLowerCase().endsWith('.pdf');

                                        if (isPdf) {
                                            return (
                                                <iframe
                                                    src={`${url}#toolbar=0`}
                                                    title="PDF Document"
                                                    className={styles.attachmentImg} // Reusing class for size/fit
                                                    style={{ height: '500px', border: 'none', width: '100%' }}
                                                />
                                            );
                                        }

                                        return (
                                            <img
                                                src={url}
                                                alt="Document"
                                                className={styles.attachmentImg}
                                            />
                                        );
                                    })()
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                                        <ImageIcon size={64} />
                                        <p>No attachment found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ErrorBoundary>
            </motion.div>

            {/* Print Only Section - Lazy Loaded and only mounted when printing */}
            {isPrinting && (
                <Suspense fallback={null}>
                    <PrintablePrescription
                        event={event}
                        simpleExplanation={simpleExplanation}
                        diseaseInsight={diseaseInsight}
                        safetyStatus={safetyStatus}
                    />
                </Suspense>
            )}
        </motion.div>
    );
});

// Memoize the entire modal to prevent re-renders from parent if props haven't changed
export default React.memo(EventDetailsModal);
