import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Plus, Trash, CurrencyDollar, Flask } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

interface Test {
    id: string;
    name: string;
    price: number;
}

export default function DiagnosticTests() {
    const { t } = useTranslation();
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');

    const fetchTests = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('available_tests')
            .select('*')
            .eq('center_id', user.id);

        if (data) setTests(data as Test[]);
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTests();
    }, []);

    const addTest = async () => {
        if (!newName || !newPrice) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase.from('available_tests').insert({
            center_id: user.id,
            name: newName,
            price: parseInt(newPrice)
        }).select();

        if (!error && data) {
            setTests([...tests, data[0] as Test]);
            setNewName('');
            setNewPrice('');
        }
    };

    const deleteTest = async (id: string) => {
        await supabase.from('available_tests').delete().eq('id', id);
        setTests(prev => prev.filter(t => t.id !== id));
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Manage Services / Tests</h2>

            {/* Add Form */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <input
                    placeholder="Test Name (e.g. CBC, MRI)"
                    value={newName} onChange={e => setNewName(e.target.value)}
                    style={{ flex: 2, padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                <input
                    type="number"
                    placeholder="Price (BDT)"
                    value={newPrice} onChange={e => setNewPrice(e.target.value)}
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                <button
                    onClick={addTest}
                    style={{
                        background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px',
                        borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'
                    }}
                >
                    <Plus size={20} /> Add
                </button>
            </div>

            {/* List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {tests.map(test => (
                    <div key={test.id} style={{
                        background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px',
                        border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ padding: '10px', background: '#E0F2F1', borderRadius: '8px', color: 'var(--primary)' }}>
                                <Flask size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>{test.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                                    <CurrencyDollar size={18} /> {test.price} BDT
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => deleteTest(test.id)}
                            style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            <Trash size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}