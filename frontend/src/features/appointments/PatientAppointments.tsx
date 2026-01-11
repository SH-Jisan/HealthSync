import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
    Calendar, Clock, MapPin, CheckCircle, XCircle, Hourglass,
    Prescription, TestTube, Buildings, FileText
} from 'phosphor-react';
import { format } from 'date-fns';

// Types
interface Appointment {
    id: string;
    created_at: string;
    appointment_date: string;
    status: string;
    reason: string;
    doctor: { full_name: string; specialty: string };
    hospital?: { full_name: string; address: string }; // Added Hospital
}

interface Prescription {
    id: string;
    event_date: string;
    title: string;
    uploader: { full_name: string; specialty: string };
}

interface Diagnostic {
    id: string;
    created_at: string;
    report_status: string;
    provider: { full_name: string };
}

export default function PatientAppointments() {
    const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'diagnostic' | 'hospitals'>('appointments');
    const [loading, setLoading] = useState(true);

    // Data States
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);

    const fetchData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (activeTab === 'appointments') {
            const { data } = await supabase
                .from('appointments')
                .select('*, doctor:doctor_id(full_name, specialty), hospital:hospital_id(full_name, address)')
                .eq('patient_id', user.id)
                .order('appointment_date', { ascending: false });
            if (data) setAppointments(data as any);
        }
        else if (activeTab === 'prescriptions') {
            const { data } = await supabase
                .from('medical_events')
                .select('*, uploader:uploader_id(full_name, specialty)')
                .eq('patient_id', user.id)
                .eq('event_type', 'PRESCRIPTION')
                .order('event_date', { ascending: false });
            if (data) setPrescriptions(data as any);
        }
        else if (activeTab === 'diagnostic') {
            const { data } = await supabase
                .from('patient_payments')
                .select('*, provider:provider_id(full_name)')
                .eq('patient_id', user.id)
                .order('created_at', { ascending: false });
            if (data) setDiagnostics(data as any);
        }

        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, [activeTab]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return { bg: '#DCFCE7', text: '#166534', icon: <CheckCircle weight="fill" /> };
            case 'CANCELLED': return { bg: '#FEE2E2', text: '#991B1B', icon: <XCircle weight="fill" /> };
            default: return { bg: '#FEF3C7', text: '#92400E', icon: <Hourglass weight="fill" /> };
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>My Care History</h2>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
                {[
                    { id: 'appointments', label: 'Appointments', icon: <Calendar /> },
                    { id: 'prescriptions', label: 'Prescriptions', icon: <Prescription /> },
                    { id: 'diagnostic', label: 'Diagnostic', icon: <TestTube /> },
                    { id: 'hospitals', label: 'Hospitals', icon: <Buildings /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem 0.5rem',
                            background: 'none', border: 'none', cursor: 'pointer',
                            borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: activeTab === tab.id ? 600 : 500, whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : (
                <>
                    {/* Appointments Tab */}
                    {activeTab === 'appointments' && (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {appointments.length === 0 ? <EmptyState text="No appointments found." /> : appointments.map(app => {
                                const statusStyle = getStatusColor(app.status);
                                const dateObj = new Date(app.appointment_date);
                                return (
                                    <div key={app.id} style={cardStyle}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                            {/* Date Block */}
                                            <div style={{
                                                background: 'var(--primary-light)', color: 'var(--primary)',
                                                padding: '10px', borderRadius: '8px', textAlign: 'center', minWidth: '60px'
                                            }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{format(dateObj, 'MMM').toUpperCase()}</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{format(dateObj, 'dd')}</div>
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Dr. {app.doctor.full_name}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{app.doctor.specialty}</div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '8px', fontSize: '0.9rem', color: '#64748B' }}>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <Clock size={16} /> {format(dateObj, 'hh:mm a')}
                           </span>
                                                    {app.hospital && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                               <MapPin size={16} /> {app.hospital.full_name}
                             </span>
                                                    )}
                                                </div>
                                            </div>

                                            <span style={{
                                                background: statusStyle.bg, color: statusStyle.text, padding: '4px 10px',
                                                borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold'
                                            }}>
                        {app.status}
                      </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Prescriptions Tab */}
                    {activeTab === 'prescriptions' && (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {prescriptions.length === 0 ? <EmptyState text="No prescriptions found." /> : prescriptions.map(rx => (
                                <div key={rx.id} style={cardStyle}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ padding: '12px', borderRadius: '50%', background: '#F3E8FF', color: '#7E22CE' }}>
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{rx.uploader.full_name}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                Date: {format(new Date(rx.event_date), 'MMM dd, yyyy')}
                                            </div>
                                            <div style={{ marginTop: '4px', fontWeight: 500 }}>Rx: {rx.title}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Diagnostic Tab */}
                    {activeTab === 'diagnostic' && (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {diagnostics.length === 0 ? <EmptyState text="No diagnostic records." /> : diagnostics.map(diag => (
                                <div key={diag.id} style={cardStyle}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ padding: '12px', borderRadius: '50%', background: '#E0F2F1', color: 'var(--primary)' }}>
                                            <TestTube size={24} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{diag.provider.full_name}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                Date: {format(new Date(diag.created_at), 'MMM dd, yyyy')}
                                            </div>
                                            <div style={{ marginTop: '4px' }}>Status:
                                                <span style={{ marginLeft: '5px', fontWeight: 'bold', color: diag.report_status === 'COMPLETED' ? 'green' : 'orange' }}>
                          {diag.report_status}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Hospitals Tab (Empty as per App) */}
                    {activeTab === 'hospitals' && <EmptyState text="Hospital admission history will appear here." />}
                </>
            )}
        </div>
    );
}

// Helper Components
function EmptyState({ text }: { text: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <Hourglass size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>{text}</p>
        </div>
    );
}

const cardStyle: React.CSSProperties = {
    background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px',
    border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'
};