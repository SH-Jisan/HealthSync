import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { MagnifyingGlass, Phone, MapPin, User, Spinner } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
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
            <div className={styles.header}>
                <h2 className={styles.title}>
                    <MagnifyingGlass size={36} weight="duotone" />
                    <span className="t-text-gradient">{t('blood.search.title')}</span>
                </h2>
                <p className={styles.subtitle}>{t('blood.search.subtitle', 'Find registered blood donors in your area.')}</p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${styles.searchCard} t-card-glass`}
            >
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
                        <div className={styles.inputIconWrapper}>
                            <MapPin size={20} className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder={t('blood.search.district_placeholder')}
                                value={district} onChange={(e) => setDistrict(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.btnWrapper}>
                        <button type="submit" disabled={loading} className={`${styles.searchBtn} t-btn-primary`}>
                            {loading ? (
                                <Spinner size={24} className={styles.spinner} />
                            ) : (
                                <>
                                    <MagnifyingGlass size={20} weight="bold" />
                                    {t('blood.search.search_btn')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>

            <div className={styles.resultsArea}>
                <AnimatePresence>
                    {hasSearched && donors.length === 0 && !loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={styles.emptyState}
                        >
                            <User size={48} weight="duotone" />
                            <p>{t('blood.search.no_donors')}</p>
                        </motion.div>
                    ) : (
                        <motion.div className={styles.resultsGrid} layout>
                            {donors.map((donor, idx) => (
                                <motion.div
                                    key={donor.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`${styles.donorCard} t-card-glass`}
                                >
                                    <div className={styles.donorHeader}>
                                        <div className={styles.bloodCircle}>{donor.profiles.blood_group}</div>
                                        <div className={styles.donorInfo}>
                                            <h3 className={styles.donorName}>{donor.profiles.full_name}</h3>
                                            <div className={styles.location}>
                                                <MapPin size={16} weight="fill" />
                                                {donor.profiles.district || 'Unknown District'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <a href={`tel:${donor.profiles.phone}`} className={styles.callBtn}>
                                            <Phone size={20} weight="fill" />
                                            {t('blood.search.call')}
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}