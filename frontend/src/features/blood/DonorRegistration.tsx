import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import styles from './styles/DonorRegistration.module.css';

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

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
            if (profile.blood_group) setBloodGroup(profile.blood_group);
            if (profile.district) setDistrict(profile.district);
            if (profile.phone) setPhone(profile.phone);
        }

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

            await supabase.from('profiles').update({
                blood_group: bloodGroup,
                district: district,
                phone: phone
            }).eq('id', user.id);

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
        <div className={styles.container}>
            <h2 className={styles.title}>
                {isAlreadyDonor ? t('blood.register.title_update') : t('blood.register.title_register')}
            </h2>

            <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('blood.request.group_label')}</label>
                    <select
                        value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                        className={styles.select}
                    >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('blood.search.district_label')}</label>
                    <input
                        type="text" required value={district} onChange={(e) => setDistrict(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>{t('blood.register.phone_label')}</label>
                    <input
                        type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.checkboxGroup}>
                    <input
                        type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)}
                        className={styles.checkbox}
                    />
                    <label>{t('blood.register.available_label')}</label>
                </div>

                <button type="submit" disabled={saving} className={styles.submitBtn}>
                    {saving ? t('blood.register.saving') : (isAlreadyDonor ? t('blood.register.update_btn') : t('blood.register.register_btn'))}
                </button>
            </form>
        </div>
    );
}