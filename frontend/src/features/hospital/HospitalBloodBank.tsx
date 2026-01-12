import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient.ts';
import { Drop, Plus } from 'phosphor-react';
import styles from './styles/HospitalBloodBank.module.css';

interface BloodInventory {
    id: string;
    blood_group: string;
    units: number;
    last_updated: string;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function HospitalBloodBank() {
    const { t } = useTranslation();
    const [inventory, setInventory] = useState<BloodInventory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form
    const [selectedGroup, setSelectedGroup] = useState(BLOOD_GROUPS[0]);
    const [units, setUnits] = useState(0);

    const fetchInventory = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('blood_inventory')
            .select('*')
            .eq('hospital_id', user.id);

        if (data) setInventory(data as BloodInventory[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchInventory();
    }, [fetchInventory]);

    const updateInventory = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if exists
        const { data: existing } = await supabase
            .from('blood_inventory')
            .select('id, units')
            .eq('hospital_id', user.id)
            .eq('blood_group', selectedGroup)
            .single();

        if (existing) {
            // Update
            await supabase.from('blood_inventory').update({
                units: existing.units + Number(units),
                last_updated: new Date().toISOString()
            }).eq('id', existing.id);
        } else {
            // Insert
            await supabase.from('blood_inventory').insert({
                hospital_id: user.id,
                blood_group: selectedGroup,
                units: Number(units),
                last_updated: new Date().toISOString()
            });
        }

        alert(t('common.success'));
        setShowModal(false);
        setUnits(0);
        await fetchInventory();
    };

    if (loading) return <div>{t('dashboard.hospital.blood.loading')}</div>;

    return (
        <div>
            <div className={styles.header}>
                <h2 className={styles.title}>{t('dashboard.hospital.blood.title')}</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className={styles.addBtn}
                >
                    <Plus size={20} /> {t('dashboard.hospital.blood.update_inventory')}
                </button>
            </div>

            <div className={styles.grid}>
                {BLOOD_GROUPS.map(group => {
                    const item = inventory.find(i => i.blood_group === group);
                    return (
                        <div key={group} className={`${styles.card} ${!item ? styles.inactive : ''}`}>
                            <div className={styles.iconWrapper}>
                                <Drop size={32} weight="fill" />
                            </div>
                            <h3 className={styles.bloodGroup}>{group}</h3>
                            <p className={styles.units}>
                                {item ? `${item.units} ${t('dashboard.hospital.blood.units')}` : `0 ${t('dashboard.hospital.blood.units')}`}
                            </p>
                            {item && <span className={styles.lastUpdated}>{t('dashboard.hospital.blood.last_updated')}: {new Date(item.last_updated).toLocaleDateString()}</span>}
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>{t('dashboard.hospital.blood.modal_title')}</h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t('dashboard.hospital.blood.blood_group')}</label>
                            <select
                                value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
                                className={styles.select}
                            >
                                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        <div className={styles.formGroupLong}>
                            <label className={styles.label}>{t('dashboard.hospital.blood.units_to_add')}</label>
                            <input
                                type="number" min="1"
                                value={units} onChange={e => setUnits(Number(e.target.value))}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button onClick={() => setShowModal(false)} className={styles.cancelBtn}>{t('common.cancel')}</button>
                            <button onClick={updateInventory} className={styles.saveBtn}>{t('common.save')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}