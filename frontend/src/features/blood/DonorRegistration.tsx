import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';

export default function DonorRegistration() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fields
    const [bloodGroup, setBloodGroup] = useState('A+');
    const [district, setDistrict] = useState('');
    const [phone, setPhone] = useState('');
    const [available, setAvailable] = useState(true);
    const [isAlreadyDonor, setIsAlreadyDonor] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
            if (profile.blood_group) setBloodGroup(profile.blood_group);
            if (profile.district) setDistrict(profile.district);
            if (profile.phone) setPhone(profile.phone);
        }

        // Check Donor Status
        const { data: donor } = await supabase.from('blood_donors').select('*').eq('user_id', user.id).single();
        if (donor) {
            setIsAlreadyDonor(true);
            setAvailable(donor.availability);
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Update Profile
            await supabase.from('profiles').update({
                blood_group: bloodGroup,
                district: district,
                phone: phone
            }).eq('id', user.id);

            // 2. Update/Insert Donor
            const donorData = { user_id: user.id, availability: available };
            if (isAlreadyDonor) {
                await supabase.from('blood_donors').update(donorData).eq('user_id', user.id);
            } else {
                await supabase.from('blood_donors').insert(donorData);
            }

            alert(t('blood.register.success'));
        } catch (err) {
            console.error(err);
            alert(t('blood.register.fail'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>
                {isAlreadyDonor ? t('blood.register.title_update') : t('blood.register.title_register')}
            </h2>

            <form onSubmit={handleSave} style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>{t('blood.request.group_label')}</label>
                    <select
                        value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px' }}
                    >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>{t('blood.search.district_label')}</label>
                    <input
                        type="text" required value={district} onChange={(e) => setDistrict(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>{t('blood.register.phone_label')}</label>
                    <input
                        type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)}
                        style={{ width: '20px', height: '20px' }}
                    />
                    <label>{t('blood.register.available_label')}</label>
                </div>

                <button
                    type="submit" disabled={saving}
                    style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    {saving ? t('blood.register.saving') : (isAlreadyDonor ? t('blood.register.update_btn') : t('blood.register.register_btn'))}
                </button>
            </form>
        </div>
    );
}