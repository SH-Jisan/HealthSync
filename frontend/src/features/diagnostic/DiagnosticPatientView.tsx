import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient.ts';
import { ArrowLeft, CheckCircle, Upload, Plus } from 'phosphor-react';
import UploadModal from '../upload/UploadModal';

interface Patient {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
}

interface Order {
    id: string;
    test_names: string[];
    total_amount: number;
    status: 'PAID' | 'DUE';
    report_status: 'PENDING' | 'COMPLETED';
    created_at: string;
}

interface Test {
    id: string;
    name: string;
    base_price: number;
}

interface Props {
    patient: Patient;
    onBack: () => void;
}

export default function DiagnosticPatientView({ patient, onBack }: Props) {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [availableTests, setAvailableTests] = useState<Test[]>([]);
    const [showNewOrder, setShowNewOrder] = useState(false);
    const [uploadOrderId, setUploadOrderId] = useState<string | null>(null);

    // New Order State
    const [selectedTests, setSelectedTests] = useState<string[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);

    const fetchOrders = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('patient_payments')
            .select('*')
            .eq('patient_id', patient.id)
            .eq('provider_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setOrders(data as Order[]);
    };

    const fetchAvailableTests = async () => {
        const { data } = await supabase.from('available_tests').select('*').order('name');
        if (data) setAvailableTests(data as Test[]);
    };

    useEffect(() => {
        fetchOrders();
        fetchAvailableTests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreateOrder = async () => {
        if (selectedTests.length === 0) return alert(t('dashboard.diagnostic.view.alert_select_test'));

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('patient_payments').insert({
            patient_id: patient.id,
            provider_id: user.id,
            test_names: selectedTests,
            total_amount: totalAmount,
            paid_amount: 0,
            status: 'DUE',
            report_status: 'PENDING'
        });

        if (error) alert(t('dashboard.diagnostic.view.alert_fail'));
        else {
            alert(t('dashboard.diagnostic.view.order_created'));
            setShowNewOrder(false);
            fetchOrders();
            setSelectedTests([]);
            setTotalAmount(0);
        }
    };

    const togglePayment = async (order: Order) => {
        const newStatus = order.status === 'PAID' ? 'DUE' : 'PAID';
        await supabase.from('patient_payments').update({ status: newStatus }).eq('id', order.id);
        fetchOrders();
    };

    const markCompleted = async (orderId: string) => {
        await supabase.from('patient_payments').update({ report_status: 'COMPLETED' }).eq('id', orderId);
        fetchOrders();
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: 0 }}>{patient.full_name}</h2>
                <span style={{ background: '#eee', padding: '4px 10px', borderRadius: '12px', fontSize: '0.9rem' }}>{patient.phone || patient.email}</span>
            </div>

            <button
                onClick={() => setShowNewOrder(true)}
                style={{
                    marginBottom: '2rem', padding: '12px 24px', background: 'var(--primary)', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
                }}
            >
                <Plus size={20} /> {t('dashboard.diagnostic.view.new_order_btn')}
            </button>

            {/* Orders List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {orders.map(order => (
                    <div key={order.id} style={{
                        background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px',
                        borderLeft: order.report_status === 'PENDING' ? '5px solid orange' : '5px solid green',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0' }}>{order.test_names.join(', ')}</h4>
                                <small style={{ color: 'var(--text-secondary)' }}>{new Date(order.created_at).toLocaleString()}</small>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>৳{order.total_amount}</div>
                                <div
                                    onClick={() => togglePayment(order)}
                                    style={{
                                        cursor: 'pointer', color: order.status === 'PAID' ? 'green' : 'red', fontWeight: 'bold',
                                        border: '1px solid', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px'
                                    }}
                                >
                                    {order.status}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            {order.report_status === 'PENDING' ? (
                                <button
                                    onClick={() => setUploadOrderId(order.id)}
                                    style={{
                                        background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                                    }}
                                >
                                    <Upload size={18} /> {t('dashboard.diagnostic.view.upload_report')}
                                </button>
                            ) : (
                                <span style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                                    <CheckCircle size={20} /> {t('dashboard.diagnostic.view.completed')}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* New Order Modal */}
            {showNewOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3>{t('dashboard.diagnostic.view.select_tests_title')}</h3>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid #eee', padding: '10px' }}>
                            {availableTests.map(test => (
                                <div key={test.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
                                    <label style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedTests([...selectedTests, test.name]);
                                                    setTotalAmount(prev => prev + test.base_price);
                                                } else {
                                                    setSelectedTests(selectedTests.filter(t => t !== test.name));
                                                    setTotalAmount(prev => prev - test.base_price);
                                                }
                                            }}
                                        />
                                        {test.name}
                                    </label>
                                    <span>৳{test.base_price}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.2rem' }}>
                            <span>{t('dashboard.diagnostic.view.total')}</span>
                            <span>৳{totalAmount}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowNewOrder(false)} style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>{t('common.cancel')}</button>
                            <button onClick={handleCreateOrder} style={{ flex: 1, padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('dashboard.diagnostic.view.create_order_btn')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {uploadOrderId && (
                <UploadModal
                    onClose={() => setUploadOrderId(null)}
                    onSuccess={() => {
                        markCompleted(uploadOrderId);
                        setUploadOrderId(null);
                    }}
                />
            )}
        </div>
    );
}