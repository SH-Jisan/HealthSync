import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { MagnifyingGlass, Phone, MapPin } from 'phosphor-react';
import styles from './styles/DonorSearch.module.css';

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
            alert(err instanceof Error ? err.message : 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                <MagnifyingGlass size={32} /> {t('blood.search.title')}
            </h2>

            <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.inputWrapper}>
                    <label className={styles.label}>{t('blood.request.group_label')}</label>
                    <select
                        value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                        className={styles.select}
                    >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.label}>{t('blood.search.district_label')}</label>
                    <input
                        type="text"
                        placeholder={t('blood.search.district_placeholder')}
                        value={district} onChange={(e) => setDistrict(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div>
                    <button type="submit" disabled={loading} className={styles.searchBtn}>
                        {loading ? t('blood.search.searching') : t('blood.search.search_btn')}
                    </button>
                </div>
            </form>

            {hasSearched && donors.length === 0 && !loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                    {t('blood.search.no_donors')}
                </div>
            ) : (
                <div className={styles.resultsGrid}>
                    {donors.map(donor => (
                        <div key={donor.id} className={styles.donorCard}>
                            <div className={styles.donorHeader}>
                                <div className={styles.bloodCircle}>{donor.profiles.blood_group}</div>
                                <div className={styles.donorInfo}>
                                    <h3>{donor.profiles.full_name}</h3>
                                    <div className={styles.location}>
                                        <MapPin size={16} /> {donor.profiles.district || 'Unknown'}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <a href={`tel:${donor.profiles.phone}`} className={styles.callBtn}>
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