import React, { useState, useRef } from 'react';
import {
    X, Printer, Calendar, User, FileText, Image as ImageIcon,
    DownloadSimple, Pill, Heartbeat, Thermometer, Drop, Eye, WarningCircle
} from 'phosphor-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabaseClient';
import styles from './EventDetailsModal.module.css';

interface Medicine {
    name: string;
    dosage?: string;
    duration?: string;
}

interface MedicalEvent {
    id: string;
    event_type: string;
    title: string;
    event_date: string;
    summary?: string;
    uploader?: { full_name?: string };
    vitals?: {
        bp?: string;
        hr?: string;
        temp?: string;
        weight?: string;
    };
    key_findings?: string[];
    medicines?: Medicine[];
    extracted_text?: string;
    attachments?: string[];
}

interface EventDetailsProps {
    event: MedicalEvent;
    onClose: () => void;
}

export default function EventDetailsModal({ event, onClose }: EventDetailsProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'medicines' | 'analysis' | 'file'>('overview');
    const printRef = useRef<HTMLDivElement>(null);

    const getImageUrl = (path: string) => {
        if (!path) return null;
        const { data } = supabase.storage.from('medical-reports').getPublicUrl(path);
        return data.publicUrl;
    };

    const handlePrint = () => {
        const printContent = printRef.current?.innerHTML;
        const originalContent = document.body.innerHTML;
        if (printContent) {
            document.body.innerHTML = printContent;
            window.print();
            document.body.innerHTML = originalContent;
            window.location.reload();
        }
    };

    const handleDownload = async () => {
        if (event.attachments && event.attachments.length > 0) {
            const url = getImageUrl(event.attachments[0]);
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

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

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
                    {['overview', 'medicines', 'analysis', 'file'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`${styles.tabBtn} ${activeTab === tab ? styles.tabActive : ''}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className={styles.content} ref={printRef}>

                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className={styles.innerContent}>
                            <div className={styles.vitalsGrid}>
                                <VitalCard icon={<Drop size={24} weight="fill" />} label="Blood Pressure" value={event.vitals?.bp || 'N/A'} unit={event.vitals?.bp ? 'mmHg' : ''} color="#EF4444" bg="#FEE2E2" />
                                <VitalCard icon={<Heartbeat size={24} weight="fill" />} label="Heart Rate" value={event.vitals?.hr || 'N/A'} unit={event.vitals?.hr ? 'bpm' : ''} color="#EC4899" bg="#FCE7F3" />
                                <VitalCard icon={<Thermometer size={24} weight="fill" />} label="Temperature" value={event.vitals?.temp || 'N/A'} unit={event.vitals?.temp ? '°F' : ''} color="#F59E0B" bg="#FEF3C7" />
                                <VitalCard icon={<Eye size={24} weight="fill" />} label="Weight" value={event.vitals?.weight || 'N/A'} unit={event.vitals?.weight ? 'kg' : ''} color="#10B981" bg="#D1FAE5" />
                            </div>

                            <div className={styles.summarySection}>
                                <h3 className={styles.sectionTitle}>
                                    <FileText size={24} color="var(--primary)" /> Medical Summary
                                </h3>
                                <p className={styles.summaryText}>
                                    {event.summary || 'No summary available provided by the doctor or AI.'}
                                </p>

                                {event.key_findings && event.key_findings.length > 0 && (
                                    <div className={styles.findingTags}>
                                        {event.key_findings.map((tag: string, i: number) => (
                                            <span key={i} className={styles.tag}>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
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
                                    {event.key_findings && event.key_findings.length > 0 ? (
                                        <div style={{ textAlign: 'left' }}>
                                            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>Extracted Medicines / Items:</h4>
                                            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                                                {event.key_findings.map((item: string, i: number) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '1rem' }}>* Data extracted from OCR. Please verify with the original image.</p>
                                        </div>
                                    ) : (
                                        <div style={{ color: '#94A3B8' }}>
                                            <WarningCircle size={48} style={{ opacity: 0.5, marginBottom: '10px' }} />
                                            <p>No structured medicine data found.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: ANALYSIS */}
                    {activeTab === 'analysis' && (
                        <div className={styles.innerContent}>
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
                        </div>
                    )}

                    {/* TAB: FILE */}
                    {activeTab === 'file' && (
                        <div className={styles.fileContainer}>
                            {event.attachments && event.attachments.length > 0 ? (
                                <img
                                    src={getImageUrl(event.attachments[0])!}
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
            </div>
        </div>
    );
}

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