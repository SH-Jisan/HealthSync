import { useRef } from 'react';
import { X, Printer, FileText } from 'phosphor-react';
import { format } from 'date-fns';
//import { useTranslation } from 'react-i18next';

interface PrescriptionProps {
    data: any;
    onClose: () => void;
}

export default function PrescriptionModal({ data, onClose }: PrescriptionProps) {
    //const { t } = useTranslation();
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current?.innerHTML;
        const originalContent = document.body.innerHTML;

        if (printContent) {
            document.body.innerHTML = printContent;
            window.print();
            document.body.innerHTML = originalContent;
            window.location.reload(); // To restore event listeners
        }
    };

    if (!data) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'white', width: '100%', maxWidth: '700px', height: '90vh',
                borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>

                {/* Modal Header */}
                <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={24} color="var(--primary)" /> Digital Prescription
                    </h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handlePrint}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px',
                                background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
                            }}
                        >
                            <Printer size={18} /> Print / Save PDF
                        </button>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Printable Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#f9fafb' }}>
                    <div ref={printRef} style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minHeight: '100%' }}>

                        {/* Header */}
                        <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h1 style={{ margin: '0 0 5px 0', color: 'var(--primary)', fontSize: '1.8rem' }}>HealthSync</h1>
                                <p style={{ margin: 0, color: 'gray', fontSize: '0.9rem' }}>Smart Healthcare Solution</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ margin: '0 0 5px 0' }}>Dr. {data.uploader?.full_name || 'Unknown Doctor'}</h2>
                                <p style={{ margin: 0, color: 'gray' }}>{data.uploader?.specialty || 'General Physician'}</p>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>Date: {format(new Date(data.event_date), 'dd MMM yyyy')}</p>
                            </div>
                        </div>

                        {/* Patient Info */}
                        <div style={{ marginBottom: '30px', padding: '15px', background: '#F8FAFC', borderRadius: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                                <div><strong>Patient Name:</strong> {data.profiles?.full_name || 'N/A'}</div>
                                <div><strong>Age/Gender:</strong> {data.profiles?.age || 'N/A'} / {data.profiles?.gender || 'N/A'}</div>
                                <div><strong>Phone:</strong> {data.profiles?.phone || 'N/A'}</div>
                                <div><strong>ID:</strong> #{data.patient_id.slice(0, 8)}</div>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Rx (Prescription)</h3>

                            {/* Medicines / Tests List */}
                            <div style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                                {/* Assuming summary contains text or key_findings contains array */}
                                {data.key_findings && Array.isArray(data.key_findings) && data.key_findings.length > 0 ? (
                                    <ul style={{ paddingLeft: '20px' }}>
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
                            <div style={{ marginTop: '20px' }}>
                                <h4 style={{ margin: '0 0 10px 0' }}>Advice / Notes:</h4>
                                <p style={{ background: '#FFF7ED', padding: '15px', borderRadius: '8px', borderLeft: '4px solid orange' }}>
                                    {data.summary}
                                </p>
                            </div>
                        )}

                        {/* Signature Area */}
                        <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ textAlign: 'center', width: '200px' }}>
                                <div style={{ borderBottom: '1px solid black', marginBottom: '5px' }}></div>
                                <p style={{ margin: 0 }}>Signature</p>
                            </div>
                        </div>

                        {/* Print Footer */}
                        <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '0.8rem', color: '#ccc' }}>
                            Generated by HealthSync AI • www.healthsync.com
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}