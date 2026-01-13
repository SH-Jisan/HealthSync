import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, CheckCircle, Upload, Plus } from 'phosphor-react';
import UploadModal from '../upload/UploadModal';
import styles from './styles/DiagnosticPatientView.module.css';

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
    }, [patient.id]); // Added patient.id as dependency for safety

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
            await fetchOrders();
            setSelectedTests([]);
            setTotalAmount(0);
        }
    };

    const togglePayment = async (order: Order) => {
        const newStatus = order.status === 'PAID' ? 'DUE' : 'PAID';
        await supabase.from('patient_payments').update({ status: newStatus }).eq('id', order.id);
        await fetchOrders();
    };

    const markCompleted = async (orderId: string) => {
        await supabase.from('patient_payments').update({ report_status: 'COMPLETED' }).eq('id', orderId);
        await fetchOrders();
    };

    return (
        <div>
            <div className={styles.header}>
                <button onClick={onBack} className={styles.backBtn}>
                    <ArrowLeft size={24} />
                </button>
                <h2 className={styles.patientName}>{patient.full_name}</h2>
                <span className={styles.patientContact}>{patient.phone || patient.email}</span>
            </div>

            <button
                onClick={() => setShowNewOrder(true)}
                className={styles.newOrderBtn}
            >
                <Plus size={20} /> {t('dashboard.diagnostic.view.new_order_btn')}
            </button>

            {/* Orders List */}
            <div className={styles.ordersGrid}>
                {orders.map(order => (
                    <div
                        key={order.id}
                        className={`${styles.orderCard} ${order.report_status === 'PENDING' ? styles.orderCardPending : styles.orderCardCompleted}`}
                    >
                        <div className={styles.orderHeader}>
                            <div>
                                <h4 className={styles.testNames}>{order.test_names.join(', ')}</h4>
                                <small className={styles.orderDate}>{new Date(order.created_at).toLocaleString()}</small>
                            </div>
                            <div className={styles.orderRight}>
                                <div className={styles.amount}>৳{order.total_amount}</div>
                                <div
                                    onClick={() => togglePayment(order)}
                                    className={`${styles.paymentStatus} ${order.status === 'PAID' ? styles.statusPaid : styles.statusDue}`}
                                >
                                    {order.status}
                                </div>
                            </div>
                        </div>

                        <div className={styles.orderActions}>
                            {order.report_status === 'PENDING' ? (
                                <button
                                    onClick={() => setUploadOrderId(order.id)}
                                    className={styles.uploadBtn}
                                >
                                    <Upload size={18} /> {t('dashboard.diagnostic.view.upload_report')}
                                </button>
                            ) : (
                                <span className={styles.completedStatus}>
                                    <CheckCircle size={20} /> {t('dashboard.diagnostic.view.completed')}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* New Order Modal */}
            {showNewOrder && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>{t('dashboard.diagnostic.view.select_tests_title')}</h3>
                        <div className={styles.testList}>
                            {availableTests.map(test => (
                                <div key={test.id} className={styles.testItem}>
                                    <label className={styles.testLabel}>
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

                        <div className={styles.totalAmount}>
                            <span>{t('dashboard.diagnostic.view.total')}</span>
                            <span>৳{totalAmount}</span>
                        </div>

                        <div className={styles.modalActions}>
                            <button onClick={() => setShowNewOrder(false)} className={styles.cancelBtn}>{t('common.cancel')}</button>
                            <button onClick={handleCreateOrder} className={styles.createBtn}>{t('dashboard.diagnostic.view.create_order_btn')}</button>
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
                    patientId={patient.id} // <--- এই লাইনটি যোগ করা হয়েছে
                />
            )}
        </div>
    );
}