// src/features/blood/RequestBlood.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Sparkle } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';

export default function RequestBlood() {
    const navigate = useNavigate();
    const [aiPrompt, setAiPrompt] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [bloodGroup, setBloodGroup] = useState('A+');
    const [hospital, setHospital] = useState('');
    const [urgency, setUrgency] = useState<'NORMAL' | 'CRITICAL'>('NORMAL');
    const [note, setNote] = useState('');

    // AI Autofill Function
    const handleAIAnalyze = async () => {
        if (!aiPrompt) return;
        setAnalyzing(true);
        try {
            const { data, error } = await supabase.functions.invoke('extract-blood-request', {
                body: { text: aiPrompt }
            });
            if (error) throw error;

            if (data) {
                if (data.blood_group) setBloodGroup(data.blood_group);
                if (data.location) setHospital(data.location);
                if (data.patient_note) setNote(data.patient_note);
                if (data.urgency) setUrgency(data.urgency);
                alert('✨ Autofilled by AI!');
            }
        } catch {
            // Unused 'err' removed to fix lint error
            alert('AI Analysis failed. Please fill manually.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");

            // 1. Save Request
            await supabase.from('blood_requests').insert({
                requester_id: user.id,
                blood_group: bloodGroup,
                hospital_name: hospital,
                urgency: urgency,
                reason: note,
                status: 'OPEN'
            });

            // 2. Notify Donors (Edge Function)
            await supabase.functions.invoke('notify-donors', {
                body: { blood_group: bloodGroup, hospital, urgency }
            });

            alert('Request Posted Successfully!');
            navigate('/blood/feed');

        } catch (error) {
            // Fixed 'any' type error by checking instanceof Error
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Request Blood</h2>

            {/* AI Section */}
            <div style={{
                background: 'linear-gradient(135deg, #F3E8FF 0%, #FFFFFF 100%)',
                padding: '1.5rem', borderRadius: '16px', border: '1px solid #D8B4FE', marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7E22CE', fontWeight: 'bold', marginBottom: '1rem' }}>
                    <Sparkle size={24} weight="fill" />
                    <span>Quick AI Fill</span>
                </div>
                <textarea
                    placeholder="e.g. Urgent O+ blood needed at Dhaka Medical for accident patient..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D8B4FE', marginBottom: '10px' }}
                />
                <button
                    onClick={handleAIAnalyze}
                    disabled={analyzing}
                    style={{ background: '#9333EA', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                    {analyzing ? 'Analyzing...' : 'Auto-Fill Form'}
                </button>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Blood Group</label>
                    <select
                        value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Hospital / Location</label>
                    <input
                        type="text" required value={hospital} onChange={(e) => setHospital(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Urgency</label>
                    <select
                        value={urgency}
                        // Fixed 'any' type error by casting to specific union type
                        onChange={(e) => setUrgency(e.target.value as 'NORMAL' | 'CRITICAL')}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', color: urgency === 'CRITICAL' ? 'red' : 'inherit', fontWeight: 'bold' }}
                    >
                        <option value="NORMAL">Normal</option>
                        <option value="CRITICAL">🔥 CRITICAL</option>
                    </select>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Note (Optional)</label>
                    <textarea
                        value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                </div>

                <button
                    type="submit" disabled={loading}
                    style={{ width: '100%', padding: '14px', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    {loading ? 'Posting...' : 'POST REQUEST'}
                </button>

            </form>
        </div>
    );
}