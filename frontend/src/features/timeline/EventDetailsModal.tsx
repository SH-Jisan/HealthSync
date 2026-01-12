import { useState, useRef } from 'react';
import {
    X, Printer, Calendar, User, FileText, Image as ImageIcon,
    DownloadSimple, Pill, Heartbeat, Thermometer, Drop, Eye, WarningCircle
} from 'phosphor-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabaseClient';

interface EventDetailsProps {
    event: any;
    onClose: () => void;
}

export default function EventDetailsModal({ event, onClose }: EventDetailsProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'medicines' | 'analysis' | 'file'>('overview');
    const printRef = useRef<HTMLDivElement>(null);

    // Construct Image URL
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
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                background: 'white', width: '100%', maxWidth: '950px', height: '90vh',
                borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>

                {/* Header */}
                <div style={{
                    padding: '1.5rem', borderBottom: '1px solid #eee',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#fff'
                }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{
                            width: '50px', height: '50px', borderRadius: '12px',
                            background: event.event_type === 'PRESCRIPTION' ? '#EFF6FF' : '#F0FDF4',
                            color: event.event_type === 'PRESCRIPTION' ? '#1D4ED8' : '#15803D',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {event.event_type === 'PRESCRIPTION' ? <FileText size={28} /> : <Heartbeat size={28} />}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1E293B' }}>{event.title}</h2>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#64748B', marginTop: '4px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={16} /> {format(new Date(event.event_date), 'dd MMM yyyy')}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={16} /> Dr. {event.uploader?.full_name || 'System/Self'}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleDownload} title="Download File" style={iconBtnStyle}><DownloadSimple size={20} /></button>
                        <button onClick={handlePrint} title="Print" style={iconBtnStyle}><Printer size={20} /></button>
                        <button onClick={onClose} title="Close" style={{ ...iconBtnStyle, background: '#FEE2E2', color: '#DC2626', border: 'none' }}><X size={20} /></button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', padding: '0 1.5rem', borderBottom: '1px solid #eee', gap: '2rem' }}>
                    {['overview', 'medicines', 'analysis', 'file'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            style={{
                                padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '1rem', fontWeight: 600, textTransform: 'capitalize',
                                color: activeTab === tab ? 'var(--primary)' : '#64748B',
                                borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#F8FAFC' }} ref={printRef}>

                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                            {/* Vitals Cards (Dynamic Data Check) */}
                            {/* Note: If backend doesn't provide vitals, we show N/A */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                <VitalCard icon={<Drop size={24} weight="fill" />} label="Blood Pressure" value={event.vitals?.bp || 'N/A'} unit={event.vitals?.bp ? 'mmHg' : ''} color="#EF4444" bg="#FEE2E2" />
                                <VitalCard icon={<Heartbeat size={24} weight="fill" />} label="Heart Rate" value={event.vitals?.hr || 'N/A'} unit={event.vitals?.hr ? 'bpm' : ''} color="#EC4899" bg="#FCE7F3" />
                                <VitalCard icon={<Thermometer size={24} weight="fill" />} label="Temperature" value={event.vitals?.temp || 'N/A'} unit={event.vitals?.temp ? '°F' : ''} color="#F59E0B" bg="#FEF3C7" />
                                <VitalCard icon={<Eye size={24} weight="fill" />} label="Weight" value={event.vitals?.weight || 'N/A'} unit={event.vitals?.weight ? 'kg' : ''} color="#10B981" bg="#D1FAE5" />
                            </div>

                            {/* Summary Section */}
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
                                <h3 style={{ marginTop: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={24} color="var(--primary)" /> Medical Summary
                                </h3>
                                <p style={{ lineHeight: '1.7', color: '#475569', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                                    {event.summary || 'No summary available provided by the doctor or AI.'}
                                </p>

                                {/* Key Tags */}
                                {event.key_findings && event.key_findings.length > 0 && (
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                                        {event.key_findings.map((tag: string, i: number) => (
                                            <span key={i} style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 500 }}>
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
                        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                            {/* Check if medicines array exists, else show Key Findings as list, else Empty */}
                            {event.medicines && event.medicines.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                    <tr style={{ background: '#F1F5F9', textAlign: 'left' }}>
                                        <th style={{ padding: '15px', color: '#475569' }}>Medicine Name</th>
                                        <th style={{ padding: '15px', color: '#475569' }}>Dosage</th>
                                        <th style={{ padding: '15px', color: '#475569' }}>Duration</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {event.medicines.map((med: any, idx: number) => (
                                        <tr key={idx}>
                                            <td style={tdStyle}><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Pill color="var(--primary)" /> {med.name}</div></td>
                                            <td style={tdStyle}>{med.dosage || '-'}</td>
                                            <td style={tdStyle}>{med.duration || '-'}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center' }}>
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

                    {/* TAB: ANALYSIS (OCR) */}
                    {activeTab === 'analysis' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                <h3 style={{ marginTop: 0 }}>Raw Text Extraction (OCR)</h3>

                                {/* Information Note */}
                                <div style={{ background: '#FFF7ED', borderLeft: '4px solid #F97316', padding: '10px', fontSize: '0.9rem', color: '#C2410C', marginBottom: '15px' }}>
                                    <WarningCircle size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                    Note: This text is automatically extracted from the image. It may contain multi-language text (English/Arabic) or formatting errors depending on the document source.
                                </div>

                                <div style={{
                                    background: '#1E293B', color: '#E2E8F0', padding: '1.5rem', borderRadius: '12px',
                                    fontFamily: 'monospace', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.9rem',
                                    overflowX: 'auto', direction: 'ltr' // Enforce LTR to prevent Arabic from messing up layout
                                }}>
                                    {event.extracted_text || 'No text extracted from the document.'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: FILE (Image) */}
                    {activeTab === 'file' && (
                        <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000000' }}>
                            {event.attachments && event.attachments.length > 0 ? (
                                <img
                                    src={getImageUrl(event.attachments[0])!}
                                    alt="Document"
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
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
const VitalCard = ({ icon, label, value, unit, color, bg }: any) => (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            {icon}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: value === 'N/A' ? '#CBD5E1' : '#1E293B' }}>
            {value} <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 'normal' }}>{unit}</span>
        </div>
        <div style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '5px' }}>{label}</div>
    </div>
);

const iconBtnStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '40px', height: '40px', background: 'white', border: '1px solid #E2E8F0',
    borderRadius: '8px', cursor: 'pointer', color: '#475569'
};

const tdStyle = { padding: '15px', borderBottom: '1px solid #F1F5F9', color: '#334155' };