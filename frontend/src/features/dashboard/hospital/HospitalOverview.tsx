import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Users, Calendar, UserPlus, MagnifyingGlass } from 'phosphor-react';
// import { useNavigate } from 'react-router-dom'; // <--- রিমুভ করা হয়েছে

export default function HospitalOverview() {
    // const navigate = useNavigate(); // <--- রিমুভ করা হয়েছে (অব্যবহৃত ছিল)
    const [loading, setLoading] = useState(false);

    // Search States
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [doctorEmail, setDoctorEmail] = useState('');
    const [assignStatus, setAssignStatus] = useState('');

    // Doctor Assign Function
    const handleAssignDoctor = async () => {
        if (!doctorEmail) return;
        setLoading(true);
        setAssignStatus('Searching...');

        try {
            // 1. Find Doctor by Email
            const { data: doctor, error: docError } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('email', doctorEmail)
                .eq('role', 'DOCTOR')
                .single();

            if (docError || !doctor) {
                throw new Error('Doctor not found with this email.');
            }

            // 2. Get Current Hospital ID
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 3. Insert into hospital_doctors
            const { error: insertError } = await supabase
                .from('hospital_doctors')
                .insert({
                    hospital_id: user.id,
                    doctor_id: doctor.id
                });

            if (insertError) {
                if (insertError.code === '23505') throw new Error('Doctor is already assigned.');
                throw insertError;
            }

            setAssignStatus(`Success! Dr. ${doctor.full_name} added.`);
            setTimeout(() => {
                setShowAssignModal(false);
                setDoctorEmail('');
                setAssignStatus('');
            }, 2000);

        } catch (err) {
            if (err instanceof Error) {
                setAssignStatus('Error: ' + err.message);
            } else {
                setAssignStatus('An unknown error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Hospital Dashboard</h1>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={statCardStyle}>
                    <div style={iconBoxStyle('#E0F2F1', 'var(--primary)')}>
                        <Users size={32} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>Manage</h2>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Doctors & Staff</p>
                    </div>
                </div>

                <div style={statCardStyle}>
                    <div style={iconBoxStyle('#FFF7ED', '#EA580C')}>
                        <Calendar size={32} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>Appointments</h2>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>View Schedule</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* Assign Doctor Card */}
                <div
                    onClick={() => setShowAssignModal(true)}
                    style={{ ...actionCardStyle, borderLeft: '5px solid var(--primary)' }}
                >
                    <UserPlus size={32} color="var(--primary)" />
                    <div>
                        <h3 style={{ margin: '0 0 5px 0' }}>Assign New Doctor</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Add a doctor to your hospital list.</p>
                    </div>
                </div>

                {/* Find Patient Card (Placeholder for now) */}
                <div
                    onClick={() => alert('Search Patient feature coming in next step!')}
                    style={{ ...actionCardStyle, borderLeft: '5px solid #0891B2' }}
                >
                    <MagnifyingGlass size={32} color="#0891B2" />
                    <div>
                        <h3 style={{ margin: '0 0 5px 0' }}>Manage Patient</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Book appointments or upload reports.</p>
                    </div>
                </div>
            </div>

            {/* Assign Doctor Modal */}
            {showAssignModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ marginTop: 0 }}>Assign Doctor</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Enter the doctor's registered email address.</p>

                        <input
                            type="email"
                            placeholder="doctor@example.com"
                            value={doctorEmail}
                            onChange={(e) => setDoctorEmail(e.target.value)}
                            style={inputStyle}
                        />

                        {assignStatus && <p style={{ color: assignStatus.includes('Success') ? 'green' : 'red', fontSize: '0.9rem' }}>{assignStatus}</p>}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowAssignModal(false)} style={cancelBtnStyle}>Cancel</button>
                            <button onClick={handleAssignDoctor} disabled={loading} style={confirmBtnStyle}>
                                {loading ? 'Adding...' : 'Add Doctor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Styles
const statCardStyle: React.CSSProperties = {
    background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px',
    boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem',
    border: '1px solid var(--border)'
};

const actionCardStyle: React.CSSProperties = {
    background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px',
    boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem',
    cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--border)'
};

const iconBoxStyle = (bg: string, color: string): React.CSSProperties => ({
    width: '60px', height: '60px', borderRadius: '12px', background: bg,
    color: color, display: 'flex', alignItems: 'center', justifyContent: 'center'
});

const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
};

const modalContentStyle: React.CSSProperties = {
    background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px'
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '10px'
};

const confirmBtnStyle: React.CSSProperties = {
    flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
};

const cancelBtnStyle: React.CSSProperties = {
    flex: 1, padding: '10px', background: '#e2e8f0', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer'
};