import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient.ts';
import { MagnifyingGlass, Person } from 'phosphor-react';

interface PatientProfile {
    id: string;
    full_name: string;
    email: string;
}

export default function DiagnosticSearch() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchedPatient, setSearchedPatient] = useState<PatientProfile | null>(null);

    // Registration States
    const [showRegister, setShowRegister] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newEmail, setNewEmail] = useState('');

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!email) return;
        setLoading(true);
        setSearchedPatient(null);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', email.trim())
                .eq('role', 'CITIZEN')
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setSearchedPatient(data as PatientProfile);
            } else {
                alert(t('dashboard.diagnostic.search.not_found_alert'));
                setNewEmail(email); // Pre-fill email
                setShowRegister(true);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Search failed';
            alert(t('common.error') + ': ' + message);
        } finally {
            setLoading(false);
        }
    };

    const assignPatient = async () => {
        if (!searchedPatient) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from('diagnostic_patients').insert({
                diagnostic_id: user.id,
                patient_id: searchedPatient.id
            });

            if (error) {
                if (error.code === '23505') alert(t('dashboard.diagnostic.search.already_assigned'));
                else throw error;
            } else {
                alert(t('dashboard.diagnostic.search.assign_success'));
                setSearchedPatient(null);
                setEmail('');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Assignment failed';
            alert(t('common.error') + ': ' + message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.rpc('create_dummy_user', {
                u_email: newEmail,
                u_password: '123456',
                u_name: newName,
                u_phone: newPhone,
                u_role: 'CITIZEN',
                u_address: ''
            });

            if (error) throw error;

            alert(t('dashboard.diagnostic.search.success_reg'));
            setShowRegister(false);
            setEmail(newEmail);
            handleSearch();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            alert(t('common.error') + ': ' + message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                <input
                    type="email"
                    placeholder={t('dashboard.diagnostic.search.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    style={{
                        background: 'var(--primary)', color: 'white', border: 'none',
                        padding: '0 20px', borderRadius: '8px', cursor: 'pointer'
                    }}
                >
                    {loading ? '...' : <MagnifyingGlass size={20} />}
                </button>
            </div>

            {searchedPatient && (
                <div style={{
                    background: 'var(--surface)', padding: '2rem', borderRadius: '16px',
                    border: '1px solid var(--border)', textAlign: 'center'
                }}>
                    <div style={{
                        width: '60px', height: '60px', background: '#E0F2F1', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
                        color: 'var(--primary)'
                    }}>
                        <Person size={32} />
                    </div>
                    <h3>{searchedPatient.full_name}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{searchedPatient.email}</p>

                    <button
                        onClick={assignPatient}
                        disabled={loading}
                        style={{
                            marginTop: '1.5rem', padding: '12px 24px', background: 'var(--primary)',
                            color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        {t('dashboard.diagnostic.search.assign_btn')}
                    </button>
                </div>
            )}

            {showRegister && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px' }}>
                        <h3>{t('dashboard.diagnostic.search.register_title')}</h3>
                        <input
                            placeholder={t('dashboard.diagnostic.search.name_ph')}
                            value={newName} onChange={e => setNewName(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '8px' }}
                        />
                        <input
                            placeholder={t('dashboard.diagnostic.search.email_ph')}
                            value={newEmail} onChange={e => setNewEmail(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '8px' }}
                        />
                        <input
                            placeholder={t('dashboard.diagnostic.search.phone_ph')}
                            value={newPhone} onChange={e => setNewPhone(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '8px' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowRegister(false)} style={{ flex: 1, padding: '10px', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('common.cancel')}</button>
                            <button onClick={handleRegister} disabled={loading} style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('dashboard.diagnostic.search.register_btn')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}