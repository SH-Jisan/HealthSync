import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { MagnifyingGlass, Phone, MapPin } from 'phosphor-react'; // Fix: Removed 'User'

interface Donor {
    id: string;
    user_id: string;
    availability: boolean;
    profiles: {
        full_name: string;
        phone: string;
        blood_group: string;
        district: string;
    };
}

export default function DonorSearch() {
    const { t } = useTranslation();
    const [bloodGroup, setBloodGroup] = useState('A+');
    const [district, setDistrict] = useState('');
    const [donors, setDonors] = useState<Donor[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setHasSearched(true);
        setDonors([]);

        try {
            let query = supabase
                .from('blood_donors')
                .select('*, profiles!inner(*)')
                .eq('availability', true)
                .eq('profiles.blood_group', bloodGroup);

            if (district.trim()) {
                query = query.ilike('profiles.district', `%${district.trim()}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            if (data) setDonors(data as unknown as Donor[]);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Search failed';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MagnifyingGlass size={32} /> {t('blood.search.title')}
            </h2>

            {/* Search Bar */}
            <form
                onSubmit={handleSearch}
                style={{
                    background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px',
                    boxShadow: 'var(--shadow-sm)', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'
                }}
            >
                <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>{t('blood.request.group_label')}</label>
                    <select
                        value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>

                <div style={{ flex: 2, minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>{t('blood.search.district_label')}</label>
                    <input
                        type="text"
                        placeholder={t('blood.search.district_placeholder')}
                        value={district} onChange={(e) => setDistrict(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'end' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px 24px', background: 'var(--primary)', color: 'white',
                            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', height: '42px'
                        }}
                    >
                        {loading ? t('blood.search.searching') : t('blood.search.search_btn')}
                    </button>
                </div>
            </form>

            {/* Results */}
            {hasSearched && donors.length === 0 && !loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                    {t('blood.search.no_donors')}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {donors.map(donor => (
                        <div key={donor.id} style={{
                            background: 'white', padding: '1.5rem', borderRadius: '12px',
                            border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                            display: 'flex', flexDirection: 'column', gap: '10px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '45px', height: '45px', borderRadius: '50%', background: '#FEE2E2',
                                        color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                    }}>
                                        {donor.profiles.blood_group}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{donor.profiles.full_name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            <MapPin size={16} /> {donor.profiles.district || 'Unknown'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '5px' }}>
                                <a
                                    href={`tel:${donor.profiles.phone}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        textDecoration: 'none', background: '#DCFCE7', color: '#166534',
                                        padding: '10px', borderRadius: '8px', fontWeight: 'bold'
                                    }}
                                >
                                    <Phone size={20} weight="fill" /> {t('blood.search.call')}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}