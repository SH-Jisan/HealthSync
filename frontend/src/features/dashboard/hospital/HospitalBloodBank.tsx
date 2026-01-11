import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Drop, Plus, Minus, FloppyDisk } from 'phosphor-react';

interface BloodStock {
    blood_group: string;
    count: number;
}

export default function HospitalBloodBank() {
    const [stocks, setStocks] = useState<BloodStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch existing stock
        const { data } = await supabase
            .from('hospital_blood_bank')
            .select('blood_group, count')
            .eq('hospital_id', user.id);

        // Merge with default groups (in case some are missing in DB)
        const currentStock = bloodGroups.map(group => {
            const found = data?.find(d => d.blood_group === group);
            return { blood_group: group, count: found?.count || 0 };
        });

        setStocks(currentStock);
        setLoading(false);
    };

    const updateCount = (group: string, delta: number) => {
        setStocks(prev => prev.map(s =>
            s.blood_group === group ? { ...s, count: Math.max(0, s.count + delta) } : s
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Upsert stocks
        const updates = stocks.map(s => ({
            hospital_id: user.id,
            blood_group: s.blood_group,
            count: s.count,
            updated_at: new Date().toISOString()
        }));

        const { error } = await supabase.from('hospital_blood_bank').upsert(updates, { onConflict: 'hospital_id,blood_group' });

        if (error) {
            alert('Failed to update stock');
        } else {
            alert('Blood inventory updated successfully!');
        }
        setSaving(false);
    };

    if (loading) return <div>Loading Inventory...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Drop size={32} weight="fill" color="#DC2626" /> Blood Inventory
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0' }}>Manage available blood bags in your hospital.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
                        background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px',
                        fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s'
                    }}
                >
                    {saving ? 'Saving...' : <><FloppyDisk size={20} /> Save Changes</>}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                {stocks.map(stock => (
                    <div key={stock.blood_group} style={{
                        background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px',
                        border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%', background: '#FEE2E2',
                            color: '#DC2626', fontSize: '1.5rem', fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                        }}>
                            {stock.blood_group}
                        </div>

                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1E293B', marginBottom: '1rem' }}>
                            {stock.count}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Bags Available</div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button
                                onClick={() => updateCount(stock.blood_group, -1)}
                                style={{
                                    width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #ccc',
                                    background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Minus size={20} />
                            </button>
                            <button
                                onClick={() => updateCount(stock.blood_group, 1)}
                                style={{
                                    width: '40px', height: '40px', borderRadius: '8px', border: 'none',
                                    background: 'var(--primary)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}