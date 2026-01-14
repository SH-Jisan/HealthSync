import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, CheckCircle, Upload, Plus, Prescription, Flask, CaretLeft } from 'phosphor-react';
import UploadModal from '../upload/UploadModal';
import SharedTestModal from '../dashboard/widgets/SharedTestModal';
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

interface DoctorTestOrder {
    id: string;
    title: string;
    key_findings: string[];
    created_at: string;
    uploader: { full_name: string; };
}

interface Props {
    patient: Patient;
    onBack: () => void;
}

export default function DiagnosticPatientView({ patient, onBack }: Props) {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [doctorOrders, setDoctorOrders] = useState<DoctorTestOrder[]>([]);
    const [showNewOrder, setShowNewOrder] = useState(false);
    const [uploadOrderId, setUploadOrderId] = useState<string | null>(null);
    const [testsToBill, setTestsToBill] = useState<string[]>([]);

    const fetchOrders = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('patient_payments')
            .select('*')
            .eq('patient_id', patient.id)
            .eq('provider_id', user.id)
            .order('created_at', { ascending: false });
        if (data) setOrders(data as Order[]);
    };

    const fetchDoctorOrders = async () => {
        const { data, error } = await supabase.from('medical_events')
            .select('id, title, key_findings, created_at, uploader:uploader_id(full_name)')
            .eq('patient_id', patient.id)
            .eq('event_type', 'TEST_ORDER')
            .order('created_at', { ascending: false })
            .limit(5);

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

    const handleConvertOrder = (testNames: string[]) => {
        setTestsToBill(testNames);
        setShowNewOrder(true);
    };

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.header}>
                <button onClick={onBack} className={styles.backBtn}>
                    <CaretLeft size={24} weight="bold" />
                    <span>{t('common.back')}</span>
                </button>
                <div className={styles.patientInfo}>
                    <h2 className={styles.patientName}>{patient.full_name}</h2>
                    <span className={styles.patientContact}>{patient.phone || patient.email}</span>
                </div>
            </div>

            <div className={styles.content}>
                {/* Doctor's Pending Orders Section */}
                {doctorOrders.length > 0 && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            <Prescription size={24} weight="duotone" className={styles.sectionIcon} />
                            {t('dashboard.diagnostic.view.doctor_orders')}
                        </h3>
                        <div className={styles.cardGrid}>
                            {doctorOrders.map(docOrder => (
                                <motion.div
                                    key={docOrder.id}
                                    className={styles.docOrderCard}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className={styles.cardHeader}>
                                        <div className={styles.docInfo}>
                                            <span className={styles.docName}>
                                                {t('dashboard.diagnostic.view.dr_prefix')} {docOrder.uploader?.full_name}
                                            </span>
                                            <span className={styles.docDate}>
                                                {new Date(docOrder.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.testList}>
                                        <span className={styles.label}>{t('dashboard.diagnostic.view.findings')}:</span>
                                        <p>{docOrder.key_findings && docOrder.key_findings.join(', ')}</p>
                                    </div>
                                    <button className={styles.actionBtn} onClick={() => handleConvertOrder(docOrder.key_findings)}>
                                        <Flask size={18} weight="bold" />
                                        {t('dashboard.diagnostic.view.create_bill')}
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Diagnostic Center's Orders */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>
                            <Flask size={24} weight="duotone" className={styles.sectionIcon} />
                            {t('patient.prescriptions.tab_tests')}
                        </h3>
                        <button onClick={() => { setTestsToBill([]); setShowNewOrder(true); }} className={styles.primaryBtn}>
                            <Plus size={18} weight="bold" />
                            {t('dashboard.diagnostic.view.new_order_btn')}
                        </button>
                    </div>

                    <div className={styles.ordersList}>
                        {orders.map(order => (
                            <div key={order.id} className={`${styles.orderRow} ${order.report_status === 'COMPLETED' ? styles.completed : ''}`}>
                                <div className={styles.orderMain}>
                                    <h4 className={styles.testTitle}>{order.test_names.join(', ')}</h4>
                                    <small className={styles.timestamp}>{new Date(order.created_at).toLocaleString()}</small>
                                </div>
                                <div className={styles.orderMeta}>
                                    <span className={styles.amount}>৳{order.total_amount}</span>
                                    <span
                                        onClick={() => togglePayment(order)}
                                        className={`${styles.badge} ${order.status === 'PAID' ? styles.badgeSuccess : styles.badgeWarning}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <div className={styles.orderActions}>
                                    {order.report_status === 'PENDING' ? (
                                        <button onClick={() => setUploadOrderId(order.id)} className={styles.uploadBtn}>
                                            <Upload size={18} /> {t('dashboard.diagnostic.view.upload_report')}
                                        </button>
                                    ) : (
                                        <span className={styles.statusText}>
                                            <CheckCircle size={20} weight="fill" /> {t('dashboard.diagnostic.view.completed')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>{t('appointments.no_diagnostics')}</p>
                            </div>
                        )}
                    </div>
                </div>
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
        </motion.div>
    );
}