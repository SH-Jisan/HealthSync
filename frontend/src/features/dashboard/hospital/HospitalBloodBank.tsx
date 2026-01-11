import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabaseClient';
import { Drop, Activity, Plus } from 'phosphor-react';

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

    const fetchInventory = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('blood_inventory')
            .select('*')
            .eq('hospital_id', user.id);

        if (data) setInventory(data as BloodInventory[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchInventory();
    }, []);

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
        fetchInventory();
    };

    if (loading) return <div>{t('dashboard.hospital.blood.loading')}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>{t('dashboard.hospital.blood.title')}</h2>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)',
                        color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    <Plus size={20} /> {t('dashboard.hospital.blood.update_inventory')}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {BLOOD_GROUPS.map(group => {
                    const item = inventory.find(i => i.blood_group === group);
                    return (
                        <div key={group} style={{
                            background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px',
                            border: '1px solid var(--border)', textAlign: 'center',
                            opacity: item ? 1 : 0.6
                        }}>
                            <div style={{
                                width: '60px', height: '60px', margin: '0 auto 10px', borderRadius: '50%',
                                background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold'
                            }}>
                                <Drop size={32} weight="fill" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{group}</h3>
                            <p style={{ margin: '5px 0', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {item ? `${item.units} ${t('dashboard.hospital.blood.units')}` : `0 ${t('dashboard.hospital.blood.units')}`}
                            </p>
                            {item && <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{t('dashboard.hospital.blood.last_updated')}: {new Date(item.last_updated).toLocaleDateString()}</span>}
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px' }}>
                        <h3>{t('dashboard.hospital.blood.modal_title')}</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>{t('dashboard.hospital.blood.blood_group')}</label>
                            <select
                                value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                            >
                                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>{t('dashboard.hospital.blood.units_to_add')}</label>
                            <input
                                type="number" min="1"
                                value={units} onChange={e => setUnits(Number(e.target.value))}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('common.cancel')}</button>
                            <button onClick={updateInventory} style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('common.save')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}