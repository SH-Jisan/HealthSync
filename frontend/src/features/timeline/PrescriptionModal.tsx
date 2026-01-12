import { useRef } from 'react';
import { X, Printer, FileText } from 'phosphor-react';
import { format } from 'date-fns';
import styles from './styles/PrescriptionModal.module.css';

interface PrescriptionData {
    id: string;
    event_date: string;
    patient_id: string;
    uploader?: { full_name?: string; specialty?: string };
    profiles?: { full_name?: string; age?: string | number; gender?: string; phone?: string };
    key_findings?: string[];
    summary?: string;
    extracted_text?: string;
}

interface PrescriptionProps {
    data: PrescriptionData;
    onClose: () => void;
}

export default function PrescriptionModal({ data, onClose }: PrescriptionProps) {
    const printRef = useRef<HTMLDivElement>(null);

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

    if (!data) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modalContainer}>

                {/* Modal Header */}
                <div className={styles.header}>
                    <h3 className={styles.titleGroup}>
                        <FileText size={24} color="var(--primary)" /> Digital Prescription
                    </h3>
                    <div className={styles.headerActions}>
                        <button onClick={handlePrint} className={styles.printBtn}>
                            <Printer size={18} /> Print / Save PDF
                        </button>
                        <button onClick={onClose} className={styles.closeBtn}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Printable Area */}
                <div className={styles.scrollArea}>
                    <div ref={printRef} className={styles.printPaper}>

                        {/* Header */}
                        <div className={styles.brandHeader}>
                            <div>
                                <h1 className={styles.brandTitle}>HealthSync</h1>
                                <p className={styles.brandSubtitle}>Smart Healthcare Solution</p>
                            </div>
                            <div className={styles.doctorInfo} style={{ textAlign: 'right' }}>
                                <h2>Dr. {data.uploader?.full_name || 'Unknown Doctor'}</h2>
                                <p>{data.uploader?.specialty || 'General Physician'}</p>
                                <p style={{ fontSize: '0.9rem' }}>Date: {format(new Date(data.event_date), 'dd MMM yyyy')}</p>
                            </div>
                        </div>

                        {/* Patient Info */}
                        <div className={styles.patientInfoCard}>
                            <div className={styles.patientGrid}>
                                <div><strong>Patient Name:</strong> {data.profiles?.full_name || 'N/A'}</div>
                                <div><strong>Age/Gender:</strong> {data.profiles?.age || 'N/A'} / {data.profiles?.gender || 'N/A'}</div>
                                <div><strong>Phone:</strong> {data.profiles?.phone || 'N/A'}</div>
                                <div><strong>ID:</strong> #{data.patient_id.slice(0, 8)}</div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className={styles.rxSection}>
                            <h3 className={styles.rxTitle}>Rx (Prescription)</h3>

                            <div className={styles.rxContent}>
                                {data.key_findings && Array.isArray(data.key_findings) && data.key_findings.length > 0 ? (
                                    <ul className={styles.rxList}>
                                        {data.key_findings.map((item: string, i: number) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{data.summary || data.extracted_text}</div>
                                )}
                            </div>
                        </div>

                        {/* Footer / Advice */}
                        {data.summary && (
                            <div className={styles.adviceSection}>
                                <h4 className={styles.adviceTitle}>Advice / Notes:</h4>
                                <p className={styles.adviceBox}>
                                    {data.summary}
                                </p>
                            </div>
                        )}

                        {/* Signature Area */}
                        <div className={styles.signatureArea}>
                            <div className={styles.signatureLine}>
                                <div className={styles.line}></div>
                                <p style={{ margin: 0 }}>Signature</p>
                            </div>
                        </div>

                        {/* Print Footer */}
                        <div className={styles.printFooter}>
                            Generated by HealthSync AI • www.healthsync.com
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}