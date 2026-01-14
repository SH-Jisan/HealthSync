import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, CheckCircle, Upload, Plus, Prescription, Flask } from 'phosphor-react';
import UploadModal from '../upload/UploadModal';
import SharedTestModal from '../dashboard/widgets/SharedTestModal'; // Shared Modal Import
import styles from './styles/DiagnosticPatientView.module.css';

interface Patient { id: string; full_name: string; email: string; phone?: string; }
interface Order { id: string; test_names: string[]; total_amount: number; status: 'PAID' | 'DUE'; report_status: 'PENDING' | 'COMPLETED'; created_at: string; }
// [NEW] Doctor Order Interface
interface DoctorTestOrder { id: string; title: string; key_findings: string[]; created_at: string; uploader: { full_name: string; }; }

interface Props { patient: Patient; onBack: () => void; }

export default function DiagnosticPatientView({ patient, onBack }: Props) {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [doctorOrders, setDoctorOrders] = useState<DoctorTestOrder[]>([]); // State for doctor orders
    const [showNewOrder, setShowNewOrder] = useState(false);
    const [uploadOrderId, setUploadOrderId] = useState<string | null>(null);
    const [testsToBill, setTestsToBill] = useState<string[]>([]);

    const fetchOrders = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('patient_payments').select('*').eq('patient_id', patient.id).eq('provider_id', user.id).order('created_at', { ascending: false });
        if (data) setOrders(data as Order[]);
    };

    // [IMPORTANT] Fetch Doctor's Orders logic
    const fetchDoctorOrders = async () => {
        const { data, error } = await supabase.from('medical_events')
            .select('id, title, key_findings, created_at, uploader:uploader_id(full_name)')
            .eq('patient_id', patient.id)
            .eq('event_type', 'TEST_ORDER')
            .order('created_at', { ascending: false }).limit(5);

        if (error) {
            console.error("Error fetching doctor orders:", error);
        } else if (data) {
            setDoctorOrders(data as any[]);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchDoctorOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patient.id]);

    const togglePayment = async (order: Order) => {
        const newStatus = order.status === 'PAID' ? 'DUE' : 'PAID';
        await supabase.from('patient_payments').update({ status: newStatus }).eq('id', order.id);
        fetchOrders();
    };

    const markCompleted = async (orderId: string) => {
        await supabase.from('patient_payments').update({ report_status: 'COMPLETED' }).eq('id', orderId);
        fetchOrders();
    };

    // Helper to open modal with pre-selected tests
    const handleConvertOrder = (testNames: string[]) => {
        setTestsToBill(testNames);
        setShowNewOrder(true);
    };

    return (
        <div>
            <div className={styles.header}>
                <button onClick={onBack} className={styles.backBtn}><ArrowLeft size={24} /></button>
                <h2 className={styles.patientName}>{patient.full_name}</h2>
                <span className={styles.patientContact}>{patient.phone || patient.email}</span>
            </div>

            {/* [NEW] Doctor's Pending Orders Section */}
            {doctorOrders.length > 0 && (
                <div className={styles.doctorOrdersSection}>
                    <h3 className={styles.sectionTitle} style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Prescription size={20} color="#6366f1" />
                        {t('dashboard.diagnostic.view.doctor_orders') || 'Doctor Prescribed Tests'}
                    </h3>
                    <div className={styles.doctorOrdersGrid}>
                        {doctorOrders.map(docOrder => (
                            <div key={docOrder.id} className={styles.docOrderCard}>
                                <div className={styles.docOrderHeader}>
                                    <span className={styles.docName}>Dr. {docOrder.uploader?.full_name}</span>
                                    <span className={styles.docDate}>{new Date(docOrder.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className={styles.testListText}>{docOrder.key_findings && docOrder.key_findings.join(', ')}</p>
                                {/* Opens SharedModal with pre-filled tests */}
                                <button className={styles.convertBtn} onClick={() => handleConvertOrder(docOrder.key_findings)}>
                                    <Flask size={16} /> Create Bill
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button onClick={() => { setTestsToBill([]); setShowNewOrder(true); }} className={styles.newOrderBtn}>
                <Plus size={20} /> {t('dashboard.diagnostic.view.new_order_btn')}
            </button>

            <div className={styles.ordersGrid}>
                {orders.map(order => (
                    <div key={order.id} className={`${styles.orderCard} ${order.report_status === 'PENDING' ? styles.orderCardPending : styles.orderCardCompleted}`}>
                        <div className={styles.orderHeader}>
                            <div>
                                <h4 className={styles.testNames}>{order.test_names.join(', ')}</h4>
                                <small className={styles.orderDate}>{new Date(order.created_at).toLocaleString()}</small>
                            </div>
                            <div className={styles.orderRight}>
                                <div className={styles.amount}>৳{order.total_amount}</div>
                                <div onClick={() => togglePayment(order)} className={`${styles.paymentStatus} ${order.status === 'PAID' ? styles.statusPaid : styles.statusDue}`}>{order.status}</div>
                            </div>
                        </div>
                        <div className={styles.orderActions}>
                            {order.report_status === 'PENDING' ? (
                                <button onClick={() => setUploadOrderId(order.id)} className={styles.uploadBtn}><Upload size={18} /> {t('dashboard.diagnostic.view.upload_report')}</button>
                            ) : (
                                <span className={styles.completedStatus}><CheckCircle size={20} /> {t('dashboard.diagnostic.view.completed')}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showNewOrder && (
                <SharedTestModal
                    patientId={patient.id}
                    role="DIAGNOSTIC"
                    onClose={() => setShowNewOrder(false)}
                    onSuccess={() => fetchOrders()}
                    preSelectedTests={testsToBill}
                />
            )}

            {uploadOrderId && (
                <UploadModal
                    onClose={() => setUploadOrderId(null)}
                    onSuccess={() => { markCompleted(uploadOrderId); setUploadOrderId(null); }}
                    patientId={patient.id}
                />
            )}
        </div>
    );
}